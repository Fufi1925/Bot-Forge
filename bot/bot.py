"""BotForge — Futuristischer Discord Bot v2.0
Haupt-Datei mit Status-Rotation, Embed-Farben, und allen Cogs.
"""

import os
import asyncio
import logging
import datetime
from pathlib import Path

import discord
from discord.ext import commands, tasks
from motor.motor_asyncio import AsyncIOMotorClient

from config import Config
from dashboard import start_dashboard

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger("botforge")


# Embed-Farben für verschiedene Nachrichtentypen
class EmbedColors:
    SUCCESS = 0x22C55E      # Grün
    ERROR = 0xEF4444        # Rot
    WARNING = 0xF59E0B      # Gelb/Orange
    INFO = 0x3B82F6         # Blau
    PRIMARY = 0x7C3AED      # Violett (BotForge Hauptfarbe)
    MUSIC = 0xA855F7        # Lila
    TICKET = 0xF59E0B       # Orange
    LEVEL = 0xEAB308        # Gold
    MOD = 0xEF4444          # Rot
    WELCOME = 0x22C55E      # Grün
    LEAVE = 0xEF4444        # Rot
    LOG = 0x6B7280          # Grau


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
            status=discord.Status.online,
        )
        self.db = None
        self.config_cache: dict[int, dict] = {}
        self.command_stats: dict[str, int] = {}
        self.boot_time = None
        self.status_index = 0

    async def setup_hook(self):
        # MongoDB connection
        if Config.MONGO_URI:
            self.mongo = AsyncIOMotorClient(Config.MONGO_URI)
            self.db = self.mongo.botforge
            log.info("✅ MongoDB verbunden")
        else:
            log.warning("⚠️ Kein MONGO_URI — In-Memory Fallback")

        # Cogs laden
        cogs_dir = Path(__file__).parent / "cogs"
        for file in cogs_dir.glob("*.py"):
            if file.name.startswith("_"):
                continue
            try:
                await self.load_extension(f"cogs.{file.stem}")
                log.info(f"✅ Cog geladen: {file.stem}")
            except Exception as e:
                log.error(f"❌ Cog {file.stem} Fehler: {e}")

        # Slash Commands syncen
        try:
            synced = await self.tree.sync()
            log.info(f"✅ {len(synced)} Slash Commands gesynct")
        except Exception as e:
            log.error(f"❌ Sync Fehler: {e}")

        # Status-Rotation starten
        self.status_rotation.start()

    async def on_ready(self):
        self.boot_time = datetime.datetime.utcnow()
        log.info(f"🚀 BotForge online als {self.user} (ID: {self.user.id})")
        log.info(f"📊 Auf {len(self.guilds)} Servern · {sum(g.member_count or 0 for g in self.guilds)} User")

    @tasks.loop(seconds=10)
    async def status_rotation(self):
        """Wechselt den Bot-Status alle 10 Sekunden."""
        statuses = [
            discord.Activity(type=discord.ActivityType.watching, name=f"{len(self.guilds)} Server"),
            discord.Activity(type=discord.ActivityType.listening, name="/help"),
            discord.Activity(type=discord.ActivityType.playing, name="BotForge v2.0"),
            discord.Activity(type=discord.ActivityType.watching, name="botforge.app"),
            discord.Activity(type=discord.ActivityType.competing, name="mit Commands"),
            discord.Activity(type=discord.ActivityType.listening, name=f"{sum(g.member_count or 0 for g in self.guilds)} User"),
        ]
        activity = statuses[self.status_index % len(statuses)]
        await self.change_presence(activity=activity, status=discord.Status.online)
        self.status_index += 1

    @status_rotation.before_loop
    async def before_status(self):
        await self.wait_until_ready()

    async def on_guild_join(self, guild: discord.Guild):
        log.info(f"✨ Neuer Server: {guild.name} ({guild.id})")
        if self.db:
            await self.db.guilds.update_one(
                {"_id": guild.id},
                {"$set": {"name": guild.name, "owner_id": guild.owner_id, "joined": True, "joined_at": datetime.datetime.utcnow()}},
                upsert=True,
            )

    async def on_guild_remove(self, guild: discord.Guild):
        log.info(f"👋 Server verlassen: {guild.name}")
        if self.db:
            await self.db.guilds.update_one({"_id": guild.id}, {"$set": {"joined": False}})

    async def on_app_command_completion(self, itx: discord.Interaction, command: discord.app_commands.Command):
        """Trackt Command-Statistiken."""
        self.command_stats[command.name] = self.command_stats.get(command.name, 0) + 1
        if self.db:
            await self.db.command_stats.update_one(
                {"guild": itx.guild_id, "command": command.name},
                {"$inc": {"count": 1}, "$set": {"last_used": datetime.datetime.utcnow()}},
                upsert=True,
            )

    async def on_command_error(self, ctx: commands.Context, error: commands.CommandError):
        if isinstance(error, commands.MissingPermissions):
            embed = discord.Embed(
                title="❌ Fehlende Berechtigungen",
                description="Du hast nicht die nötigen Rechte für diesen Befehl.",
                color=EmbedColors.ERROR,
            )
            embed.set_footer(text="BotForge", icon_url=self.user.display_avatar.url)
            await ctx.reply(embed=embed, delete_after=10)
        elif isinstance(error, commands.CommandNotFound):
            return
        else:
            log.error(f"Command Error: {error}")
            embed = discord.Embed(
                title="❌ Fehler",
                description=f"Ein Fehler ist aufgetreten:\n```{error}```",
                color=EmbedColors.ERROR,
            )
            embed.set_footer(text="BotForge", icon_url=self.user.display_avatar.url)
            await ctx.reply(embed=embed, delete_after=15)

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
