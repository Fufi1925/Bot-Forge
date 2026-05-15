"""Utility Commands — alle mit perfekten Embeds und Farben."""

import datetime
import platform
import discord
from discord import app_commands
from discord.ext import commands

# Embed-Farben importieren
import sys
sys.path.append(str(__import__('pathlib').Path(__file__).parent.parent))
from bot import EmbedColors


class Utility(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    # ---- Core Commands ----
    @app_commands.command(name="ping", description="Zeigt die Bot-Latenz")
    async def ping(self, itx: discord.Interaction):
        latency = round(self.bot.latency * 1000)
        embed = discord.Embed(
            title="🏓 Pong!",
            color=EmbedColors.SUCCESS,
            timestamp=datetime.datetime.utcnow(),
        )
        embed.add_field(name="Gateway Latenz", value=f"`{latency}ms`", inline=True)
        if latency < 50:
            embed.add_field(name="Status", value="🟢 Exzellent", inline=True)
        elif latency < 100:
            embed.add_field(name="Status", value="🟡 Gut", inline=True)
        else:
            embed.add_field(name="Status", value="🔴 Langsam", inline=True)
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed)

    @app_commands.command(name="status", description="Zeigt detaillierte Bot-Statistiken")
    async def status(self, itx: discord.Interaction):
        uptime = datetime.datetime.utcnow() - self.bot.boot_time if self.bot.boot_time else datetime.timedelta(0)
        days = uptime.days
        hours, remainder = divmod(uptime.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        total_members = sum(g.member_count or 0 for g in self.bot.guilds)
        total_channels = sum(len(g.channels) for g in self.bot.guilds)

        embed = discord.Embed(
            title="📊 BotForge Status",
            description="Futuristischer Discord Bot · Alle Systeme operational",
            color=EmbedColors.PRIMARY,
            timestamp=datetime.datetime.utcnow(),
        )

        # Server Stats
        embed.add_field(
            name="🌐 Server",
            value=f"```{len(self.bot.guilds)}```",
            inline=True,
        )
        embed.add_field(
            name="👥 User",
            value=f"```{total_members:,}```",
            inline=True,
        )
        embed.add_field(
            name="💬 Channels",
            value=f"```{total_channels:,}```",
            inline=True,
        )

        # Performance
        embed.add_field(
            name="⚡ Latenz",
            value=f"```{round(self.bot.latency * 1000)}ms```",
            inline=True,
        )
        embed.add_field(
            name="🕐 Uptime",
            value=f"```{days}d {hours}h {minutes}m```",
            inline=True,
        )
        embed.add_field(
            name="🎯 Commands",
            value=f"```{len(self.bot.command_stats)}```",
            inline=True,
        )

        # Tech
        embed.add_field(
            name="🐍 Python",
            value=f"`{platform.python_version()}`",
            inline=True,
        )
        embed.add_field(
            name="📦 discord.py",
            value=f"`{discord.__version__}`",
            inline=True,
        )
        embed.add_field(
            name="💾 Database",
            value="`MongoDB`" if self.bot.db else "`Memory`",
            inline=True,
        )

        # Top Commands
        if self.bot.command_stats:
            top = sorted(self.bot.command_stats.items(), key=lambda x: x[1], reverse=True)[:5]
            top_str = "\n".join(f"`/{name}` — {count}x" for name, count in top)
            embed.add_field(
                name="🔥 Top Commands",
                value=top_str,
                inline=False,
            )

        embed.set_thumbnail(url=self.bot.user.display_avatar.url)
        embed.set_footer(text="BotForge v2.0 · botforge.app", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed)

    @app_commands.command(name="help", description="Zeigt alle verfügbaren Commands")
    async def help(self, itx: discord.Interaction):
        embed = discord.Embed(
            title="🛠️ BotForge Hilfe",
            description=(
                "**Futuristischer All-in-One Discord Bot**\n\n"
                "Alle Commands sind als Slash-Commands verfügbar.\n"
                "Nutze `/` um alle Commands zu sehen."
            ),
            color=EmbedColors.PRIMARY,
            timestamp=datetime.datetime.utcnow(),
        )

        embed.add_field(
            name="🛡️ Moderation",
            value="`/ban` `/kick` `/timeout` `/warn` `/mute` `/clear`",
            inline=False,
        )
        embed.add_field(
            name="🎫 Tickets",
            value="`/ticket panel` `/ticket close` `/ticket add` `/ticket stats`",
            inline=False,
        )
        embed.add_field(
            name="🎵 Music",
            value="`/play` `/pause` `/skip` `/stop` `/queue` `/volume`",
            inline=False,
        )
        embed.add_field(
            name="📊 Leveling",
            value="`/rank` `/leaderboard` `/level`",
            inline=False,
        )
        embed.add_field(
            name="⚙️ Config",
            value="`/automod` `/welcome` `/logging` `/embed`",
            inline=False,
        )
        embed.add_field(
            name="🔧 Utility",
            value="`/ping` `/status` `/serverinfo` `/userinfo` `/avatar`",
            inline=False,
        )

        embed.add_field(
            name="🌐 Links",
            value="[Dashboard](https://botforge.app/dashboard) · [Commands](https://botforge.app/commands) · [Status](https://botforge.app/status)",
            inline=False,
        )

        embed.set_thumbnail(url=self.bot.user.display_avatar.url)
        embed.set_footer(text="BotForge v2.0 · 100+ Commands", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed)

    @app_commands.command(name="serverinfo", description="Zeigt Informationen über den Server")
    async def serverinfo(self, itx: discord.Interaction):
        g = itx.guild
        embed = discord.Embed(
            title=g.name,
            color=EmbedColors.INFO,
            timestamp=datetime.datetime.utcnow(),
        )

        if g.icon:
            embed.set_thumbnail(url=g.icon.url)
        if g.banner:
            embed.set_image(url=g.banner.url)

        embed.add_field(name="🆔 ID", value=f"`{g.id}`", inline=True)
        embed.add_field(name="👑 Owner", value=g.owner.mention if g.owner else "—", inline=True)
        embed.add_field(name="📅 Erstellt", value=f"<t:{int(g.created_at.timestamp())}:R>", inline=True)

        embed.add_field(name="👥 Members", value=f"`{g.member_count}`", inline=True)
        embed.add_field(name="💬 Channels", value=f"`{len(g.channels)}`", inline=True)
        embed.add_field(name="🎭 Roles", value=f"`{len(g.roles)}`", inline=True)

        embed.add_field(name="😊 Emojis", value=f"`{len(g.emojis)}`", inline=True)
        embed.add_field(name="🚀 Boost Level", value=f"`{g.premium_tier}`", inline=True)
        embed.add_field(name="💎 Boosts", value=f"`{g.premium_subscription_count}`", inline=True)

        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed)

    @app_commands.command(name="userinfo", description="Zeigt Informationen über einen User")
    async def userinfo(self, itx: discord.Interaction, user: discord.Member = None):
        u = user or itx.user
        embed = discord.Embed(
            title=str(u),
            color=u.color if u.color.value else EmbedColors.INFO,
            timestamp=datetime.datetime.utcnow(),
        )

        embed.set_thumbnail(url=u.display_avatar.url)
        if u.banner:
            embed.set_image(url=u.banner.url)

        embed.add_field(name="🆔 ID", value=f"`{u.id}`", inline=True)
        embed.add_field(name="🏷️ Nickname", value=u.nick or "—", inline=True)
        embed.add_field(name="🤖 Bot", value="Ja" if u.bot else "Nein", inline=True)

        embed.add_field(name="📅 Erstellt", value=f"<t:{int(u.created_at.timestamp())}:R>", inline=True)
        embed.add_field(name="📥 Joined", value=f"<t:{int(u.joined_at.timestamp())}:R>", inline=True)
        embed.add_field(name="⏱️ Timeout", value=f"<t:{int(u.timed_out_until.timestamp())}:R>" if u.timed_out_until else "—", inline=True)

        roles = [r.mention for r in u.roles[1:][:10]]
        embed.add_field(
            name=f"🎭 Roles ({len(u.roles) - 1})",
            value=" ".join(roles) if roles else "Keine",
            inline=False,
        )

        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed)

    @app_commands.command(name="avatar", description="Zeigt den Avatar eines Users")
    async def avatar(self, itx: discord.Interaction, user: discord.User = None):
        u = user or itx.user
        embed = discord.Embed(
            title=f"Avatar von {u.display_name}",
            color=EmbedColors.INFO,
            timestamp=datetime.datetime.utcnow(),
        )
        embed.set_image(url=u.display_avatar.url)
        embed.add_field(name="🔗 Link", value=f"[Öffnen]({u.display_avatar.url})", inline=False)
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed)

    @app_commands.command(name="embed", description="Sendet ein Custom-Embed")
    @app_commands.checks.has_permissions(manage_messages=True)
    async def embed(self, itx: discord.Interaction, title: str, description: str, color: str = "#7C3AED"):
        try:
            color_int = int(color.lstrip("#"), 16)
        except Exception:
            color_int = EmbedColors.PRIMARY

        e = discord.Embed(
            title=title,
            description=description,
            color=color_int,
            timestamp=datetime.datetime.utcnow(),
        )
        e.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.channel.send(embed=e)

        success = discord.Embed(
            title="✅ Embed gesendet",
            description=f"Dein Embed wurde in {itx.channel.mention} gesendet.",
            color=EmbedColors.SUCCESS,
        )
        success.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=success, ephemeral=True)

    @app_commands.command(name="emoji", description="Fügt einen Custom Emoji hinzu")
    @app_commands.checks.has_permissions(manage_emojis=True)
    async def emoji(self, itx: discord.Interaction, name: str, url: str):
        import aiohttp
        try:
            async with aiohttp.ClientSession() as cs:
                async with cs.get(url) as r:
                    data = await r.read()
            em = await itx.guild.create_custom_emoji(name=name, image=data)
            embed = discord.Embed(
                title="✅ Emoji hinzugefügt",
                description=f"Der Emoji {em} wurde erfolgreich erstellt.",
                color=EmbedColors.SUCCESS,
            )
            embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
            await itx.response.send_message(embed=embed)
        except discord.HTTPException as e:
            embed = discord.Embed(
                title="❌ Fehler",
                description=f"Konnte Emoji nicht erstellen:\n```{e}```",
                color=EmbedColors.ERROR,
            )
            embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
            await itx.response.send_message(embed=embed, ephemeral=True)

    # Custom Commands
    customcmd = app_commands.Group(name="customcmd", description="Eigene Commands erstellen")

    @customcmd.command(name="create", description="Erstellt einen Custom Command")
    @app_commands.checks.has_permissions(manage_guild=True)
    async def cc_create(self, itx: discord.Interaction, name: str, response: str):
        if self.bot.db:
            await self.bot.db.custom_commands.update_one(
                {"guild": itx.guild.id, "name": name},
                {"$set": {"response": response, "author": itx.user.id}},
                upsert=True,
            )
        embed = discord.Embed(
            title="✅ Command erstellt",
            description=f"Der Command `/{name}` wurde erfolgreich erstellt.",
            color=EmbedColors.SUCCESS,
        )
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed, ephemeral=True)

    @customcmd.command(name="list", description="Listet alle Custom Commands")
    async def cc_list(self, itx: discord.Interaction):
        if not self.bot.db:
            embed = discord.Embed(
                title="❌ Keine Datenbank",
                description="Custom Commands benötigen eine MongoDB-Verbindung.",
                color=EmbedColors.ERROR,
            )
            return await itx.response.send_message(embed=embed, ephemeral=True)

        cmds = await self.bot.db.custom_commands.find({"guild": itx.guild.id}).to_list(100)
        if not cmds:
            embed = discord.Embed(
                title="📋 Custom Commands",
                description="Noch keine Custom Commands erstellt.\nNutze `/customcmd create` um einen zu erstellen.",
                color=EmbedColors.INFO,
            )
        else:
            desc = "\n".join(f"`/{c['name']}` — {c['response'][:50]}..." for c in cmds)
            embed = discord.Embed(
                title=f"📋 Custom Commands ({len(cmds)})",
                description=desc,
                color=EmbedColors.INFO,
            )
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed, ephemeral=True)

    @customcmd.command(name="delete", description="Löscht einen Custom Command")
    @app_commands.checks.has_permissions(manage_guild=True)
    async def cc_delete(self, itx: discord.Interaction, name: str):
        if self.bot.db:
            result = await self.bot.db.custom_commands.delete_one({"guild": itx.guild.id, "name": name})
            if result.deleted_count > 0:
                embed = discord.Embed(
                    title="🗑️ Command gelöscht",
                    description=f"Der Command `/{name}` wurde gelöscht.",
                    color=EmbedColors.SUCCESS,
                )
            else:
                embed = discord.Embed(
                    title="❌ Nicht gefunden",
                    description=f"Der Command `/{name}` existiert nicht.",
                    color=EmbedColors.ERROR,
                )
        else:
            embed = discord.Embed(
                title="❌ Keine Datenbank",
                description="Custom Commands benötigen eine MongoDB-Verbindung.",
                color=EmbedColors.ERROR,
            )
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed, ephemeral=True)

    # Custom command listener
    @commands.Cog.listener()
    async def on_message(self, msg: discord.Message):
        if not msg.guild or msg.author.bot:
            return
        if not msg.content.startswith("/"):
            return
        if not self.bot.db:
            return
        name = msg.content[1:].split(" ")[0].lower()
        doc = await self.bot.db.custom_commands.find_one({"guild": msg.guild.id, "name": name})
        if doc:
            resp = doc["response"]
            resp = resp.replace("{user}", msg.author.mention)
            resp = resp.replace("{server}", msg.guild.name)
            resp = resp.replace("{channel}", msg.channel.mention)
            embed = discord.Embed(
                description=resp,
                color=EmbedColors.INFO,
            )
            embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
            await msg.channel.send(embed=embed)


async def setup(bot):
    await bot.add_cog(Utility(bot))
