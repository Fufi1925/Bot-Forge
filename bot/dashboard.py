"""Flask Dashboard mit Discord OAuth2 + keep-alive Endpoint.

Bietet die API-Endpoints, die das React-Frontend aufruft.
In Production hostet Railway diesen Prozess neben dem Bot.
"""

import asyncio
import threading
import time
from functools import wraps

import requests
from flask import Flask, jsonify, redirect, request, session

from config import Config

app = Flask(__name__)
app.secret_key = Config.SESSION_SECRET

# Der Bot wird beim Start gesetzt
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


# ---------- OAuth ----------
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
    r = requests.post(f"{DISCORD_API}/oauth2/token", data=data)
    return r.json()


@app.route("/api/login")
def login():
    url = (
        f"https://discord.com/api/oauth2/authorize?client_id={Config.CLIENT_ID}"
        f"&redirect_uri={Config.REDIRECT_URI}&response_type=code&scope=identify%20guilds"
    )
    return redirect(url)


@app.route("/callback")
def callback():
    code = request.args.get("code")
    if not code:
        return "Missing code", 400
    token_data = exchange_code(code)
    access_token = token_data.get("access_token")
    if not access_token:
        return "Token exchange failed", 400
    user = get_user(access_token)
    session["user"] = user
    session["access_token"] = access_token
    return redirect("/dashboard")


@app.route("/api/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})


# ---------- API ----------
@app.route("/api/me")
@login_required
def me():
    return jsonify(session["user"])


@app.route("/api/guilds")
@login_required
def guilds():
    user_guilds = get_guilds(session["access_token"])
    # Nur Server, auf denen User Manage Server hat und Bot drauf ist
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
async def guild_config(guild_id: str):
    bot = get_bot()
    if not bot:
        return jsonify({"error": "bot not ready"}), 503
    cfg = await bot.get_guild_config(int(guild_id))
    return jsonify(cfg)


@app.route("/api/guilds/<guild_id>/config", methods=["POST"])
@login_required
async def update_guild_config(guild_id: str):
    bot = get_bot()
    if not bot:
        return jsonify({"error": "bot not ready"}), 503
    data = request.json
    await bot.save_guild_config(int(guild_id), data)
    return jsonify({"ok": True})


@app.route("/api/stats")
def stats():
    bot = get_bot()
    if not bot:
        return jsonify({"guilds": 0, "users": 0, "ping": 0, "uptime": 0})
    uptime = int(time.time() - bot.boot_time.timestamp()) if bot.boot_time else 0
    return jsonify({
        "guilds": len(bot.guilds),
        "users": sum(g.member_count or 0 for g in bot.guilds),
        "ping": round(bot.latency * 1000),
        "uptime": uptime,
        "commands": bot.command_stats,
    })


@app.route("/health")
def health():
    return jsonify({"status": "ok"}), 200


async def start_dashboard(bot):
    global _bot
    _bot = bot
    # Flask im Hintergrund laufen lassen
    threading.Thread(
        target=lambda: app.run(
            host=Config.DASHBOARD_HOST,
            port=Config.DASHBOARD_PORT,
            use_reloader=False,
        ),
        daemon=True,
    ).start()
