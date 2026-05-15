"""BotForge — Unified Server
Serviert die statische Website + Dashboard API + Bot in einem Prozess.
Ideal für Railway: Ein Service, alles drin.

Ablauf:
1. Flask bedient statische Dateien aus ../dist/
2. Flask bedient /api/* Endpoints für Dashboard
3. Bot läuft im Hintergrund-Thread
"""

import asyncio
import os
import threading
import time
from functools import wraps

import requests
from flask import Flask, jsonify, redirect, request, session, send_from_directory

from config import Config

# Flask App
app = Flask(__name__, static_folder=None)  # Wir bedienen statisch selbst
app.secret_key = Config.SESSION_SECRET

DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist"))
_bot = None


def get_bot():
    return _bot


def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "user" not in session:
            return jsonify({"error": "unauthorized"}), 401
        return f(*args, **kwargs)
    return wrapper


# ---------- Static Website (SPA) ----------
@app.route("/")
@app.route("/dashboard")
@app.route("/dashboard/<path:_>")
@app.route("/status")
@app.route("/commands")
@app.route("/terms")
@app.route("/privacy")
def serve_spa(**kwargs):
    """Serviert die React SPA. Alle nicht-API-Routen gehen an index.html."""
    return send_from_directory(DIST_DIR, "index.html")


@app.route("/static/<path:filename>")
def serve_static(filename):
    return send_from_directory(os.path.join(DIST_DIR, "static"), filename)


@app.route("/favicon.ico")
def favicon():
    return send_from_directory(DIST_DIR, "favicon.ico", mimetype="image/x-icon")


# ---------- Discord OAuth ----------
DISCORD_API = "https://discord.com/api/v10"


def get_user(token: str) -> dict:
    r = requests.get(f"{DISCORD_API}/users/@me", headers={"Authorization": f"Bearer {token}"})
    return r.json()


def get_guilds(token: str) -> list:
    r = requests.get(f"{DISCORD_API}/users/@me/guilds", headers={"Authorization": f"Bearer {token}"})
    return r.json()


def exchange_code(code: str) -> dict:
    data = {
        "client_id": Config.CLIENT_ID,
        "client_secret": Config.CLIENT_SECRET,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": Config.REDIRECT_URI,
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    r = requests.post(f"{DISCORD_API}/oauth2/token", data=data, headers=headers)
    return r.json()


@app.route("/api/login")
def login():
    url = (
        f"https://discord.com/api/oauth2/authorize?client_id={Config.CLIENT_ID}"
        f"&redirect_uri={Config.REDIRECT_URI}&response_type=code&scope=identify%20guilds"
    )
    return redirect(url)


@app.route("/api/callback")
def callback():
    """OAuth Callback — speichert User + Token in Session."""
    code = request.args.get("code")
    if not code:
        return redirect("/dashboard?error=missing_code")
    token_data = exchange_code(code)
    access_token = token_data.get("access_token")
    if not access_token:
        return redirect("/dashboard?error=token_failed")
    user = get_user(access_token)
    session["user"] = user
    session["access_token"] = access_token
    session["token_expiry"] = time.time() + token_data.get("expires_in", 3600)
    return redirect("/dashboard?login=success")


@app.route("/api/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})


# ---------- API Endpoints ----------
@app.route("/api/me")
@login_required
def me():
    return jsonify(session["user"])


@app.route("/api/guilds")
@login_required
def guilds():
    user_guilds = get_guilds(session["access_token"])
    bot = get_bot()
    bot_guild_ids = {g.id for g in bot.guilds} if bot else set()
    MANAGE_GUILD = 0x20
    result = []
    for g in user_guilds:
        perms = int(g.get("permissions", 0))
        if (perms & MANAGE_GUILD) and int(g["id"]) in bot_guild_ids:
            result.append(g)
    return jsonify(result)


@app.route("/api/guilds/<guild_id>/config")
@login_required
def guild_config(guild_id: str):
    bot = get_bot()
    if not bot:
        return jsonify({"error": "bot not ready"}), 503

    cfg = None
    if bot.db:
        loop = asyncio.new_event_loop()
        try:
            cfg = loop.run_until_complete(bot.db.configs.find_one({"_id": int(guild_id)}))
        finally:
            loop.close()
    return jsonify(cfg or {"_id": int(guild_id)})


@app.route("/api/guilds/<guild_id>/config", methods=["POST"])
@login_required
def update_guild_config(guild_id: str):
    bot = get_bot()
    if not bot or not bot.db:
        return jsonify({"error": "bot not ready"}), 503
    data = request.json
    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(
            bot.db.configs.update_one({"_id": int(guild_id)}, {"$set": data}, upsert=True)
        )
    finally:
        loop.close()
    bot.config_cache.pop(int(guild_id), None)
    return jsonify({"ok": True})


@app.route("/api/stats")
def stats():
    """Live Bot-Stats — wird von der Website aufgerufen."""
    bot = get_bot()
    if not bot:
        return jsonify({"guilds": 0, "users": 0, "ping": 0, "uptime": 0, "commands": {}})
    uptime = int(time.time() - bot.boot_time.timestamp()) if bot.boot_time else 0
    return jsonify({
        "guilds": len(bot.guilds),
        "users": sum(g.member_count or 0 for g in bot.guilds),
        "channels": sum(len(g.channels) for g in bot.guilds),
        "ping": round(bot.latency * 1000),
        "uptime": uptime,
        "commands": bot.command_stats,
        "version": "2.0.0",
    })


@app.route("/health")
def health():
    bot = get_bot()
    return jsonify({
        "status": "ok",
        "bot_ready": bot is not None and bot.is_ready(),
        "guilds": len(bot.guilds) if bot else 0,
    }), 200


def start_flask():
    """Startet Flask im Hintergrund-Thread."""
    app.run(
        host=Config.DASHBOARD_HOST,
        port=Config.DASHBOARD_PORT,
        use_reloader=False,
        threaded=True,
    )


async def start_dashboard(bot):
    """Wird vom Bot aufgerufen — startet Flask + speichert Bot-Referenz."""
    global _bot
    _bot = bot
    threading.Thread(target=start_flask, daemon=True).start()
