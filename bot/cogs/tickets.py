"""Ticket-System — mit echtem Discord-Dropdown-Menü (discord.ui.Select),
Kategorien, Panel-Builder, Transcripts, Team-Assignment und Feedback.

Das Dropdown-Menü zeigt bis zu 25 Kategorien und erstellt automatisch
ein Ticket-Channel mit den passenden Berechtigungen.
"""

import datetime
import io
import json
import discord
from discord import app_commands
from discord.ext import commands


class TicketDropdown(discord.ui.Select):
    """Das eigentliche Discord-Dropdown-Menü für Ticket-Kategorien."""

    def __init__(self, categories: list[dict], config: dict):
        options = [
            discord.SelectOption(
                label=c["label"][:100],
                description=c.get("description", "")[:100] or None,
                emoji=c.get("emoji"),
                value=str(i),
            )
            for i, c in enumerate(categories[:25])  # Discord Limit: 25
        ]
        super().__init__(
            placeholder="🎫 Wähle eine Ticket-Kategorie...",
            options=options,
            custom_id="botforge_ticket_dropdown",
            min_values=1,
            max_values=1,
        )
        self.categories = categories
        self.config = config

    async def callback(self, itx: discord.Interaction):
        idx = int(self.values[0])
        category_data = self.categories[idx]

        # Doppelte Tickets verhindern
        existing = discord.utils.get(
            itx.guild.channels,
            name=f"ticket-{itx.user.name.lower()[:20]}",
        )
        if existing:
            return await itx.response.send_message(
                f"❌ Du hast bereits ein offenes Ticket: {existing.mention}",
                ephemeral=True,
            )

        await itx.response.defer(ephemeral=True, thinking=True)

        # Kategorie-Channel finden
        cat_id = self.config.get("tickets", {}).get("category")
        category = itx.guild.get_channel(int(cat_id)) if cat_id else None

        # Permissions aufbauen
        overwrites = {
            itx.guild.default_role: discord.PermissionOverwrite(read_messages=False),
            itx.user: discord.PermissionOverwrite(
                read_messages=True,
                send_messages=True,
                attach_files=True,
                embed_links=True,
            ),
            itx.guild.me: discord.PermissionOverwrite(
                read_messages=True,
                send_messages=True,
                manage_channels=True,
            ),
        }

        # Support-Team-Rolle
        support_role_id = self.config.get("tickets", {}).get("support_role")
        if support_role_id:
            role = itx.guild.get_role(int(support_role_id))
            if role:
                overwrites[role] = discord.PermissionOverwrite(
                    read_messages=True,
                    send_messages=True,
                )

        # Channel erstellen
        name = f"ticket-{itx.user.name.lower()[:20]}"
        try:
            ch = await itx.guild.create_text_channel(
                name=name,
                category=category,
                overwrites=overwrites,
                topic=f"Ticket von {itx.user} · Kategorie: {category_data['label']}",
                reason=f"Ticket erstellt von {itx.user} · {category_data['label']}",
            )
        except discord.Forbidden:
            return await itx.followup.send(
                "❌ Ich habe keine Berechtigung, Channels zu erstellen.",
                ephemeral=True,
            )

        # Welcome-Embed im Ticket
        welcome = discord.Embed(
            title=f"🎫 Ticket · {category_data['label']}",
            description=(
                f"Hallo {itx.user.mention}, willkommen in deinem Support-Ticket!\n\n"
                f"**Kategorie:** {category_data.get('emoji', '🎫')} {category_data['label']}\n"
                f"**Erstellt:** <t:{int(datetime.datetime.utcnow().timestamp())}:R>\n\n"
                f"Beschreibe dein Anliegen so genau wie möglich.\n"
                f"Unser Team wird sich schnellstmöglich kümmern."
            ),
            color=0x7C3AED,
            timestamp=datetime.datetime.utcnow(),
        )
        welcome.set_footer(text="BotForge · Tickets", icon_url=itx.client.user.display_avatar.url)

        # Ticket-Aktions-Buttons
        view = TicketActionView(itx.user.id, self.config)
        msg = await ch.send(
            content=f"{itx.user.mention}" + (f" · <@&{support_role_id}>" if support_role_id else ""),
            embed=welcome,
            view=view,
        )
        try:
            await msg.pin()
        except discord.Forbidden:
            pass

        # In DB speichern
        bot = itx.client
        if bot.db:
            await bot.db.tickets.insert_one({
                "guild": itx.guild.id,
                "channel": ch.id,
                "user": itx.user.id,
                "category": category_data["label"],
                "opened": datetime.datetime.utcnow(),
                "status": "open",
            })

        await itx.followup.send(f"✅ Ticket erstellt: {ch.mention}", ephemeral=True)


class TicketActionView(discord.ui.View):
    """Buttons im Ticket-Channel: Claim, Close, Rename."""

    def __init__(self, creator_id: int, config: dict):
        super().__init__(timeout=None)
        self.creator_id = creator_id
        self.config = config

    @discord.ui.button(label="Claim", style=discord.ButtonStyle.primary, emoji="🙋", custom_id="ticket_claim")
    async def claim(self, itx: discord.Interaction, button: discord.ui.Button):
        await itx.response.send_message(f"✅ {itx.user.mention} hat das Ticket übernommen.", ephemeral=False)

    @discord.ui.button(label="Schließen", style=discord.ButtonStyle.danger, emoji="🔒", custom_id="ticket_close")
    async def close(self, itx: discord.Interaction, button: discord.ui.Button):
        await itx.response.defer(thinking=True)

        # Transcript erstellen
        transcript = []
        async for msg in itx.channel.history(limit=1000, oldest_first=True):
            transcript.append(
                f"[{msg.created_at:%Y-%m-%d %H:%M:%S}] {msg.author} ({msg.author.id}): {msg.content}"
            )
            for att in msg.attachments:
                transcript.append(f"    ↳ Attachment: {att.url}")

        transcript_text = "\n".join(transcript)
        buf = io.BytesIO(transcript_text.encode("utf-8"))
        file = discord.File(buf, filename=f"transcript-{itx.channel.name}.txt")

        # In Transcript-Channel senden
        bot = itx.client
        cfg = await bot.get_guild_config(itx.guild.id)
        t_ch = cfg.get("tickets", {}).get("transcript_channel")
        if t_ch:
            ch = itx.guild.get_channel(int(t_ch))
            if ch:
                embed = discord.Embed(
                    title="📝 Ticket geschlossen",
                    description=(
                        f"**Ticket:** {itx.channel.name}\n"
                        f"**Geschlossen von:** {itx.user.mention}\n"
                        f"**Kategorie:** {(itx.channel.topic or '').split('Kategorie: ')[-1] if itx.channel.topic else '—'}"
                    ),
                    color=0xEF4444,
                    timestamp=datetime.datetime.utcnow(),
                )
                embed.set_footer(text="BotForge · Transcript", icon_url=bot.user.display_avatar.url)
                try:
                    await ch.send(embed=embed, file=file)
                except discord.Forbidden:
                    pass

        # DM an Creator
        if self.creator_id:
            user = itx.guild.get_member(self.creator_id)
            if user:
                try:
                    dm_embed = discord.Embed(
                        title="🔒 Dein Ticket wurde geschlossen",
                        description=f"Auf **{itx.guild.name}** wurde dein Ticket `{itx.channel.name}` geschlossen.",
                        color=0xEF4444,
                    )
                    dm_embed.add_field(name="Geschlossen von", value=itx.user.mention, inline=True)
                    dm_embed.set_footer(text="BotForge · Tickets", icon_url=bot.user.display_avatar.url)
                    await user.send(embed=dm_embed)
                except discord.Forbidden:
                    pass

        # DB aktualisieren
        if bot.db:
            await bot.db.tickets.update_one(
                {"channel": itx.channel.id},
                {"$set": {"status": "closed", "closed_by": itx.user.id, "closed_at": datetime.datetime.utcnow()}},
            )

        close_embed = discord.Embed(
            description="🔒 Ticket wird in 5 Sekunden gelöscht...",
            color=0xEF4444,
        )
        await itx.followup.send(embed=close_embed)
        import asyncio
        await asyncio.sleep(5)
        try:
            await itx.channel.delete(reason=f"Ticket geschlossen von {itx.user}")
        except discord.Forbidden:
            pass


class TicketPanelView(discord.ui.View):
    """Persistente View für das Ticket-Panel (überlebt Bot-Neustarts)."""

    def __init__(self, categories: list[dict], config: dict):
        super().__init__(timeout=None)
        self.add_item(TicketDropdown(categories, config))


class Tickets(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    tickets = app_commands.Group(name="ticket", description="Ticket-System mit Dropdown-Menü")

    @tickets.command(name="panel", description="Sendet ein Ticket-Panel mit Dropdown-Menü")
    @app_commands.describe(
        channel="Channel, in dem das Panel gesendet wird",
        title="Titel des Embeds",
        description="Beschreibung des Embeds",
    )
    @app_commands.checks.has_permissions(manage_guild=True)
    async def panel(
        self,
        itx: discord.Interaction,
        channel: discord.TextChannel = None,
        title: str = "🎫 Support-Ticket erstellen",
        description: str = None,
    ):
        cfg = await self.bot.get_guild_config(itx.guild.id)
        categories = cfg.get("tickets", {}).get("categories", [
            {"emoji": "❓", "label": "Allgemeine Frage", "description": "FAQ & allgemeine Hilfe"},
            {"emoji": "⚠️", "label": "User Report", "description": "Einen anderen User melden"},
            {"emoji": "🤝", "label": "Partnerschaft", "description": "Partner werden"},
            {"emoji": "🐛", "label": "Bug-Report", "description": "Fehler auf dem Server melden"},
            {"emoji": "💡", "label": "Vorschlag", "description": "Ideen für den Server"},
        ])

        if len(categories) == 0:
            return await itx.response.send_message(
                "❌ Keine Kategorien konfiguriert. Nutze `/ticket category add`.",
                ephemeral=True,
            )

        ch = channel or itx.channel
        desc = description or (
            "Wähle unten im **Dropdown-Menü** die passende Kategorie für dein Anliegen.\n"
            "Unser Team wird sich schnellstmöglich um dich kümmern.\n\n"
            f"**Verfügbare Kategorien ({len(categories)}):**\n"
            + "\n".join(f"{c.get('emoji', '🎫')} **{c['label']}** — {c.get('description', '')}" for c in categories)
        )

        embed = discord.Embed(
            title=title,
            description=desc,
            color=0x7C3AED,
            timestamp=datetime.datetime.utcnow(),
        )
        embed.set_footer(text="BotForge · Tickets · Dropdown", icon_url=self.bot.user.display_avatar.url)
        if itx.guild.icon:
            embed.set_thumbnail(url=itx.guild.icon.url)

        view = TicketPanelView(categories, cfg)
        await ch.send(embed=embed, view=view)
        await itx.response.send_message(f"✅ Panel gesendet in {ch.mention}", ephemeral=True)

    category = app_commands.Group(name="ticket-category", description="Ticket-Kategorien verwalten", parent=None)

    @tickets.command(name="add-category", description="Fügt eine Ticket-Kategorie hinzu")
    @app_commands.describe(label="Name der Kategorie", emoji="Emoji (optional)", description="Beschreibung")
    @app_commands.checks.has_permissions(manage_guild=True)
    async def add_category(self, itx: discord.Interaction, label: str, emoji: str = "🎫", description: str = ""):
        cfg = await self.bot.get_guild_config(itx.guild.id)
        cats = cfg.setdefault("tickets", {}).setdefault("categories", [])
        if len(cats) >= 25:
            return await itx.response.send_message("❌ Maximum 25 Kategorien.", ephemeral=True)
        cats.append({"emoji": emoji, "label": label, "description": description})
        await self.bot.save_guild_config(itx.guild.id, cfg)
        await itx.response.send_message(f"✅ Kategorie **{emoji} {label}** hinzugefügt.", ephemeral=True)

    @tickets.command(name="list-categories", description="Listet alle Ticket-Kategorien")
    async def list_categories(self, itx: discord.Interaction):
        cfg = await self.bot.get_guild_config(itx.guild.id)
        cats = cfg.get("tickets", {}).get("categories", [])
        if not cats:
            return await itx.response.send_message("Keine Kategorien konfiguriert.", ephemeral=True)
        desc = "\n".join(f"{i+1}. {c.get('emoji', '🎫')} **{c['label']}** — {c.get('description', '')}" for i, c in enumerate(cats))
        embed = discord.Embed(title="📋 Ticket-Kategorien", description=desc, color=0x7C3AED)
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed, ephemeral=True)

    @tickets.command(name="close", description="Schließt das aktuelle Ticket")
    async def close(self, itx: discord.Interaction):
        if not itx.channel.name.startswith("ticket-"):
            return await itx.response.send_message("❌ Dies ist kein Ticket-Channel.", ephemeral=True)

        await itx.response.defer(thinking=True)

        transcript = []
        async for msg in itx.channel.history(limit=1000, oldest_first=True):
            transcript.append(f"[{msg.created_at:%Y-%m-%d %H:%M}] {msg.author}: {msg.content}")
        buf = io.BytesIO("\n".join(transcript).encode("utf-8"))
        file = discord.File(buf, filename=f"transcript-{itx.channel.name}.txt")

        cfg = await self.bot.get_guild_config(itx.guild.id)
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
                try:
                    await ch.send(embed=embed, file=file)
                except discord.Forbidden:
                    pass

        if self.bot.db:
            await self.bot.db.tickets.update_one(
                {"channel": itx.channel.id},
                {"$set": {"status": "closed", "closed_by": itx.user.id}},
            )

        await itx.followup.send("🔒 Ticket wird in 5 Sekunden gelöscht...")
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

    @tickets.command(name="rename", description="Benennt das Ticket um")
    async def rename(self, itx: discord.Interaction, name: str):
        if not itx.channel.name.startswith("ticket-"):
            return await itx.response.send_message("❌ Kein Ticket.", ephemeral=True)
        await itx.channel.edit(name=f"ticket-{name.lower()[:50]}")
        await itx.response.send_message(f"✅ Ticket umbenannt in `ticket-{name}`.")

    @tickets.command(name="stats", description="Ticket-Statistiken")
    @app_commands.checks.has_permissions(manage_guild=True)
    async def stats(self, itx: discord.Interaction):
        if not self.bot.db:
            return await itx.response.send_message("Keine DB.", ephemeral=True)
        total = await self.bot.db.tickets.count_documents({"guild": itx.guild.id})
        open_ = await self.bot.db.tickets.count_documents({"guild": itx.guild.id, "status": "open"})
        closed = await self.bot.db.tickets.count_documents({"guild": itx.guild.id, "status": "closed"})
        embed = discord.Embed(title="📊 Ticket-Statistiken", color=0x7C3AED)
        embed.add_field(name="Gesamt", value=str(total), inline=True)
        embed.add_field(name="Offen", value=str(open_), inline=True)
        embed.add_field(name="Geschlossen", value=str(closed), inline=True)
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed, ephemeral=True)


async def setup(bot):
    await bot.add_cog(Tickets(bot))
