"""Custom Commands, Embeds, Emojis, Stats, Utility."""

import datetime
import platform
import discord
from discord import app_commands
from discord.ext import commands


class Utility(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    # ---- Utility ----
    @app_commands.command(name="ping", description="Bot-Latenz")
    async def ping(self, itx: discord.Interaction):
        embed = discord.Embed(title="🏓 Pong!", color=0x7C3AED)
        embed.add_field(name="Gateway", value=f"{round(self.bot.latency * 1000)}ms", inline=True)
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed)

    @app_commands.command(name="stats", description="Bot-Statistiken")
    async def stats(self, itx: discord.Interaction):
        embed = discord.Embed(title="📊 BotForge Stats", color=0x7C3AED, timestamp=datetime.datetime.utcnow())
        embed.add_field(name="Server", value=str(len(self.bot.guilds)), inline=True)
        embed.add_field(name="User", value=str(sum(g.member_count or 0 for g in self.bot.guilds)), inline=True)
        embed.add_field(name="Ping", value=f"{round(self.bot.latency * 1000)}ms", inline=True)
        embed.add_field(name="Python", value=platform.python_version(), inline=True)
        embed.add_field(name="discord.py", value=discord.__version__, inline=True)
        if self.bot.boot_time:
            up = datetime.datetime.utcnow() - self.bot.boot_time
            embed.add_field(name="Uptime", value=str(up).split(".")[0], inline=True)
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed)

    @app_commands.command(name="serverinfo", description="Info über den Server")
    async def serverinfo(self, itx: discord.Interaction):
        g = itx.guild
        embed = discord.Embed(title=g.name, color=0x7C3AED, timestamp=datetime.datetime.utcnow())
        if g.icon:
            embed.set_thumbnail(url=g.icon.url)
        embed.add_field(name="ID", value=str(g.id), inline=True)
        embed.add_field(name="Owner", value=g.owner.mention if g.owner else "—", inline=True)
        embed.add_field(name="Erstellt", value=f"<t:{int(g.created_at.timestamp())}:R>", inline=True)
        embed.add_field(name="Member", value=str(g.member_count), inline=True)
        embed.add_field(name="Channels", value=str(len(g.channels)), inline=True)
        embed.add_field(name="Rollen", value=str(len(g.roles)), inline=True)
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed)

    @app_commands.command(name="userinfo", description="Info über einen User")
    async def userinfo(self, itx: discord.Interaction, user: discord.Member = None):
        u = user or itx.user
        embed = discord.Embed(title=str(u), color=u.color if u.color.value else 0x7C3AED)
        embed.set_thumbnail(url=u.display_avatar.url)
        embed.add_field(name="ID", value=str(u.id), inline=True)
        embed.add_field(name="Nickname", value=u.nick or "—", inline=True)
        embed.add_field(name="Erstellt", value=f"<t:{int(u.created_at.timestamp())}:R>", inline=True)
        embed.add_field(name="Joined", value=f"<t:{int(u.joined_at.timestamp())}:R>", inline=True)
        embed.add_field(name="Rollen", value=" ".join(r.mention for r in u.roles[1:][:10]) or "—", inline=False)
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed)

    @app_commands.command(name="avatar", description="Zeigt den Avatar")
    async def avatar(self, itx: discord.Interaction, user: discord.User = None):
        u = user or itx.user
        embed = discord.Embed(title=f"Avatar von {u}", color=0x7C3AED)
        embed.set_image(url=u.display_avatar.url)
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed)

    # ---- Custom Commands ----
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
        await itx.response.send_message(f"✅ Command `/{name}` erstellt.", ephemeral=True)

    @customcmd.command(name="list", description="Listet alle Custom Commands")
    async def cc_list(self, itx: discord.Interaction):
        if not self.bot.db:
            return await itx.response.send_message("Keine DB.", ephemeral=True)
        cmds = await self.bot.db.custom_commands.find({"guild": itx.guild.id}).to_list(100)
        if not cmds:
            return await itx.response.send_message("Keine Custom Commands.", ephemeral=True)
        desc = "\n".join(f"`/{c['name']}`" for c in cmds)
        await itx.response.send_message(embed=discord.Embed(title="📋 Custom Commands", description=desc, color=0x7C3AED), ephemeral=True)

    @customcmd.command(name="delete", description="Löscht einen Custom Command")
    @app_commands.checks.has_permissions(manage_guild=True)
    async def cc_delete(self, itx: discord.Interaction, name: str):
        if self.bot.db:
            await self.bot.db.custom_commands.delete_one({"guild": itx.guild.id, "name": name})
        await itx.response.send_message(f"🗑️ `/{name}` gelöscht.", ephemeral=True)

    # ---- Embed ----
    @app_commands.command(name="embed", description="Sendet ein Custom-Embed")
    @app_commands.checks.has_permissions(manage_messages=True)
    async def embed(self, itx: discord.Interaction, titel: str, beschreibung: str, farbe: str = "#7C3AED"):
        try:
            color = int(farbe.lstrip("#"), 16)
        except Exception:
            color = 0x7C3AED
        e = discord.Embed(title=titel, description=beschreibung, color=color, timestamp=datetime.datetime.utcnow())
        e.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.channel.send(embed=e)
        await itx.response.send_message("✅ Embed gesendet.", ephemeral=True)

    # ---- Emoji ----
    @app_commands.command(name="emoji", description="Fügt einen Emoji hinzu")
    @app_commands.checks.has_permissions(manage_emojis=True)
    async def emoji(self, itx: discord.Interaction, name: str, url: str):
        import aiohttp
        async with aiohttp.ClientSession() as cs:
            async with cs.get(url) as r:
                data = await r.read()
        try:
            em = await itx.guild.create_custom_emoji(name=name, image=data)
            await itx.response.send_message(f"✅ Emoji {em} hinzugefügt.")
        except discord.HTTPException as e:
            await itx.response.send_message(f"❌ Fehler: {e}", ephemeral=True)

    # ---- Help ----
    @app_commands.command(name="help", description="Hilfe zu BotForge")
    async def help(self, itx: discord.Interaction):
        embed = discord.Embed(
            title="🛠️ BotForge Hilfe",
            description="Futuristischer All-in-One Discord Bot.\n\nAlle Commands findest du unter `/` oder auf [botforge.app/commands](https://botforge.app/commands).",
            color=0x7C3AED,
        )
        embed.add_field(name="Module", value="• AutoMod\n• Tickets\n• Music\n• Welcome\n• Levels\n• Logging\n• Moderation\n• Custom Commands", inline=True)
        embed.add_field(name="Links", value="[Dashboard](https://botforge.app/dashboard)\n[Status](https://botforge.app/status)\n[Support](https://discord.gg/botforge)", inline=True)
        embed.set_footer(text="BotForge · v2.0", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed)

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
            await msg.channel.send(resp)


async def setup(bot):
    await bot.add_cog(Utility(bot))
