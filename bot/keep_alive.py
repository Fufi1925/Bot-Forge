"""
BotForge Keep-Alive Server
Hält den Bot auf Railway.com am Leben
"""
from flask import Flask, jsonify
from threading import Thread
import datetime
import psutil
import os

app = Flask(__name__)

start_time = datetime.datetime.utcnow()

@app.route('/')
def home():
    """Status-Seite mit Bot-Infos"""
    uptime = datetime.datetime.utcnow() - start_time
    uptime_str = f"{uptime.days}d {uptime.seconds // 3600}h {(uptime.seconds % 3600) // 60}m"
    
    try:
        mem = psutil.virtual_memory()
        cpu = psutil.cpu_percent(interval=0.1)
        mem_usage = mem.percent
        mem_total = f"{mem.total // (1024**3)}GB"
        mem_used = f"{mem.used // (1024**3)}GB"
    except:
        cpu = 0
        mem_usage = 0
        mem_total = "N/A"
        mem_used = "N/A"

    return jsonify({
        "bot": "BotForge",
        "version": "3.2.0",
        "status": "online",
        "uptime": uptime_str,
        "performance": {
            "cpu_percent": cpu,
            "memory_percent": mem_usage,
            "memory_used": mem_used,
            "memory_total": mem_total,
        },
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "endpoints": {
            "/": "Status Overview",
            "/api/stats": "Bot Statistics",
            "/api/health": "Health Check",
            "/api/uptime": "Uptime Info",
        }
    })

@app.route('/api/stats')
def stats():
    """API: Bot Statistiken"""
    uptime = datetime.datetime.utcnow() - start_time
    return jsonify({
        "server_count": getattr(stats_state, 'server_count', 0),
        "user_count": getattr(stats_state, 'user_count', 0),
        "channel_count": getattr(stats_state, 'channel_count', 0),
        "command_count": getattr(stats_state, 'command_count', 0),
        "uptime_seconds": uptime.total_seconds(),
        "ping_ms": getattr(stats_state, 'ping', 0),
        "memory_usage": getattr(stats_state, 'memory', 0),
        "cpu_usage": getattr(stats_state, 'cpu', 0),
        "shard_count": 1,
        "voice_connections": getattr(stats_state, 'voice_connections', 0),
    })

@app.route('/api/health')
def health():
    """Health Check Endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.datetime.utcnow().isoformat()})

@app.route('/api/uptime')
def uptime():
    """Uptime Endpoint"""
    up = datetime.datetime.utcnow() - start_time
    return jsonify({
        "uptime": up.total_seconds(),
        "last_restart": start_time.isoformat(),
        "status": "operational"
    })

class StatsState:
    """Shared state between bot and Flask"""
    server_count = 0
    user_count = 0
    channel_count = 0
    command_count = 0
    ping = 23
    memory = 42
    cpu = 12
    voice_connections = 0

stats_state = StatsState()

def update_stats(bot_instance):
    """Aktualisiere Bot-Statistiken für die API"""
    try:
        stats_state.server_count = len(bot_instance.guilds)
        stats_state.user_count = sum(g.member_count for g in bot_instance.guilds)
        stats_state.channel_count = sum(len(g.channels) for g in bot_instance.guilds)
        stats_state.ping = round(bot_instance.latency * 1000)
        stats_state.voice_connections = len(bot_instance.voice_clients)
        try:
            import psutil
            process = psutil.Process(os.getpid())
            stats_state.memory = round(process.memory_percent(), 1)
            stats_state.cpu = round(process.cpu_percent(), 1)
        except:
            pass
    except:
        pass

def run():
    """Starte Flask Server"""
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)

def keep_alive():
    """Starte Keep-Alive in einem separaten Thread"""
    t = Thread(target=run, daemon=True)
    t.start()
    print(f"🟢 Keep-Alive Server gestartet auf Port {os.environ.get('PORT', 5000)}")
