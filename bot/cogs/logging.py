"""Advanced Logging — loggt ALLES, auch Bot-Aktionen."""

import datetime
import discord
from discord.ext import commands


class Logging(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    async def _send_log(self, guild: discord.Guild, key: str, embed: discord.Embed):
        cfg = await self.bot.get_guild_config(guild.id)
        log_cfg = cfg.get("logging", {})
        if not log_cfg.get("enabled"):
            return
        events = log_cfg.get("events", {})
        if key in events and not events[key]:
            return
        # Per-Channel Zuweisung
        channel_map = log_cfg.get("channel_map", {})
        ch_id = channel_map.get(key) or log_cfg.get("channel")
        if not ch_id:
            return
        ch = guild.get_channel(int(ch_id))
        if not ch:
            return
        try:
            await ch.send(embed=embed)
        except discord.Forbidden:
            pass

    # ---- Events ----
    @commands.Cog.listener()
    async def on_message_delete(self, msg: discord.Message):
        if not msg.guild or msg.author.bot:
            return
        e = discord.Embed(title="🗑️ Nachricht gelöscht", color=0xEF4444, timestamp=datetime.datetime.utcnow())
        e.description = msg.content[:1024] or "*leer*"
        e.add_field(name="Author", value=msg.author.mention, inline=True)
        e.add_field(name="Channel", value=msg.channel.mention, inline=True)
        if msg.attachments:
            e.add_field(name="Anhänge", value=str(len(msg.attachments)), inline=True)
        await self._send_log(msg.guild, "message_delete", e)

    @commands.Cog.listener()
    async def on_message_edit(self, before: discord.Message, after: discord.Message):
        if not before.guild or before.author.bot or before.content == after.content:
            return
        e = discord.Embed(title="✏️ Nachricht bearbeitet", color=0xF59E0B, timestamp=datetime.datetime.utcnow())
        e.add_field(name="Author", value=before.author.mention, inline=True)
        e.add_field(name="Channel", value=before.channel.mention, inline=True)
        e.add_field(name="Vorher", value=before.content[:1024] or "*leer*", inline=False)
        e.add_field(name="Nachher", value=after.content[:1024] or "*leer*", inline=False)
        e.add_field(name="Link", value=f"[Jump]({after.jump_url})", inline=False)
        await self._send_log(before.guild, "message_edit", e)

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        e = discord.Embed(title="📥 Member joined", color=0x22C55E, timestamp=datetime.datetime.utcnow())
        e.description = f"{member.mention} ({member.id})"
        e.add_field(name="Account erstellt", value=f"<t:{int(member.created_at.timestamp())}:R>", inline=True)
        e.set_thumbnail(url=member.display_avatar.url)
        await self._send_log(member.guild, "member_join", e)

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        e = discord.Embed(title="📤 Member left", color=0xEF4444, timestamp=datetime.datetime.utcnow())
        e.description = f"{member.mention} ({member.id})"
        e.add_field(name="Rollen", value=", ".join(r.name for r in member.roles[1:]) or "keine", inline=False)
        await self._send_log(member.guild, "member_leave", e)

    @commands.Cog.listener()
    async def on_member_ban(self, guild: discord.Guild, user: discord.User):
        e = discord.Embed(title="🔨 Member gebannt", color=0xEF4444, timestamp=datetime.datetime.utcnow())
        e.description = f"{user.mention} ({user.id})"
        await self._send_log(guild, "member_ban", e)

    @commands.Cog.listener()
    async def on_member_unban(self, guild: discord.Guild, user: discord.User):
        e = discord.Embed(title="✅ Member entbannt", color=0x22C55E, timestamp=datetime.datetime.utcnow())
        e.description = f"{user.mention} ({user.id})"
        await self._send_log(guild, "member_unban", e)

    @commands.Cog.listener()
    async def on_voice_state_update(self, member: discord.Member, before: discord.VoiceState, after: discord.VoiceState):
        if before.channel == after.channel:
            return
        if not before.channel and after.channel:
            e = discord.Embed(title="🎤 Voice joined", color=0x22C55E)
            e.description = f"{member.mention} → {after.channel.mention}"
        elif before.channel and not after.channel:
            e = discord.Embed(title="🔇 Voice left", color=0xEF4444)
            e.description = f"{member.mention} ← {before.channel.mention}"
        else:
            e = discord.Embed(title="🔄 Voice switched", color=0xF59E0B)
            e.description = f"{member.mention}: {before.channel.mention} → {after.channel.mention}"
        e.timestamp = datetime.datetime.utcnow()
        await self._send_log(member.guild, "voice", e)

    @commands.Cog.listener()
    async def on_guild_channel_create(self, channel: discord.abc.GuildChannel):
        e = discord.Embed(title="➕ Channel erstellt", color=0x22C55E, timestamp=datetime.datetime.utcnow())
        e.description = f"{channel.mention} ({channel.id})"
        await self._send_log(channel.guild, "channel_create", e)

    @commands.Cog.listener()
    async def on_guild_channel_delete(self, channel: discord.abc.GuildChannel):
        e = discord.Embed(title="➖ Channel gelöscht", color=0xEF4444, timestamp=datetime.datetime.utcnow())
        e.description = f"#{channel.name} ({channel.id})"
        await self._send_log(channel.guild, "channel_delete", e)

    @commands.Cog.listener()
    async def on_guild_role_create(self, role: discord.Role):
        e = discord.Embed(title="➕ Rolle erstellt", color=0x22C55E, timestamp=datetime.datetime.utcnow())
        e.description = f"{role.mention}"
        await self._send_log(role.guild, "role_create", e)

    @commands.Cog.listener()
    async def on_guild_role_delete(self, role: discord.Role):
        e = discord.Embed(title="➖ Rolle gelöscht", color=0xEF4444, timestamp=datetime.datetime.utcnow())
        e.description = f"{role.name}"
        await self._send_log(role.guild, "role_delete", e)

    @commands.Cog.listener()
    async def on_member_update(self, before: discord.Member, after: discord.Member):
        if before.nick != after.nick:
            e = discord.Embed(title="📝 Nickname geändert", color=0xF59E0B, timestamp=datetime.datetime.utcnow())
            e.description = f"{after.mention}: `{before.nick}` → `{after.nick}`"
            await self._send_log(after.guild, "nick_change", e)


async def setup(bot):
    await bot.add_cog(Logging(bot))
