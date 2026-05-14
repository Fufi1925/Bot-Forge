# 🤖 BotForge

**Der futuristische All-in-One Discord-Bot mit modernem Web-Dashboard.**

BotForge ist ein Public-Bot, gebaut für Hunderte von Servern. Komplett über das Dashboard konfigurierbar, mit Live-Stats, AutoMod, Tickets, Music, Logging und 40+ weiteren Modulen.

---

## ✨ Features

| Modul | Beschreibung |
|-------|-------------|
| 🛡️ **AutoMod 2.0** | Beleidigungen, Spam, Links, Invites, Caps, Mass-Mentions, NSFW |
| 🎫 **Tickets** | Kategorien, Panel, Transcripts, Team-Zuweisung |
| 🎵 **Music** | YouTube, Spotify, SoundCloud über Lavalink |
| 🎉 **Welcome/Leave** | Animiertes Banner-Card, Auto-Role, DM |
| 📊 **Leveling** | XP, Rank-Card, Leaderboard, Rollen-Rewards |
| 📝 **Advanced Logging** | Alle Events — auch Bot-Aktionen |
| 🔨 **Moderation** | ban, kick, timeout, warn — mit automatischen DMs |
| 🎨 **Embed Builder** | Drag & Drop, Banner-Upload, Live-Preview |
| 🎭 **Custom Commands** | Eigene `/` Commands mit Variablen |
| 😀 **Custom Emojis** | Upload direkt über Dashboard |

---

## 🌐 Website & Dashboard

Die Website liegt in diesem Repo (React + Vite + Tailwind).

```bash
npm install
npm run dev      # lokaler Dev-Server
npm run build    # Production-Build → dist/
```

---

## 🤖 Bot (Python)

Der Bot-Code liegt im `bot/` Ordner.

```bash
cd bot
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env   # und Werte eintragen
python bot.py
```

### Struktur

```
bot/
├── bot.py             # Haupt-Bot, lädt alle Cogs
├── config.py          # Secrets aus Environment
├── dashboard.py       # Flask-Dashboard + OAuth
└── cogs/
    ├── automod.py     # AutoMod 2.0
    ├── tickets.py     # Ticket-System
    ├── music.py       # Lavalink-Player
    ├── welcome.py     # Welcome/Leave
    ├── levels.py      # Leveling
    ├── logging.py     # Advanced Logging
    ├── moderation.py  # Mod-Commands mit DMs
    └── utility.py     # Stats, Help, Custom Commands, Emoji
```

---

## 🚀 Hosting auf Railway

1. Neues Projekt auf [railway.app](https://railway.app)
2. Repo verbinden
3. **Root Directory:** `bot`
4. **Start Command:** `python bot.py` (oder Procfile verwenden)
5. **Environment Variables** aus `.env.example` eintragen
6. **MongoDB** und **Lavalink** (optional für Music) als zusätzliche Services hinzufügen

### Dashboard-API

Der Bot startet automatisch ein Flask-Dashboard auf Port `5000` (konfigurierbar über `PORT`). Diese API wird vom React-Frontend aufgerufen.

**Endpoints:**
- `GET /api/login` — Discord OAuth starten
- `GET /callback` — OAuth Callback
- `GET /api/me` — Aktueller User
- `GET /api/guilds` — Server-Liste
- `GET /api/guilds/<id>/config` — Server-Config
- `POST /api/guilds/<id>/config` — Config updaten
- `GET /api/stats` — Live Bot-Stats
- `GET /health` — Health-Check

---

## 🔐 Secrets

**NIEMALS** echte Tokens ins Repo committen!

Nutze:
- Lokal: `.env` (gitignored)
- Railway: Environment Variables im Dashboard

---

## 📦 Commands

Über 100 Slash-Commands in 8 Kategorien — alle mit `/help` oder auf [botforge.app/commands](https://botforge.app/commands) sichtbar.

---

## 🧱 Tech-Stack

- **Bot:** Python 3.11 · discord.py · motor · wavelink
- **Dashboard:** Flask · Discord OAuth2
- **DB:** MongoDB Atlas
- **Website:** React · TypeScript · Vite · Tailwind · framer-motion · lucide-react
- **Hosting:** Railway

---

## 📄 License

MIT — nutze, forke, verbessere.

---

Made with 💜 by BotForge · Not affiliated with Discord Inc.
