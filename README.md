# 🤖 BotForge

**Der futuristische All-in-One Discord-Bot mit modernem Web-Dashboard.**

> ⚠️ **Wichtig:** BotForge wird **zentral vom Entwickler gehostet**.  
> Du als Server-Owner musst **nichts installieren oder hosten**.  
> Einfach den Bot über den Invite-Link zu deinem Server hinzufügen und per Dashboard konfigurieren.  
> Das Hosting auf Railway.com übernimmt ausschließlich der Bot-Entwickler.

BotForge ist ein **Public-Bot**, gebaut für Hunderte von Servern. Komplett über das Dashboard konfigurierbar, mit Live-Stats, AutoMod, Tickets mit Discord-Dropdown, Music, Logging und 40+ weiteren Modulen.

---

## ✨ Features

| Modul | Beschreibung |
|-------|-------------|
| 🛡️ **AutoMod 2.0** | Beleidigungen, Spam, Links, Invites, Caps, Mass-Mentions, NSFW — mit automatischer DM |
| 🎫 **Tickets** | **Echtes Discord-Dropdown-Menü** mit bis zu 25 Kategorien, Transcripts, Team-Claim |
| 🎵 **Music** | YouTube, Spotify, SoundCloud über Lavalink · 24/7 Mode · Filters |
| 🎉 **Welcome/Leave** | Animiertes Banner-Card (Pillow), Auto-Role, DM |
| 📊 **Leveling** | XP, Rank-Card (Pillow), Leaderboard, Rollen-Rewards |
| 📝 **Advanced Logging** | 25+ Events — auch Bot-Aktionen — pro-Channel Routing |
| 🔨 **Moderation** | ban, kick, timeout, warn — mit automatischen DMs (Grund + Dauer + Moderator) |
| 🎨 **Embed Builder** | Drag & Drop, Banner-Upload, Live-Preview (Footer fix) |
| 🎭 **Custom Commands** | Eigene `/` Commands mit Variablen (`{user}`, `{server}`, ...) |
| 😀 **Custom Emojis** | Upload direkt über Dashboard oder `/emoji` |
| 🎁 **Giveaways** | Button-basierte Verlosungen mit Reroll |
| ❤️ **Reaction Roles** | Dropdown-Menüs für Self-Assign-Rollen |

---

## 🚀 So nutzt du BotForge (als Server-Owner)

### 1️⃣ Bot einladen

Klicke auf den Invite-Link und wähle deinen Server:

```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

Bestätige die Berechtigungen — fertig!

### 2️⃣ Dashboard öffnen

Gehe auf **[botforge.app/dashboard](https://botforge.app/dashboard)** und logge dich mit Discord ein. Wähle deinen Server aus.

### 3️⃣ Konfigurieren

Alle Module lassen sich per Mausklick einstellen:
- Welcome-Nachrichten + Banner
- AutoMod-Filter
- Ticket-Dropdown-Kategorien
- Log-Channels
- Music-Settings
- Leveling-Rewards
- ... und viele mehr

**Kein einziger Command nötig** — aber alle 100+ Commands sind natürlich auch verfügbar.

---

## 🌐 Website

Die Marketing-Website + Dashboard-Frontend liegen im Repo-Root (React + Vite + Tailwind).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Production-Build → dist/
```

Die Website wird **zusammen mit dem Bot vom Entwickler gehostet** (z. B. Vercel für Frontend + Railway für Bot/API).

---

## 🤖 Bot-Code (`bot/`) — nur für den Entwickler relevant

> Dieser Abschnitt ist **nur für den Bot-Entwickler** — nicht für normale Server-Owner.

### Lokales Setup (Entwickler)

```bash
cd bot
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env                           # und Werte eintragen
python bot.py
```

### Struktur

```
bot/
├── bot.py                 # Haupt-Bot, lädt alle Cogs, startet Dashboard
├── config.py              # Secrets aus Environment
├── dashboard.py           # Flask-Dashboard + Discord OAuth2 + REST-API
└── cogs/
    ├── automod.py         # AutoMod 2.0 mit 8 Filtern + DMs
    ├── tickets.py         # Ticket-System mit Discord-Dropdown-Menü
    ├── music.py           # Lavalink-Player (YouTube/Spotify/SoundCloud)
    ├── welcome.py         # Welcome/Leave + Banner-Card
    ├── levels.py          # XP + Rank-Card + Leaderboard
    ├── logging.py         # 15+ Log-Events + pro-Channel Routing
    ├── moderation.py      # ban/kick/timeout/warn mit DMs
    └── utility.py         # Stats, Help, Custom Commands, Emoji, Embed
```

### Dashboard-API (Flask, Port 5000)

Der Bot startet automatisch ein Flask-Dashboard. Dieses wird vom React-Frontend aufgerufen.

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/login` | GET | Discord OAuth starten |
| `/callback` | GET | OAuth Callback |
| `/api/me` | GET | Aktueller User (login required) |
| `/api/guilds` | GET | Server-Liste mit Manage-Guild (login required) |
| `/api/guilds/<id>/config` | GET | Server-Config laden |
| `/api/guilds/<id>/config` | POST | Server-Config speichern |
| `/api/stats` | GET | Live Bot-Stats (public) |
| `/health` | GET | Health-Check |

---

## 🚂 Hosting auf Railway (nur Entwickler!)

> **Nur der Bot-Entwickler hostet auf Railway.** Server-Owner brauchen das nicht.

### Setup

1. Neues Projekt auf [railway.app](https://railway.app) erstellen
2. Repo verbinden (Deploy from GitHub)
3. **Root Directory:** `bot`
4. **Start Command:** `python bot.py` (oder `Procfile` verwenden)
5. **Python Version:** 3.11+
6. **Environment Variables** aus `.env.example` eintragen:

```
DISCORD_TOKEN=***
DISCORD_CLIENT_ID=***
DISCORD_CLIENT_SECRET=***
DISCORD_PUBLIC_KEY=***
MONGO_URI=***
SESSION_SECRET=***
REDIRECT_URI=https://deine-domain.railway.app/callback
PORT=5000
LAVALINK_HOST=...
LAVALINK_PASSWORD=***
```

### Zusätzliche Services auf Railway

- **MongoDB Atlas** (kostenlos bis 512 MB) — für Configs, Warns, Levels, Tickets
- **Lavalink** — für Music (optional, via Docker Image `fredboat/lavalink`)
- **Redis** (optional) — für Caching

### Domains

- Bot-API: `api.botforge.app` → Railway Service
- Website: `botforge.app` → Vercel oder zweiter Railway Service (statisch)

---

## 🔐 Secrets

**NIEMALS** echte Tokens ins Repo committen!

| Umgebung | Wo liegen Secrets? |
|----------|-------------------|
| Lokal | `.env` (gitignored) |
| Railway | Dashboard → Variables |
| Vercel | Project Settings → Environment Variables |

---

## 📦 Commands (100+)

Über 100 Slash-Commands in 8 Kategorien. Alle sichtbar mit `/help` oder auf [botforge.app/commands](https://botforge.app/commands).

**Highlights:**
- `/ticket panel` — sendet Dropdown-Menü
- `/ticket add-category` — Kategorie hinzufügen
- `/play <query>` — Music spielen
- `/automod toggle` — AutoMod an/aus
- `/warn <user> <grund>` — Warn mit automatischer DM
- `/rank` — Rank-Card (generiert via Pillow)
- `/embed` — Embed mit Farbe, Titel, Beschreibung

---

## 🧱 Tech-Stack

| Bereich | Technologie |
|---------|-------------|
| Bot | Python 3.11 · discord.py 2.3+ · motor · wavelink · Pillow |
| Dashboard API | Flask · Discord OAuth2 |
| DB | MongoDB Atlas |
| Music | Lavalink + wavelink |
| Website | React 18 · TypeScript · Vite 7 · Tailwind 4 · lucide-react |
| Hosting | Railway (Bot + API) · Vercel (Website) |

---

## 📄 License

MIT — nutze, forke, verbessere.

---

Made with 💜 by BotForge · Not affiliated with Discord Inc.
