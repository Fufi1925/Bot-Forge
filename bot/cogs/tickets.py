"""Ticket-System — mit Panel, Kategorien und Transcripts."""

import datetime
import io
import discord
from discord import app_commands
from discord.ext import commands


class Tickets(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    tickets = app_commands.Group(name="ticket", description="Ticket-System")

    @tickets.command(name="panel", description="Sendet ein Ticket-Panel in den Channel")
    @app_commands.checks.has_permissions(manage_guild=True)
    async def panel(self, itx: discord.Interaction):
        cfg = await self.bot.get_guild_config(itx.guild.id)
        cats = cfg.get("tickets", {}).get("categories", [
            {"emoji": "❓", "label": "Allgemeine Frage", "desc": "FAQ & Hilfe"},
            {"emoji": "⚠️", "label": "Report", "desc": "User melden"},
        ])

        embed = discord.Embed(
            title="🎫 Support-Ticket erstellen",
            description="Wähle eine Kategorie, um ein Ticket zu öffnen.\nUnser Team wird sich schnellstmöglich kümmern.",
            color=0x7C3AED,
        )
        embed.set_footer(text="BotForge · Tickets", icon_url=self.bot.user.display_avatar.url)

        options = [
            discord.SelectOption(label=c["label"], description=c.get("desc", ""), emoji=c.get("emoji"))
            for c in cats
        ]
        view = discord.ui.View(timeout=None)
        view.add_item(TicketSelect(options, cfg))

        await itx.channel.send(embed=embed, view=view)
        await itx.response.send_message("✅ Panel gesendet!", ephemeral=True)

    @tickets.command(name="close", description="Schließt das aktuelle Ticket")
    async def close(self, itx: discord.Interaction):
        if not itx.channel.name.startswith("ticket-"):
            return await itx.response.send_message("❌ Dies ist kein Ticket-Channel.", ephemeral=True)

        # Transcript erstellen
        cfg = await self.bot.get_guild_config(itx.guild.id)
        transcript = []
        async for msg in itx.channel.history(limit=500, oldest_first=True):
            transcript.append(f"[{msg.created_at:%Y-%m-%d %H:%M}] {msg.author}: {msg.content}")
        buf = io.BytesIO("\n".join(transcript).encode("utf-8"))
        file = discord.File(buf, filename=f"transcript-{itx.channel.name}.txt")

        t_ch = cfg.get("tickets", {}).get("transcript_channel")
        if t_ch:
            ch = itx.guild.get_channel(int(t_ch))
            if ch:
                embed = discord.Embed(
                    title="📝 Ticket geschlossen",
                    description=f"**Ticket:** {itx.channel.name}\n**Geschlossen von:** {itx.user.mention}",
                    color=0xEF4444,
                    timestamp=datetime.datetime.utcnow(),
                )
                embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
                await ch.send(embed=embed, file=file)

        await itx.response.send_message("🔒 Ticket wird in 5 Sekunden geschlossen...", ephemeral=False)
        import asyncio
        await asyncio.sleep(5)
        await itx.channel.delete(reason="Ticket geschlossen")

    @tickets.command(name="add", description="Fügt User zum Ticket hinzu")
    async def add(self, itx: discord.Interaction, user: discord.Member):
        if not itx.channel.name.startswith("ticket-"):
            return await itx.response.send_message("❌ Kein Ticket.", ephemeral=True)
        await itx.channel.set_permissions(user, read_messages=True, send_messages=True)
        await itx.response.send_message(f"✅ {user.mention} wurde hinzugefügt.")

    @tickets.command(name="remove", description="Entfernt User aus Ticket")
    async def remove(self, itx: discord.Interaction, user: discord.Member):
        if not itx.channel.name.startswith("ticket-"):
            return await itx.response.send_message("❌ Kein Ticket.", ephemeral=True)
        await itx.channel.set_permissions(user, overwrite=None)
        await itx.response.send_message(f"✅ {user.mention} wurde entfernt.")


class TicketSelect(discord.ui.Select):
    def __init__(self, options, cfg):
        super().__init__(placeholder="Wähle eine Kategorie...", options=options, custom_id="ticket_select")
        self.cfg = cfg

    async def callback(self, itx: discord.Interaction):
        cat_id = self.cfg.get("tickets", {}).get("category")
        category = itx.guild.get_channel(int(cat_id)) if cat_id else None
        overwrites = {
            itx.guild.default_role: discord.PermissionOverwrite(read_messages=False),
            itx.user: discord.PermissionOverwrite(read_messages=True, send_messages=True),
            itx.guild.me: discord.PermissionOverwrite(read_messages=True, send_messages=True),
        }
        support_role_id = self.cfg.get("tickets", {}).get("support_role")
        if support_role_id:
            role = itx.guild.get_role(int(support_role_id))
            if role:
                overwrites[role] = discord.PermissionOverwrite(read_messages=True, send_messages=True)

        name = f"ticket-{itx.user.name.lower()[:20]}"
        ch = await itx.guild.create_text_channel(
            name=name,
            category=category,
            overwrites=overwrites,
            reason=f"Ticket von {itx.user}",
        )
        embed = discord.Embed(
            title=f"🎫 Ticket · {self.values[0]}",
            description=f"{itx.user.mention}, willkommen im Support!\nUnser Team wird sich gleich melden.\n\nNutze `/ticket close` um das Ticket zu schließen.",
            color=0x7C3AED,
            timestamp=datetime.datetime.utcnow(),
        )
        embed.set_footer(text="BotForge · Tickets", icon_url=itx.client.user.display_avatar.url)
        await ch.send(embed=embed)
        await itx.response.send_message(f"✅ Ticket erstellt: {ch.mention}", ephemeral=True)


async def setup(bot):
    await bot.add_cog(Tickets(bot))
