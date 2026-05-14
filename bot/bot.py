"""BotForge — Futuristischer Discord Bot
Haupt-Datei. Lädt alle Cogs, startet Flask keep-alive und den Discord-Bot.
"""

import os
import asyncio
import logging
from pathlib import Path

import discord
from discord.ext import commands
from motor.motor_asyncio import AsyncIOMotorClient

from config import Config
from dashboard import start_dashboard

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger("botforge")


class BotForge(commands.Bot):
    def __init__(self):
        intents = discord.Intents.all()
        intents.message_content = True
        intents.members = True
        intents.presences = True
        super().__init__(
            command_prefix=Config.PREFIX,
            intents=intents,
            help_command=None,
            activity=discord.Activity(type=discord.ActivityType.watching, name="BotForge Dashboard"),
            status=discord.Status.online,
        )
        self.db = None
        self.config_cache: dict[int, dict] = {}
        self.command_stats: dict[str, int] = {}
        self.boot_time = None

    async def setup_hook(self):
        # MongoDB connection
        if Config.MONGO_URI:
            self.mongo = AsyncIOMotorClient(Config.MONGO_URI)
            self.db = self.mongo.botforge
            log.info("MongoDB verbunden")
        else:
            log.warning("Kein MONGO_URI gesetzt — nutze In-Memory Fallback")

        # Cogs laden
        cogs_dir = Path(__file__).parent / "cogs"
        for file in cogs_dir.glob("*.py"):
            if file.name.startswith("_"):
                continue
            try:
                await self.load_extension(f"cogs.{file.stem}")
                log.info(f"Cog geladen: {file.stem}")
            except Exception as e:
                log.error(f"Cog {file.stem} Fehler: {e}")

        # Slash Commands global syncen (beim ersten Start, danach /sync nutzen)
        try:
            synced = await self.tree.sync()
            log.info(f"{len(synced)} Slash Commands gesynct")
        except Exception as e:
            log.error(f"Sync Fehler: {e}")

    async def on_ready(self):
        import datetime
        self.boot_time = datetime.datetime.utcnow()
        log.info(f"BotForge online als {self.user} (ID: {self.user.id})")
        log.info(f"Auf {len(self.guilds)} Servern · {sum(g.member_count or 0 for g in self.guilds)} User")

    async def on_guild_join(self, guild: discord.Guild):
        log.info(f"Neuer Server: {guild.name} ({guild.id})")
        if self.db:
            await self.db.guilds.update_one(
                {"_id": guild.id},
                {"$set": {"name": guild.name, "owner_id": guild.owner_id, "joined": True}},
                upsert=True,
            )

    async def on_guild_remove(self, guild: discord.Guild):
        log.info(f"Server verlassen: {guild.name}")
        if self.db:
            await self.db.guilds.update_one({"_id": guild.id}, {"$set": {"joined": False}})

    async def on_command_error(self, ctx: commands.Context, error: commands.CommandError):
        if isinstance(error, commands.MissingPermissions):
            await ctx.reply("❌ Fehlende Berechtigungen.", delete_after=10)
        elif isinstance(error, commands.CommandNotFound):
            return
        else:
            log.error(f"Command Error: {error}")

    async def get_guild_config(self, guild_id: int) -> dict:
        if guild_id in self.config_cache:
            return self.config_cache[guild_id]
        if self.db:
            cfg = await self.db.configs.find_one({"_id": guild_id})
            if cfg:
                self.config_cache[guild_id] = cfg
                return cfg
        default = {
            "_id": guild_id,
            "prefix": "!",
            "language": "de",
            "welcome": {"enabled": False, "channel": None, "message": "Willkommen {user}!"},
            "leave": {"enabled": False, "channel": None, "message": "{user} hat uns verlassen."},
            "automod": {"enabled": False, "filters": {}, "actions": {}},
            "tickets": {"enabled": False, "category": None, "transcript_channel": None},
            "logging": {"enabled": True, "channel": None, "events": {}},
            "levels": {"enabled": False, "xp_per_msg": 15, "cooldown": 60},
            "music": {"enabled": True, "dj_role": None, "24_7": False},
            "mod_dm": {"warn": True, "timeout": True, "kick": True, "ban": True, "automod": True},
        }
        self.config_cache[guild_id] = default
        return default

    async def save_guild_config(self, guild_id: int, cfg: dict):
        self.config_cache[guild_id] = cfg
        if self.db:
            await self.db.configs.update_one({"_id": guild_id}, {"$set": cfg}, upsert=True)


async def main():
    bot = BotForge()
    # Flask Dashboard im Hintergrund
    asyncio.create_task(start_dashboard(bot))
    async with bot:
        await bot.start(Config.TOKEN)


if __name__ == "__main__":
    asyncio.run(main())
