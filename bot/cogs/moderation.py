"""Moderation — ban, kick, timeout, warn mit automatischen DMs."""

import datetime
import discord
from discord import app_commands
from discord.ext import commands


def parse_duration(s: str) -> datetime.timedelta | None:
    """Parse z. B. '10m', '1h', '2d', '30s'."""
    if not s:
        return None
    units = {"s": 1, "m": 60, "h": 3600, "d": 86400, "w": 604800}
    try:
        return datetime.timedelta(seconds=int(s[:-1]) * units[s[-1]])
    except Exception:
        return None


class Moderation(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    async def _dm_user(self, user: discord.User, guild: discord.Guild, action: str, reason: str, moderator: discord.User, duration: str | None = None):
        embed = discord.Embed(
            title=f"⚠️ Mod-Aktion: {action}",
            color=0xEF4444,
            timestamp=datetime.datetime.utcnow(),
        )
        embed.add_field(name="Server", value=guild.name, inline=True)
        embed.add_field(name="Moderator", value=str(moderator), inline=True)
        embed.add_field(name="Grund", value=reason or "Kein Grund angegeben", inline=False)
        if duration:
            embed.add_field(name="Dauer", value=duration, inline=True)
        embed.set_footer(text="BotForge · Moderation", icon_url=self.bot.user.display_avatar.url)
        try:
            await user.send(embed=embed)
            return True
        except discord.Forbidden:
            return False

    async def _log(self, guild: discord.Guild, action: str, user: discord.User, moderator: discord.User, reason: str, duration: str | None = None):
        cfg = await self.bot.get_guild_config(guild.id)
        ch_id = cfg.get("logging", {}).get("channel")
        if not ch_id:
            return
        ch = guild.get_channel(int(ch_id))
        if not ch:
            return
        embed = discord.Embed(title=f"🔨 {action}", color=0xEF4444, timestamp=datetime.datetime.utcnow())
        embed.add_field(name="User", value=f"{user.mention} ({user.id})", inline=False)
        embed.add_field(name="Moderator", value=moderator.mention, inline=True)
        embed.add_field(name="Grund", value=reason or "—", inline=True)
        if duration:
            embed.add_field(name="Dauer", value=duration, inline=True)
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        try:
            await ch.send(embed=embed)
        except discord.Forbidden:
            pass

    # ---- Commands ----
    @app_commands.command(name="ban", description="Bannt einen User")
    @app_commands.checks.has_permissions(ban_members=True)
    async def ban(self, itx: discord.Interaction, user: discord.Member, grund: str = None, dauer: str = None):
        cfg = await self.bot.get_guild_config(itx.guild.id)
        if cfg.get("mod_dm", {}).get("ban", True):
            await self._dm_user(user, itx.guild, "Ban", grund, itx.user, dauer)
        await itx.guild.ban(user, reason=grund or "Kein Grund", delete_message_days=0)
        await self._log(itx.guild, "Ban", user, itx.user, grund, dauer)
        await itx.response.send_message(f"🔨 {user.mention} wurde gebannt.", ephemeral=True)

    @app_commands.command(name="unban", description="Entbannt einen User")
    @app_commands.checks.has_permissions(ban_members=True)
    async def unban(self, itx: discord.Interaction, user_id: str):
        user = await self.bot.fetch_user(int(user_id))
        await itx.guild.unban(user)
        await self._log(itx.guild, "Unban", user, itx.user, None)
        await itx.response.send_message(f"✅ {user.mention} wurde entbannt.", ephemeral=True)

    @app_commands.command(name="kick", description="Kickt einen User")
    @app_commands.checks.has_permissions(kick_members=True)
    async def kick(self, itx: discord.Interaction, user: discord.Member, grund: str = None):
        cfg = await self.bot.get_guild_config(itx.guild.id)
        if cfg.get("mod_dm", {}).get("kick", True):
            await self._dm_user(user, itx.guild, "Kick", grund, itx.user)
        await user.kick(reason=grund)
        await self._log(itx.guild, "Kick", user, itx.user, grund)
        await itx.response.send_message(f"👢 {user.mention} wurde gekickt.", ephemeral=True)

    @app_commands.command(name="timeout", description="Timeout für einen User")
    @app_commands.checks.has_permissions(moderate_members=True)
    async def timeout(self, itx: discord.Interaction, user: discord.Member, dauer: str = "10m", grund: str = None):
        td = parse_duration(dauer) or datetime.timedelta(minutes=10)
        cfg = await self.bot.get_guild_config(itx.guild.id)
        if cfg.get("mod_dm", {}).get("timeout", True):
            await self._dm_user(user, itx.guild, "Timeout", grund, itx.user, dauer)
        await user.timeout(td, reason=grund)
        await self._log(itx.guild, "Timeout", user, itx.user, grund, dauer)
        await itx.response.send_message(f"⏱️ {user.mention} getimeoutet für {dauer}.", ephemeral=True)

    @app_commands.command(name="untimeout", description="Entfernt Timeout")
    @app_commands.checks.has_permissions(moderate_members=True)
    async def untimeout(self, itx: discord.Interaction, user: discord.Member):
        await user.timeout(None)
        await self._log(itx.guild, "Untimeout", user, itx.user, None)
        await itx.response.send_message(f"✅ Timeout von {user.mention} entfernt.", ephemeral=True)

    @app_commands.command(name="warn", description="Verwarnt einen User")
    @app_commands.checks.has_permissions(moderate_members=True)
    async def warn(self, itx: discord.Interaction, user: discord.Member, grund: str):
        if self.bot.db:
            await self.bot.db.warns.insert_one({
                "guild": itx.guild.id,
                "user": user.id,
                "mod": itx.user.id,
                "reason": grund,
                "time": datetime.datetime.utcnow(),
            })
        cfg = await self.bot.get_guild_config(itx.guild.id)
        if cfg.get("mod_dm", {}).get("warn", True):
            await self._dm_user(user, itx.guild, "Warn", grund, itx.user)
        await self._log(itx.guild, "Warn", user, itx.user, grund)
        await itx.response.send_message(f"⚠️ {user.mention} wurde verwarnt.", ephemeral=True)

    @app_commands.command(name="warnings", description="Listet Warns eines Users")
    async def warnings(self, itx: discord.Interaction, user: discord.Member):
        if not self.bot.db:
            return await itx.response.send_message("Keine DB.", ephemeral=True)
        warns = await self.bot.db.warns.find({"guild": itx.guild.id, "user": user.id}).to_list(100)
        if not warns:
            return await itx.response.send_message(f"{user.mention} hat keine Warns.", ephemeral=True)
        embed = discord.Embed(title=f"Warns von {user}", color=0xF59E0B)
        for i, w in enumerate(warns, 1):
            embed.add_field(name=f"#{i} · <t:{int(w['time'].timestamp())}:R>", value=w["reason"], inline=False)
        await itx.response.send_message(embed=embed, ephemeral=True)

    @app_commands.command(name="clear", description="Löscht Nachrichten")
    @app_commands.checks.has_permissions(manage_messages=True)
    async def clear(self, itx: discord.Interaction, amount: int = 10):
        deleted = await itx.channel.purge(limit=amount)
        await itx.response.send_message(f"🧹 {len(deleted)} Nachrichten gelöscht.", ephemeral=True, delete_after=5)


async def setup(bot):
    await bot.add_cog(Moderation(bot))
