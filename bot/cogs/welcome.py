"""Welcome & Leave — mit Banner-Card und Auto-Role."""

import io
import discord
from discord import app_commands
from discord.ext import commands

# Pillow für Welcome-Card
try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_OK = True
except ImportError:
    PIL_OK = False


class Welcome(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        cfg = await self.bot.get_guild_config(member.guild.id)
        w = cfg.get("welcome", {})
        if not w.get("enabled"):
            return

        channel = member.guild.get_channel(w.get("channel"))
        if not channel:
            return

        # Auto-Role
        if w.get("autorole"):
            role = member.guild.get_role(int(w["autorole"]))
            if role:
                try:
                    await member.add_roles(role, reason="Welcome Auto-Role")
                except discord.Forbidden:
                    pass

        # Welcome Card
        file = None
        if PIL_OK and w.get("banner"):
            try:
                file = await self._make_card(member, w["banner"])
            except Exception:
                file = None

        msg = w.get("message", "Willkommen {user}!").replace("{user}", member.mention)
        msg = msg.replace("{server}", member.guild.name)
        msg = msg.replace("{membercount}", str(member.guild.member_count))
        msg = msg.replace("{createdate}", member.created_at.strftime("%d.%m.%Y"))

        embed = discord.Embed(
            description=msg,
            color=0x7C3AED,
        )
        embed.set_author(name=f"Willkommen {member.name}!", icon_url=member.display_avatar.url)
        embed.set_thumbnail(url=member.display_avatar.url)
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)

        await channel.send(embed=embed, file=file)

        # DM
        if w.get("dm"):
            try:
                await member.send(f"Willkommen auf **{member.guild.name}**! 🎉")
            except discord.Forbidden:
                pass

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        cfg = await self.bot.get_guild_config(member.guild.id)
        l = cfg.get("leave", {})
        if not l.get("enabled"):
            return
        channel = member.guild.get_channel(l.get("channel"))
        if not channel:
            return
        msg = l.get("message", "{user} hat uns verlassen.").replace("{user}", str(member))
        msg = msg.replace("{server}", member.guild.name).replace("{membercount}", str(member.guild.member_count))
        embed = discord.Embed(description=msg, color=0xEF4444)
        embed.set_author(name=f"{member.name} hat den Server verlassen", icon_url=member.display_avatar.url)
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await channel.send(embed=embed)

    async def _make_card(self, member: discord.Member, banner_url: str):
        import aiohttp
        async with aiohttp.ClientSession() as cs:
            async with cs.get(banner_url) as r:
                banner = Image.open(io.BytesIO(await r.read())).convert("RGBA")

        banner = banner.resize((800, 280))
        draw = ImageDraw.Draw(banner)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
        except Exception:
            font = ImageFont.load_default()
        draw.text((40, 200), f"Welcome {member.name}!", fill="white", font=font)
        draw.text((40, 240), f"Member #{member.guild.member_count}", fill="#aaaaaa", font=font)

        buf = io.BytesIO()
        banner.save(buf, format="PNG")
        buf.seek(0)
        return discord.File(buf, filename="welcome.png")

    # ---- Slash Commands ----
    welcome = app_commands.Group(name="welcome", description="Welcome-System")

    @welcome.command(name="setup", description="Welcome-System einrichten")
    @app_commands.checks.has_permissions(manage_guild=True)
    async def setup(self, itx: discord.Interaction, channel: discord.TextChannel, message: str = "Willkommen {user}!"):
        cfg = await self.bot.get_guild_config(itx.guild.id)
        cfg["welcome"] = {**cfg.get("welcome", {}), "enabled": True, "channel": channel.id, "message": message}
        await self.bot.save_guild_config(itx.guild.id, cfg)
        await itx.response.send_message(f"✅ Welcome aktiviert in {channel.mention}", ephemeral=True)

    @welcome.command(name="toggle", description="Welcome an/aus")
    @app_commands.checks.has_permissions(manage_guild=True)
    async def toggle(self, itx: discord.Interaction):
        cfg = await self.bot.get_guild_config(itx.guild.id)
        w = cfg.setdefault("welcome", {})
        w["enabled"] = not w.get("enabled", False)
        await self.bot.save_guild_config(itx.guild.id, cfg)
        await itx.response.send_message(f"Welcome ist jetzt {'an' if w['enabled'] else 'aus'}.", ephemeral=True)

    @welcome.command(name="test", description="Test-Nachricht senden")
    async def test(self, itx: discord.Interaction):
        cfg = await self.bot.get_guild_config(itx.guild.id)
        if not cfg.get("welcome", {}).get("channel"):
            return await itx.response.send_message("❌ Kein Welcome-Channel gesetzt.", ephemeral=True)
        channel = itx.guild.get_channel(cfg["welcome"]["channel"])
        await channel.send(f"🧪 Test-Willkommen für {itx.user.mention}")
        await itx.response.send_message("✅ Test gesendet!", ephemeral=True)


async def setup(bot):
    await bot.add_cog(Welcome(bot))
