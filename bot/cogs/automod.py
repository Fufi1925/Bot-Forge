"""AutoMod 2.0 — filtert Beleidigungen, Spam, Links, Invites, Caps, Mentions."""

import re
import datetime
import discord
from discord.ext import commands

INVITE_RE = re.compile(r"(discord\.gg|discord\.com/invite)/[A-Za-z0-9-]+")
LINK_RE = re.compile(r"https?://\S+")
BAD_WORDS = [
    "hure", "nutte", "fick", "fotze", "nazi", "hitler",
    "nigger", "nigga", "faggot", "kike",
]


class AutoMod(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.user_msg_buffer: dict[int, list[float]] = {}  # user_id -> timestamps

    @commands.Cog.listener()
    async def on_message(self, msg: discord.Message):
        if not msg.guild or msg.author.bot:
            return
        if msg.author.guild_permissions.manage_messages:
            return  # Moderatoren immun

        cfg = await self.bot.get_guild_config(msg.guild.id)
        am = cfg.get("automod", {})
        if not am.get("enabled"):
            return

        # Whitelist-Rollen
        whitelist = am.get("whitelist_roles", [])
        if any(r.id in whitelist for r in msg.author.roles):
            return

        reason = None

        # Invites
        if am.get("filters", {}).get("invites", True) and INVITE_RE.search(msg.content):
            reason = "Discord Invite-Link"

        # Links
        elif am.get("filters", {}).get("links", False) and LINK_RE.search(msg.content):
            reason = "Externer Link"

        # Bad Words
        elif am.get("filters", {}).get("badwords", True):
            lower = msg.content.lower()
            if any(b in lower for b in BAD_WORDS):
                reason = "Beleidigung / Hate Speech"

        # Caps
        elif am.get("filters", {}).get("caps", True):
            if len(msg.content) > 10:
                upper = sum(1 for c in msg.content if c.isupper())
                if upper / len(msg.content) > 0.7:
                    reason = "Übermäßiger Caps-Lock"

        # Mass Mentions
        elif am.get("filters", {}).get("massmention", True) and len(msg.mentions) > 5:
            reason = "Massenerwähnungen"

        # Spam (3 gleiche Nachrichten in 5 Sekunden)
        if not reason and am.get("filters", {}).get("spam", True):
            import time
            now = time.time()
            buf = self.user_msg_buffer.setdefault(msg.author.id, [])
            buf.append(now)
            buf = [t for t in buf if now - t < 5]
            self.user_msg_buffer[msg.author.id] = buf
            if len(buf) > 4:
                reason = "Spam"

        if not reason:
            return

        # Aktion ausführen
        try:
            await msg.delete()
        except discord.Forbidden:
            return

        # Embed in Channel
        embed = discord.Embed(
            title="🛡️ AutoMod",
            description=f"{msg.author.mention}, deine Nachricht wurde entfernt.",
            color=0xEF4444,
            timestamp=datetime.datetime.utcnow(),
        )
        embed.add_field(name="Grund", value=reason, inline=False)
        embed.add_field(name="Channel", value=msg.channel.mention, inline=True)
        embed.set_footer(text="BotForge · AutoMod", icon_url=self.bot.user.display_avatar.url)
        warn_msg = await msg.channel.send(embed=embed, delete_after=15)

        # DM an User
        if cfg.get("mod_dm", {}).get("automod", True):
            try:
                dm_embed = discord.Embed(
                    title="⚠️ Nachricht entfernt",
                    description=f"Auf **{msg.guild.name}** wurde deine Nachricht in {msg.channel.mention} entfernt.",
                    color=0xEF4444,
                )
                dm_embed.add_field(name="Grund", value=reason, inline=False)
                dm_embed.set_footer(text="BotForge · AutoMod", icon_url=self.bot.user.display_avatar.url)
                await msg.author.send(embed=dm_embed)
            except discord.Forbidden:
                pass

        # Log
        await self._log_action(msg.guild, msg.author, reason, cfg)

        # Strike-System
        if self.bot.db:
            res = await self.bot.db.automod_strikes.update_one(
                {"guild": msg.guild.id, "user": msg.author.id},
                {"$inc": {"count": 1}, "$set": {"last": datetime.datetime.utcnow()}},
                upsert=True,
            )
            doc = await self.bot.db.automod_strikes.find_one({"guild": msg.guild.id, "user": msg.author.id})
            strikes = doc.get("count", 1)
            if strikes >= 3:
                try:
                    await msg.author.timeout(datetime.timedelta(minutes=10), reason=f"AutoMod: 3 Strikes ({reason})")
                except discord.Forbidden:
                    pass

    async def _log_action(self, guild, user, reason, cfg):
        log_cfg = cfg.get("logging", {})
        if not log_cfg.get("enabled"):
            return
        ch_id = log_cfg.get("channel") or log_cfg.get("mod_channel")
        if not ch_id:
            return
        ch = guild.get_channel(int(ch_id))
        if not ch:
            return
        embed = discord.Embed(
            title="🤖 Bot Aktion · AutoMod",
            description=f"**User:** {user.mention} ({user.id})\n**Grund:** {reason}",
            color=0xEF4444,
            timestamp=datetime.datetime.utcnow(),
        )
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        try:
            await ch.send(embed=embed)
        except discord.Forbidden:
            pass

    # ---- Commands ----
    automod = discord.app_commands.Group(name="automod", description="AutoMod konfigurieren")

    @automod.command(name="toggle", description="AutoMod an/aus")
    @discord.app_commands.checks.has_permissions(manage_guild=True)
    async def toggle(self, itx: discord.Interaction):
        cfg = await self.bot.get_guild_config(itx.guild.id)
        am = cfg.setdefault("automod", {})
        am["enabled"] = not am.get("enabled", False)
        await self.bot.save_guild_config(itx.guild.id, cfg)
        await itx.response.send_message(f"AutoMod ist jetzt {'an' if am['enabled'] else 'aus'}.", ephemeral=True)


async def setup(bot):
    await bot.add_cog(AutoMod(bot))
