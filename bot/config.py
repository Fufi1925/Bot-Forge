"""Config — lädt alle Secrets aus der Umgebung (.env / Railway)."""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Discord
    TOKEN = os.getenv("DISCORD_TOKEN", "")
    CLIENT_ID = os.getenv("DISCORD_CLIENT_ID", "")
    CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET", "")
    PUBLIC_KEY = os.getenv("DISCORD_PUBLIC_KEY", "")
    PREFIX = os.getenv("PREFIX", "!")

    # Dashboard OAuth
    REDIRECT_URI = os.getenv("REDIRECT_URI", "http://localhost:5000/callback")
    SESSION_SECRET = os.getenv("SESSION_SECRET", "change-me-please")

    # Database
    MONGO_URI = os.getenv("MONGO_URI", "")

    # Music (Lavalink)
    LAVALINK_HOST = os.getenv("LAVALINK_HOST", "localhost")
    LAVALINK_PORT = int(os.getenv("LAVALINK_PORT", "2333"))
    LAVALINK_PASSWORD = os.getenv("LAVALINK_PASSWORD", "youshallnotpass")

    # Dashboard
    DASHBOARD_PORT = int(os.getenv("PORT", "5000"))
    DASHBOARD_HOST = os.getenv("DASHBOARD_HOST", "0.0.0.0")
