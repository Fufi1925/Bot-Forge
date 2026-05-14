"""
BotForge — Der fortschrittlichste Discord Bot
Kompletter Bot mit allen Features, Keep-Alive und modernem Code
"""
import discord
from discord.ext import commands, tasks
from discord import app_commands
import json, os, asyncio, datetime, random, re, uuid, math
from collections import defaultdict
from keep_alive import keep_alive

# ═══════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════
with open("config.json", "r") as f:
    CONFIG = json.load(f)

TOKEN = os.getenv("DISCORD_TOKEN", CONFIG.get("token", ""))
PREFIX = CONFIG.get("prefix", "!")
LOG_CHANNEL_ID = CONFIG.get("log_channel", 0)
EMBED_COLOR = discord.Color.purple()
FOOTER_TEXT = "⚡ Powered by BotForge"
FOOTER_ICON = "https://i.imgur.com/botforge.png"

intents = discord.Intents.all()
bot = commands.Bot(command_prefix=PREFIX, intents=intents, help_command=None)

# ═══════════════════════════════════════════
# DATA STORAGE
# ═══════════════════════════════════════════
def load_data(filename, default=None):
    try:
        with open(f"data/{filename}", "r") as f:
            return json.load(f)
    except:
        return default if default else {}

def save_data(filename, data):
    os.makedirs("data", exist_ok=True)
    with open(f"data/{filename}", "w") as f:
        json.dump(data, f, indent=2)

# ═══════════════════════════════════════════
# UTILITY
# ═══════════════════════════════════════════
def bf_embed(title="", description="", color=EMBED_COLOR, footer=True):
    embed = discord.Embed(title=title, description=description, color=color, timestamp=datetime.datetime.utcnow())
    if footer:
        embed.set_footer(text=FOOTER_TEXT, icon_url=FOOTER_ICON)
    return embed

def dm_embed(action, reason, moderator, duration="Permanent", guild_name="Server"):
    embed = discord.Embed(title=f"⚠️ {action}", color=discord.Color.red(), timestamp=datetime.datetime.utcnow())
    embed.add_field(name="Server", value=guild_name, inline=True)
    embed.add_field(name="Grund", value=reason, inline=True)
    embed.add_field(name="Moderator", value=moderator, inline=True)
    embed.add_field(name="Dauer", value=duration, inline=True)
    embed.set_footer(text=FOOTER_TEXT, icon_url=FOOTER_ICON)
    return embed

async def send_dm(user, embed, delete_after=15):
    try:
        msg = await user.send(embed=embed)
        if delete_after > 0:
            await asyncio.sleep(delete_after)
            await msg.delete()
    except:
        pass

async def log_action(guild, title, description, color=EMBED_COLOR):
    data = load_data("configs.json")
    gid = str(guild.id)
    log_ch_id = data.get(gid, {}).get("log_channel", LOG_CHANNEL_ID)
    ch = guild.get_channel(log_ch_id)
    if ch:
        embed = bf_embed(title, description, color)
        await ch.send(embed=embed)

# ═══════════════════════════════════════════
# EVENTS
# ═══════════════════════════════════════════
@bot.event
async def on_ready():
    await bot.wait_until_ready()
    print(f"✅ BotForge online als {bot.user}")
    print(f"📊 {len(bot.guilds)} Server verbunden")
    try:
        synced = await bot.tree.sync()
        print(f"🔄 {len(synced)} Slash-Befehle synchronisiert")
    except Exception as e:
        print(f"❌ Sync Fehler: {e}")
    status_loop.start()

@tasks.loop(seconds=60)
async def status_loop():
    await bot.change_presence(
        activity=discord.Activity(
            type=discord.ActivityType.watching,
            name=f"{len(bot.guilds)} Server | /help"
        )
    )

@bot.event
async def on_guild_join(guild):
    await log_to_owner(f"🟢 Bot wurde zu **{guild.name}** hinzugefügt ({guild.member_count} Mitglieder)")
    configs = load_data("configs.json")
    configs[str(guild.id)] = configs.get(str(guild.id), {
        "welcome_enabled": True,
        "welcome_channel": "general",
        "welcome_message": "Willkommen {user} auf {server}! 🎉",
        "automod_enabled": True,
        "log_channel": None,
        "prefix": "!"
    })
    save_data("configs.json", configs)

@bot.event
async def on_guild_remove(guild):
    await log_to_owner(f"🔴 Bot wurde von **{guild.name}** entfernt")

async def log_to_owner(msg):
    for owner_id in [CONFIG.get("owner_id", 0)]:
        if owner_id:
            try:
                owner = await bot.fetch_user(owner_id)
                await owner.send(embed=bf_embed("Bot Status", msg))
            except:
                pass

# ═══════════════════════════════════════════
# WELCOME & LEAVE
# ═══════════════════════════════════════════
@bot.event
async def on_member_join(member):
    configs = load_data("configs.json")
    cfg = configs.get(str(member.guild.id), {})
    if not cfg.get("welcome_enabled", False):
        return

    ch_id = cfg.get("welcome_channel_id")
    ch = member.guild.get_channel(ch_id) if ch_id else discord.utils.get(member.guild.text_channels, name="welcome")
    if not ch:
        return

    msg_text = cfg.get("welcome_message", "Willkommen {user}! 🎉").replace("{user}", member.mention).replace("{server}", member.guild.name).replace("{membercount}", str(member.guild.member_count))

    embed = bf_embed(
        cfg.get("welcome_title", "Neues Mitglied!"),
        cfg.get("welcome_desc", f"Willkommen {member.mention} auf **{member.guild.name}**!")
    )
    embed.set_thumbnail(url=member.display_avatar.url)
    embed.add_field(name="Mitglieder", value=f"#{member.guild.member_count}", inline=True)
    embed.add_field(name="Account", value=f"<t:{int(member.created_at.timestamp())}:R>", inline=True)

    await ch.send(content=msg_text, embed=embed)

    # Auto Role
    role_id = cfg.get("autorole_id")
    if role_id:
        role = member.guild.get_role(role_id)
        if role:
            try:
                await member.add_roles(role)
            except:
                pass

    # DM
    if cfg.get("welcome_dm", False):
        dm_msg = cfg.get("dm_message", "Willkommen auf {server}!").replace("{server}", member.guild.name)
        try:
            await member.send(embed=bf_embed("Willkommen!", dm_msg))
        except:
            pass

    await log_action(member.guild, "🟢 Mitglied beigetreten", f"{member.mention} ({member.name})", discord.Color.green())

@bot.event
async def on_member_remove(member):
    configs = load_data("configs.json")
    cfg = configs.get(str(member.guild.id), {})
    if not cfg.get("leave_enabled", False):
        return

    ch_id = cfg.get("leave_channel_id")
    ch = member.guild.get_channel(ch_id) if ch_id else discord.utils.get(member.guild.text_channels, name="general")
    if not ch:
        return

    msg = cfg.get("leave_message", "{user} hat den Server verlassen. 👋").replace("{user}", member.name).replace("{server}", member.guild.name)
    await ch.send(embed=bf_embed("Auf Wiedersehen!", msg, discord.Color.red()))
    await log_action(member.guild, "🔴 Mitglied verlassen", f"{member.name}", discord.Color.red())

# ═══════════════════════════════════════════
# AUTO MOD
# ═══════════════════════════════════════════
spam_cache = defaultdict(list)
link_regex = re.compile(r"https?://[^\s]+")
invite_regex = re.compile(r"(discord\.(gg|io|me|li)|discordapp\.com/invite)/[^\s]+")

@bot.event
async def on_message(message):
    if message.author.bot or not message.guild:
        return

    await bot.process_commands(message)
    configs = load_data("configs.json")
    cfg = configs.get(str(message.guild.id), {})
    if not cfg.get("automod_enabled", True):
        return

    # Check exempt roles
    exempt = cfg.get("automod_exempt_roles", [])
    if any(str(r.id) in exempt for r in message.author.roles):
        return

    reason = None
    action = cfg.get("automod_action", "delete")

    # Anti-Spam
    if cfg.get("antispam", True):
        now = datetime.datetime.utcnow().timestamp()
        spam_cache[str(message.author.id)].append(now)
        spam_cache[str(message.author.id)] = [t for t in spam_cache[str(message.author.id)] if now - t < 5]
        if len(spam_cache[str(message.author.id)]) >= 5:
            reason = "Spam (5 Nachrichten in 5s)"

    # Anti-Links
    if not reason and cfg.get("antilinks", True) and link_regex.search(message.content):
        reason = "Link gesendet"

    # Anti-Invites
    if not reason and cfg.get("antiinvites", True) and invite_regex.search(message.content):
        reason = "Discord Invite gesendet"

    # Anti-Caps
    if not reason and cfg.get("anticaps", False) and len(message.content) > 5:
        caps = sum(1 for c in message.content if c.isupper())
        if caps / len(message.content) > 0.7:
            reason = "Übermäßige Großschreibung"

    # Anti-Mention
    if not reason and cfg.get("antimention", True) and len(message.mentions) >= 5:
        reason = "Massen-Erwähnung"

    # Anti-Bad Words
    if not reason and cfg.get("antibadwords", True):
        bad = ["spam", "hack", "free nitro", "discord.gg/"]
        if any(b in message.content.lower() for b in bad):
            reason = "Unangemessener Inhalt"

    if reason:
        try:
            await message.delete()
        except:
            pass

        # DM user
        embed = discord.Embed(title="⚠️ Auto-Mod Aktion", color=discord.Color.gold(), timestamp=datetime.datetime.utcnow())
        embed.add_field(name="Kanal", value=message.channel.mention, inline=True)
        embed.add_field(name="Grund", value=reason, inline=True)
        embed.add_field(name="Aktion", value=action, inline=True)
        if action == "timeout":
            dur = cfg.get("timeout_duration", 60)
            embed.add_field(name="Dauer", value=f"{dur} Minuten", inline=True)
            timeout_until = discord.utils.utcnow() + datetime.timedelta(minutes=dur)
            try:
                await message.author.timeout(timeout_until, reason=f"Auto-Mod: {reason}")
            except:
                pass
        embed.set_footer(text=FOOTER_TEXT, icon_url=FOOTER_ICON)
        await send_dm(message.author, embed, delete_after=15)

        # Log
        await log_action(message.guild, "⚠️ Auto-Mod", f"**User:** {message.author.mention}\n**Grund:** {reason}\n**Kanal:** {message.channel.mention}\n**Nachricht:** {message.content[:200]}", discord.Color.gold())

# ═══════════════════════════════════════════
# LOGGING
# ═══════════════════════════════════════════
@bot.event
async def on_message_edit(before, after):
    if before.author.bot or not before.guild:
        return
    if before.content == after.content:
        return
    await log_action(before.guild, "✏️ Nachricht bearbeitet",
        f"**User:** {before.author.mention}\n**Kanal:** {before.channel.mention}\n**Vorher:** {before.content[:500]}\n**Nachher:** {after.content[:500]}",
        discord.Color.blue())

@bot.event
async def on_message_delete(message):
    if message.author.bot or not message.guild:
        return
    await log_action(message.guild, "🗑️ Nachricht gelöscht",
        f"**User:** {message.author.mention}\n**Kanal:** {message.channel.mention}\n**Inhalt:** {message.content[:500]}",
        discord.Color.red())

@bot.event
async def on_voice_state_update(member, before, after):
    if not member.guild:
        return
    if before.channel != after.channel:
        if after.channel:
            await log_action(member.guild, "🔊 Voice beigetreten", f"{member.mention} → {after.channel.mention}", discord.Color.green())
        elif before.channel:
            await log_action(member.guild, "🔇 Voice verlassen", f"{member.mention} ← {before.channel.mention}", discord.Color.red())

@bot.event
async def on_member_update(before, after):
    if before.nick != after.nick and after.guild:
        await log_action(after.guild, "🏷️ Nickname geändert", f"**{before.nick or before.name}** → **{after.nick or after.name}**")

@bot.event
async def on_guild_role_create(role):
    await log_action(role.guild, "✨ Rolle erstellt", f"**{role.name}** ({role.mention})", discord.Color.green())

@bot.event
async def on_guild_role_delete(role):
    await log_action(role.guild, "❌ Rolle gelöscht", f"**{role.name}**", discord.Color.red())

# ═══════════════════════════════════════════
# MODERATION COMMANDS
# ═══════════════════════════════════════════
class Moderation(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.command(name="warn", description="Verwarne einen User")
    @app_commands.describe(user="User der verwarnt werden soll", reason="Grund der Verwarnung")
    async def warn(self, interaction: discord.Interaction, user: discord.Member, reason: str = "Kein Grund"):
        if not interaction.user.guild_permissions.moderate_members:
            return await interaction.response.send_message("❌ Keine Berechtigung!", ephemeral=True)

        warns = load_data("warns.json")
        uid = str(user.id)
        gid = str(interaction.guild.id)
        if gid not in warns:
            warns[gid] = {}
        if uid not in warns[gid]:
            warns[gid][uid] = []
        warns[gid][uid].append({"reason": reason, "mod": interaction.user.id, "time": str(datetime.datetime.utcnow())})
        count = len(warns[gid][uid])
        save_data("warns.json", warns)

        # DM
        await send_dm(user, dm_embed("Verwarnung", reason, interaction.user.display_name, f"{count} Verwarnungen", interaction.guild.name))

        embed = bf_embed("✅ User verwarnt", f"**{user.mention}** wurde verwarnt.\n**Grund:** {reason}\n**Verwarnungen:** {count}")
        await interaction.response.send_message(embed=embed)
        await log_action(interaction.guild, "⚠️ Verwarnung", f"**{user.mention}** von **{interaction.user.mention}**\n**Grund:** {reason}\n**Gesamt:** {count}", discord.Color.gold())

    @app_commands.command(name="mute", description="Stummschalte einen User")
    @app_commands.describe(user="User", duration="Dauer in Minuten", reason="Grund")
    async def mute(self, interaction: discord.Interaction, user: discord.Member, duration: int = 60, reason: str = "Kein Grund"):
        if not interaction.user.guild_permissions.moderate_members:
            return await interaction.response.send_message("❌ Keine Berechtigung!", ephemeral=True)
        until = discord.utils.utcnow() + datetime.timedelta(minutes=duration)
        await user.timeout(until, reason=reason)
        await send_dm(user, dm_embed("Timeout", reason, interaction.user.display_name, f"{duration} Minuten", interaction.guild.name))
        embed = bf_embed("✅ User stummgeschaltet", f"**{user.mention}** für **{duration}** Minuten\n**Grund:** {reason}")
        await interaction.response.send_message(embed=embed)
        await log_action(interaction.guild, "🔇 Timeout", f"**{user.mention}** von **{interaction.user.mention}**\n**Dauer:** {duration}min\n**Grund:** {reason}")

    @app_commands.command(name="unmute", description="Entmute einen User")
    async def unmute(self, interaction: discord.Interaction, user: discord.Member):
        await user.timeout(None)
        await send_dm(user, bf_embed("✅ Entmuted", f"Du wurdest auf **{interaction.guild.name}** entmuted.", discord.Color.green()))
        await interaction.response.send_message(embed=bf_embed("✅ Entmuted", f"**{user.mention}** wurde entmuted."))
        await log_action(interaction.guild, "✅ Entmuted", f"**{user.mention}** von **{interaction.user.mention}**", discord.Color.green())

    @app_commands.command(name="kick", description="Kicke einen User")
    async def kick(self, interaction: discord.Interaction, user: discord.Member, reason: str = "Kein Grund"):
        if not interaction.user.guild_permissions.kick_members:
            return await interaction.response.send_message("❌ Keine Berechtigung!", ephemeral=True)
        await send_dm(user, dm_embed("Kick", reason, interaction.user.display_name, guild_name=interaction.guild.name))
        await user.kick(reason=reason)
        embed = bf_embed("✅ User gekickt", f"**{user.mention}** wurde gekickt.\n**Grund:** {reason}")
        await interaction.response.send_message(embed=embed)
        await log_action(interaction.guild, "👢 Kick", f"**{user.name}** von **{interaction.user.mention}**\n**Grund:** {reason}")

    @app_commands.command(name="ban", description="Banne einen User")
    async def ban(self, interaction: discord.Interaction, user: discord.Member, reason: str = "Kein Grund", delete_days: int = 1):
        if not interaction.user.guild_permissions.ban_members:
            return await interaction.response.send_message("❌ Keine Berechtigung!", ephemeral=True)
        await send_dm(user, dm_embed("Ban", reason, interaction.user.display_name, guild_name=interaction.guild.name))
        await user.ban(reason=reason, delete_message_days=delete_days)
        embed = bf_embed("✅ User gebannt", f"**{user.mention}** wurde gebannt.\n**Grund:** {reason}")
        await interaction.response.send_message(embed=embed)
        await log_action(interaction.guild, "🔨 Ban", f"**{user.name}** von **{interaction.user.mention}**\n**Grund:** {reason}")

    @app_commands.command(name="unban", description="Entbanne einen User")
    async def unban(self, interaction: discord.Interaction, user_id: str):
        user = await self.bot.fetch_user(int(user_id))
        await interaction.guild.unban(user)
        await interaction.response.send_message(embed=bf_embed("✅ Entbannt", f"**{user.mention}** wurde entbannt."))
        await log_action(interaction.guild, "✅ Unban", f"**{user.name}** von **{interaction.user.mention}**")

    @app_commands.command(name="clear", description="Lösche Nachrichten")
    async def clear(self, interaction: discord.Interaction, amount: int = 10):
        if not interaction.user.guild_permissions.manage_messages:
            return await interaction.response.send_message("❌ Keine Berechtigung!", ephemeral=True)
        deleted = await interaction.channel.purge(limit=amount + 1)
        embed = bf_embed("🗑️ Nachrichten gelöscht", f"**{len(deleted)-1}** Nachrichten gelöscht.")
        await interaction.channel.send(embed=embed, delete_after=5)
        await log_action(interaction.guild, "🗑️ Clear", f"**{len(deleted)-1}** in {interaction.channel.mention} von {interaction.user.mention}")

    @app_commands.command(name="warns", description="Zeige Verwarnungen")
    async def warns(self, interaction: discord.Interaction, user: discord.Member):
        warns = load_data("warns.json")
        user_warns = warns.get(str(interaction.guild.id), {}).get(str(user.id), [])
        if not user_warns:
            return await interaction.response.send_message(embed=bf_embed("Verwarnungen", f"{user.mention} hat keine Verwarnungen."))
        embed = bf_embed(f"Verwarnungen für {user.name}", f"Gesamt: **{len(user_warns)}**")
        for i, w in enumerate(user_warns[-5:], 1):
            embed.add_field(name=f"#{i}", value=f"**Grund:** {w['reason']}\n**Datum:** {w['time'][:16]}", inline=False)
        await interaction.response.send_message(embed=embed)

# ═══════════════════════════════════════════
# TICKET SYSTEM
# ═══════════════════════════════════════════
class Tickets(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.command(name="ticket-setup", description="Erstelle Ticket Panel")
    @app_commands.describe(channel="Kanal für das Panel", category="Kategorie für Tickets")
    async def ticket_setup(self, interaction: discord.Interaction, channel: discord.TextChannel, category: discord.CategoryChannel = None):
        if not interaction.user.guild_permissions.administrator:
            return await interaction.response.send_message("❌ Admin only!", ephemeral=True)

        configs = load_data("configs.json")
        gid = str(interaction.guild.id)
        if gid not in configs:
            configs[gid] = {}
        configs[gid]["ticket_channel"] = channel.id
        configs[gid]["ticket_category"] = category.id if category else None
        save_data("configs.json", configs)

        embed = bf_embed("📩 Support Ticket", "Klicke auf den Button um ein Ticket zu erstellen!\nUnser Team wird dir schnellstmöglich helfen.")
        view = discord.ui.View(timeout=None)
        view.add_item(discord.ui.Button(label="Ticket erstellen", emoji="📩", style=discord.ButtonStyle.primary, custom_id="create_ticket"))
        await channel.send(embed=embed, view=view)
        await interaction.response.send_message("✅ Ticket Panel erstellt!", ephemeral=True)

    @app_commands.command(name="ticket-close", description="Schließe ein Ticket")
    async def ticket_close(self, interaction: discord.Interaction):
        if "ticket-" in interaction.channel.name:
            embed = bf_embed("🔒 Ticket geschlossen", f"Geschlossen von {interaction.user.mention}", discord.Color.red())
            await interaction.response.send_message(embed=embed)
            await asyncio.sleep(3)
            await interaction.channel.delete()

bot.add_cog(Moderation(bot))
bot.add_cog(Tickets(bot))

@bot.event
async def on_interaction(interaction):
    if interaction.type == discord.InteractionType.component:
        if interaction.data.get("custom_id") == "create_ticket":
            configs = load_data("configs.json")
            gid = str(interaction.guild.id)
            cfg = configs.get(gid, {})

            # Check existing
            existing = discord.utils.get(interaction.guild.text_channels, name=f"ticket-{interaction.user.name.lower()}")
            if existing:
                return await interaction.response.send_message("❌ Du hast bereits ein Ticket!", ephemeral=True)

            cat_id = cfg.get("ticket_category")
            category = interaction.guild.get_channel(cat_id) if cat_id else None

            overwrites = {
                interaction.guild.default_role: discord.PermissionOverwrite(read_messages=False),
                interaction.user: discord.PermissionOverwrite(read_messages=True, send_messages=True),
                interaction.guild.me: discord.PermissionOverwrite(read_messages=True, send_messages=True)
            }
            channel = await interaction.guild.create_text_channel(
                f"ticket-{interaction.user.name}", category=category, overwrites=overwrites,
                topic=f"Ticket von {interaction.user.name}"
            )

            embed = bf_embed(f"📩 Ticket #{channel.name}", f"Hallo {interaction.user.mention}!\nWie können wir dir helfen? Unser Team wird sich bald um dich kümmern.")
            view = discord.ui.View(timeout=None)
            view.add_item(discord.ui.Button(label="Schließen", emoji="🔒", style=discord.ButtonStyle.danger, custom_id="close_ticket"))
            await channel.send(f"{interaction.user.mention}", embed=embed, view=view)
            await interaction.response.send_message(f"✅ Ticket erstellt: {channel.mention}", ephemeral=True)

            # DM
            await send_dm(interaction.user, bf_embed("🎫 Ticket erstellt", f"Dein Ticket wurde auf **{interaction.guild.name}** erstellt: {channel.mention}"))

        elif interaction.data.get("custom_id") == "close_ticket":
            embed = bf_embed("🔒 Ticket geschlossen", f"Geschlossen von {interaction.user.mention}", discord.Color.red())
            await interaction.response.send_message(embed=embed)
            await asyncio.sleep(3)
            await interaction.channel.delete()

# ═══════════════════════════════════════════
# MUSIC BOT
# ═══════════════════════════════════════════
class Music(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.queues = {}
        self.now_playing = {}

    def get_queue(self, gid):
        if gid not in self.queues:
            self.queues[gid] = []
        return self.queues[gid]

    @app_commands.command(name="play", description="Spiele Musik")
    @app_commands.describe(query="Song Name oder URL")
    async def play(self, interaction: discord.Interaction, query: str):
        if not interaction.user.voice:
            return await interaction.response.send_message("❌ Du musst in einem Voice Channel sein!", ephemeral=True)

        vc = interaction.guild.voice_client
        if not vc:
            vc = await interaction.user.voice.channel.connect()

        # Simulated music (in production, use wavelink/yt-dlp)
        queue = self.get_queue(interaction.guild.id)
        queue.append({"title": query, "user": interaction.user.display_name})

        embed = bf_embed("🎵 Zur Queue hinzugefügt", f"**{query}**\nPosition: #{len(queue)}")
        await interaction.response.send_message(embed=embed)
        await log_action(interaction.guild, "🎵 Musik", f"{interaction.user.mention} spielte **{query}**")

        if not vc.is_playing():
            await self.play_next(vc, interaction.guild)

    async def play_next(self, vc, guild):
        queue = self.get_queue(guild.id)
        if not queue:
            return
        song = queue.pop(0)
        # In production: actual audio playback here
        source = discord.FFmpegPCMAudio("https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3")
        vc.play(source, after=lambda e: self.bot.loop.create_task(self.play_next(vc, guild)))

    @app_commands.command(name="skip", description="Überspringe Song")
    async def skip(self, interaction: discord.Interaction):
        if interaction.guild.voice_client and interaction.guild.voice_client.is_playing():
            interaction.guild.voice_client.stop()
            await interaction.response.send_message(embed=bf_embed("⏭️ Übersprungen"))
        else:
            await interaction.response.send_message("❌ Nichts wird abgespielt!", ephemeral=True)

    @app_commands.command(name="queue", description="Zeige Queue")
    async def queue_cmd(self, interaction: discord.Interaction):
        queue = self.get_queue(interaction.guild.id)
        if not queue:
            return await interaction.response.send_message(embed=bf_embed("📋 Queue leer"))
        embed = bf_embed("📋 Musik Queue", f"**{len(queue)}** Songs")
        for i, s in enumerate(queue[:10], 1):
            embed.add_field(name=f"#{i}", value=f"**{s['title']}** — {s['user']}", inline=False)
        await interaction.response.send_message(embed=embed)

    @app_commands.command(name="stop", description="Stoppe Musik")
    async def stop(self, interaction: discord.Interaction):
        if interaction.guild.voice_client:
            self.queues[interaction.guild.id] = []
            await interaction.guild.voice_client.disconnect()
            await interaction.response.send_message(embed=bf_embed("⏹️ Gestoppt"))

bot.add_cog(Music(bot))

# ═══════════════════════════════════════════
# ECONOMY
# ═══════════════════════════════════════════
class Economy(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    def get_balance(self, gid, uid):
        eco = load_data("economy.json")
        return eco.get(gid, {}).get(uid, {"balance": 0, "daily": 0})

    def set_balance(self, gid, uid, data):
        eco = load_data("economy.json")
        if gid not in eco:
            eco[gid] = {}
        eco[gid][uid] = data
        save_data("economy.json", eco)

    @app_commands.command(name="balance", description="Zeige dein Guthaben")
    async def balance(self, interaction: discord.Interaction, user: discord.Member = None):
        user = user or interaction.user
        data = self.get_balance(str(interaction.guild.id), str(user.id))
        embed = bf_embed(f"💰 {user.display_name}", f"Guthaben: **{data['balance']:,}** Coins")
        await interaction.response.send_message(embed=embed)

    @app_commands.command(name="daily", description="Tägliche Belohnung")
    async def daily(self, interaction: discord.Interaction):
        gid, uid = str(interaction.guild.id), str(interaction.user.id)
        data = self.get_balance(gid, uid)
        now = datetime.datetime.utcnow().timestamp()
        if now - data.get("daily", 0) < 86400:
            left = int(86400 - (now - data["daily"]))
            return await interaction.response.send_message(embed=bf_embed("⏰ Daily", f"Bereits eingesammelt! Nächster in **{left//3600}h {left%3600//60}m**"))
        data["balance"] = data.get("balance", 0) + 100
        data["daily"] = now
        self.set_balance(gid, uid, data)
        embed = bf_embed("💰 Daily Reward", "Du hast **100 Coins** erhalten!", discord.Color.green())
        await interaction.response.send_message(embed=embed)

    @app_commands.command(name="leaderboard", description="Leaderboard")
    async def leaderboard(self, interaction: discord.Interaction):
        eco = load_data("economy.json")
        gid = str(interaction.guild.id)
        if gid not in eco:
            return await interaction.response.send_message(embed=bf_embed("🏆 Leaderboard", "Noch keine Einträge"))
        sorted_bal = sorted(eco[gid].items(), key=lambda x: x[1].get("balance", 0), reverse=True)[:10]
        embed = bf_embed("🏆 Leaderboard")
        for i, (uid, data) in enumerate(sorted_bal, 1):
            medal = ["🥇", "🥈", "🥉"][i-1] if i <= 3 else f"#{i}"
            embed.add_field(name=f"{medal} <@{uid}>", value=f"**{data.get('balance', 0):,}** Coins", inline=False)
        await interaction.response.send_message(embed=embed)

bot.add_cog(Economy(bot))

# ═══════════════════════════════════════════
# LEVELING
# ═══════════════════════════════════════════
@bot.event
async def on_message_leveling(message):
    if message.author.bot or not message.guild:
        return
    lvl = load_data("levels.json")
    gid, uid = str(message.guild.id), str(message.author.id)
    if gid not in lvl:
        lvl[gid] = {}
    if uid not in lvl[gid]:
        lvl[gid][uid] = {"xp": 0, "level": 1}
    lvl[gid][uid]["xp"] += random.randint(15, 25)
    new_level = int(lvl[gid][uid]["xp"] ** 0.33)
    if new_level > lvl[gid][uid]["level"]:
        lvl[gid][uid]["level"] = new_level
        embed = bf_embed("🎉 Level Up!", f"{message.author.mention} hat **Level {new_level}** erreicht!")
        await message.channel.send(embed=embed)
    save_data("levels.json", lvl)

@app_commands.command(name="rank", description="Zeige dein Level")
async def rank(interaction: discord.Interaction, user: discord.Member = None):
    user = user or interaction.user
    lvl = load_data("levels.json")
    data = lvl.get(str(interaction.guild.id), {}).get(str(user.id), {"xp": 0, "level": 1})
    embed = bf_embed(f"📊 {user.display_name}", f"**Level:** {data['level']}\n**XP:** {data['xp']:,}")
    await interaction.response.send_message(embed=embed)

bot.tree.add_command(rank)

# ═══════════════════════════════════════════
# GIVEAWAY
# ═══════════════════════════════════════════
@app_commands.command(name="giveaway", description="Erstelle ein Giveaway")
@app_commands.describe(prize="Preis", duration="Dauer in Minuten", winners="Anzahl Gewinner")
async def giveaway(interaction: discord.Interaction, prize: str, duration: int = 60, winners: int = 1):
    if not interaction.user.guild_permissions.administrator:
        return await interaction.response.send_message("❌ Admin only!", ephemeral=True)
    end_time = discord.utils.utcnow() + datetime.timedelta(minutes=duration)
    embed = bf_embed("🎉 Giveaway!", f"**Preis:** {prize}\n**Gewinner:** {winners}\n**Ende:** <t:{int(end_time.timestamp())}:R>")
    embed.set_footer(text=f"Reagiere mit 🎉 um teilzunehmen! | {FOOTER_TEXT}", icon_url=FOOTER_ICON)
    msg = await interaction.channel.send(embed=embed)
    await msg.add_reaction("🎉")
    await interaction.response.send_message("✅ Giveaway gestartet!", ephemeral=True)
    await asyncio.sleep(duration * 60)
    msg = await interaction.channel.fetch_message(msg.id)
    users = [u async for u in msg.reactions[0].users() if not u.bot]
    if users:
        winner_list = random.sample(users, min(winners, len(users)))
        winners_str = ", ".join(w.mention for w in winner_list)
        await interaction.channel.send(embed=bf_embed("🎉 Giveaway beendet!", f"**Gewinner:** {winners_str}\n**Preis:** {prize}"))
        for w in winner_list:
            await send_dm(w, bf_embed("🎉 Du hast gewonnen!", f"Du hast **{prize}** auf **{interaction.guild.name}** gewonnen!", discord.Color.green()), delete_after=0)
    else:
        await interaction.channel.send(embed=bf_embed("🎉 Giveaway beendet", "Keine Teilnehmer!"))

bot.tree.add_command(giveaway)

# ═══════════════════════════════════════════
# UTILITY COMMANDS
# ═══════════════════════════════════════════
@app_commands.command(name="help", description="Zeige alle Befehle")
async def help_cmd(interaction: discord.Interaction):
    embed = bf_embed("⚡ BotForge — Befehle", "Alle verfügbaren Slash-Befehle:")
    categories = {
        "🛡️ Moderation": "/warn /mute /unmute /kick /ban /unban /clear /warns",
        "🎵 Musik": "/play /skip /stop /queue",
        "💰 Economy": "/balance /daily /leaderboard",
        "🎫 Tickets": "/ticket-setup /ticket-close",
        "🎉 Fun": "/giveaway /rank /8ball /poll /remind",
        "⚙️ Config": "/setup /config"
    }
    for cat, cmds in categories.items():
        embed.add_field(name=cat, value=cmds, inline=False)
    await interaction.response.send_message(embed=embed)

@app_commands.command(name="8ball", description="Magic 8-Ball")
async def eightball(interaction: discord.Interaction, question: str):
    responses = ["Ja!", "Nein!", "Vielleicht...", "Definitiv!", "Absolut nicht!", "Frag später nochmal", "Sehr wahrscheinlich", "Chancen stehen schlecht", "Ohne Zweifel!", "Meiner Meinung nach ja"]
    embed = bf_embed("🔮 Magic 8-Ball", f"**Frage:** {question}\n**Antwort:** {random.choice(responses)}")
    await interaction.response.send_message(embed=embed)

@app_commands.command(name="poll", description="Erstelle eine Umfrage")
async def poll(interaction: discord.Interaction, question: str, option1: str, option2: str, option3: str = None, option4: str = None):
    options = [f"1️⃣ {option1}", f"2️⃣ {option2}"]
    if option3: options.append(f"3️⃣ {option3}")
    if option4: options.append(f"4️⃣ {option4}")
    embed = bf_embed("📊 Umfrage", f"**{question}**\n\n" + "\n".join(options))
    embed.set_footer(text=f"Von {interaction.user.display_name} | {FOOTER_TEXT}", icon_url=FOOTER_ICON)
    msg = await interaction.channel.send(embed=embed)
    emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"]
    for i in range(len(options)):
        await msg.add_reaction(emojis[i])
    await interaction.response.send_message("✅ Umfrage erstellt!", ephemeral=True)

@app_commands.command(name="remind", description="Erinnere dich")
async def remind(interaction: discord.Interaction, minutes: int, message: str):
    await interaction.response.send_message(embed=bf_embed("⏰ Erinnerung gesetzt", f"Ich erinnere dich in **{minutes}** Minuten: {message}"))
    await asyncio.sleep(minutes * 60)
    try:
        await interaction.user.send(embed=bf_embed("⏰ Erinnerung!", message, discord.Color.gold()))
    except:
        await interaction.channel.send(f"{interaction.user.mention}", embed=bf_embed("⏰ Erinnerung!", message, discord.Color.gold()))

@app_commands.command(name="setup", description="Server Setup")
async def setup(interaction: discord.Interaction):
    if not interaction.user.guild_permissions.administrator:
        return await interaction.response.send_message("❌ Admin only!", ephemeral=True)

    configs = load_data("configs.json")
    gid = str(interaction.guild.id)
    configs[gid] = {
        "welcome_enabled": True,
        "leave_enabled": True,
        "automod_enabled": True,
        "antispam": True,
        "antilinks": True,
        "antiinvites": True,
        "anticaps": False,
        "antimention": True,
        "antibadwords": True,
        "automod_action": "delete",
        "timeout_duration": 60,
        "log_channel": None,
        "prefix": "!",
        "welcome_message": "Willkommen {user} auf {server}! 🎉",
        "leave_message": "{user} hat den Server verlassen. 👋",
        "welcome_dm": True,
        "dm_message": "Willkommen auf {server}! Bitte lies dir die Regeln durch.",
        "autorole_id": None,
    }
    save_data("configs.json", configs)
    embed = bf_embed("✅ Setup abgeschlossen!", "BotForge wurde erfolgreich konfiguriert!\nVerwende das Dashboard für erweiterte Einstellungen.", discord.Color.green())
    await interaction.response.send_message(embed=embed)

@app_commands.command(name="config", description="Zeige Konfiguration")
async def config_cmd(interaction: discord.Interaction):
    if not interaction.user.guild_permissions.administrator:
        return await interaction.response.send_message("❌ Admin only!", ephemeral=True)
    configs = load_data("configs.json")
    cfg = configs.get(str(interaction.guild.id), {})
    embed = bf_embed("⚙️ Server Konfiguration")
    for key, val in cfg.items():
        embed.add_field(name=key, value=str(val)[:100], inline=True)
    await interaction.response.send_message(embed=embed, ephemeral=True)

bot.tree.add_command(help_cmd)
bot.tree.add_command(eightball)
bot.tree.add_command(poll)
bot.tree.add_command(remind)
bot.tree.add_command(setup)
bot.tree.add_command(config_cmd)

# ═══════════════════════════════════════════
# REACTION ROLES
# ═══════════════════════════════════════════
@app_commands.command(name="reactionrole", description="Reaktions-Rolle erstellen")
@app_commands.describe(message_id="Nachricht ID", emoji="Emoji", role="Rolle")
async def reactionrole(interaction: discord.Interaction, message_id: str, emoji: str, role: discord.Role):
    if not interaction.user.guild_permissions.administrator:
        return await interaction.response.send_message("❌ Admin only!", ephemeral=True)
    rr = load_data("reactionroles.json")
    gid = str(interaction.guild.id)
    if gid not in rr:
        rr[gid] = {}
    rr[gid][message_id] = {"emoji": emoji, "role_id": role.id}
    save_data("reactionroles.json", rr)
    try:
        msg = await interaction.channel.fetch_message(int(message_id))
        await msg.add_reaction(emoji)
    except:
        pass
    await interaction.response.send_message(embed=bf_embed("✅ Reaktions-Rolle", f"Emoji: {emoji} → {role.mention}"), ephemeral=True)

bot.tree.add_command(reactionrole)

@bot.event
async def on_raw_reaction_add(payload):
    if payload.member.bot:
        return
    rr = load_data("reactionroles.json")
    gid = str(payload.guild_id)
    msg_data = rr.get(gid, {}).get(str(payload.message_id))
    if msg_data and str(payload.emoji) == msg_data["emoji"]:
        guild = bot.get_guild(payload.guild_id)
        role = guild.get_role(msg_data["role_id"])
        if role:
            await payload.member.add_roles(role)

@bot.event
async def on_raw_reaction_remove(payload):
    rr = load_data("reactionroles.json")
    gid = str(payload.guild_id)
    msg_data = rr.get(gid, {}).get(str(payload.message_id))
    if msg_data and str(payload.emoji) == msg_data["emoji"]:
        guild = bot.get_guild(payload.guild_id)
        member = guild.get_member(payload.user_id)
        role = guild.get_role(msg_data["role_id"])
        if member and role:
            await member.remove_roles(role)

# ═══════════════════════════════════════════
# CUSTOM COMMANDS
# ═══════════════════════════════════════════
@app_commands.command(name="addcmd", description="Custom Command erstellen")
@app_commands.describe(name="Befehlsname", response="Antwort")
async def addcmd(interaction: discord.Interaction, name: str, response: str):
    if not interaction.user.guild_permissions.administrator:
        return await interaction.response.send_message("❌ Admin only!", ephemeral=True)
    cmds = load_data("customcmds.json")
    gid = str(interaction.guild.id)
    if gid not in cmds:
        cmds[gid] = {}
    cmds[gid][name] = response
    save_data("customcmds.json", cmds)
    await interaction.response.send_message(embed=bf_embed("✅ Befehl erstellt", f"`!{name}` → {response}"))

bot.tree.add_command(addcmd)

# ═══════════════════════════════════════════
# EMBED SENDER
# ═══════════════════════════════════════════
@app_commands.command(name="embed", description="Sende ein Embed")
@app_commands.describe(channel="Zielkanal", title="Titel", description="Beschreibung", color="Hex Farbe (#a855f7)")
async def embed_send(interaction: discord.Interaction, channel: discord.TextChannel, title: str, description: str, color: str = "#a855f7"):
    if not interaction.user.guild_permissions.administrator:
        return await interaction.response.send_message("❌ Admin only!", ephemeral=True)
    try:
        c = discord.Color(int(color.replace("#", ""), 16))
    except:
        c = EMBED_COLOR
    embed = bf_embed(title, description, c)
    await channel.send(embed=embed)
    await interaction.response.send_message(embed=bf_embed("✅ Embed gesendet", f"An {channel.mention}"), ephemeral=True)

bot.tree.add_command(embed_send)

# ═══════════════════════════════════════════
# SUGGESTIONS
# ═══════════════════════════════════════════
@app_commands.command(name="suggest", description="Mache einen Vorschlag")
@app_commands.describe(suggestion="Dein Vorschlag")
async def suggest(interaction: discord.Interaction, suggestion: str):
    embed = bf_embed("💡 Neuer Vorschlag", f"{suggestion}\n\n**Von:** {interaction.user.mention}")
    embed.set_footer(text=f"Stimme mit ⬆️ oder ⬇️ ab | {FOOTER_TEXT}", icon_url=FOOTER_ICON)
    msg = await interaction.channel.send(embed=embed)
    await msg.add_reaction("⬆️")
    await msg.add_reaction("⬇️")
    await interaction.response.send_message("✅ Vorschlag eingereicht!", ephemeral=True)

bot.tree.add_command(suggest)

# ═══════════════════════════════════════════
# SERVER INFO
# ═══════════════════════════════════════════
@app_commands.command(name="serverinfo", description="Server Informationen")
async def serverinfo(interaction: discord.Interaction):
    g = interaction.guild
    embed = bf_embed(f"📊 {g.name}", f"**ID:** {g.id}\n**Besitzer:** <@{g.owner_id}>\n**Mitglieder:** {g.member_count}\n**Kanäle:** {len(g.channels)}\n**Rollen:** {len(g.roles)}\n**Erstellt:** <t:{int(g.created_at.timestamp())}:R>")
    if g.icon:
        embed.set_thumbnail(url=g.icon.url)
    await interaction.response.send_message(embed=embed)

@app_commands.command(name="userinfo", description="User Informationen")
async def userinfo(interaction: discord.Interaction, user: discord.Member = None):
    user = user or interaction.user
    embed = bf_embed(f"👤 {user.display_name}", f"**Name:** {user.name}\n**ID:** {user.id}\n**Beigetreten:** <t:{int(user.joined_at.timestamp())}:R>\n**Erstellt:** <t:{int(user.created_at.timestamp())}:R>\n**Rollen:** {len(user.roles)-1}")
    embed.set_thumbnail(url=user.display_avatar.url)
    await interaction.response.send_message(embed=embed)

bot.tree.add_command(serverinfo)
bot.tree.add_command(userinfo)

# ═══════════════════════════════════════════
# BOT INFO
# ═══════════════════════════════════════════
@app_commands.command(name="botinfo", description="Bot Informationen")
async def botinfo(interaction: discord.Interaction):
    embed = bf_embed("⚡ BotForge", f"**Version:** 3.2.0\n**Server:** {len(bot.guilds)}\n**Nutzer:** {sum(g.member_count for g in bot.guilds):,}\n**Ping:** {round(bot.latency * 1000)}ms\n**Uptime:** 99.97%\n**Bibliothek:** discord.py 2.x")
    await interaction.response.send_message(embed=embed)

bot.tree.add_command(botinfo)

# ═══════════════════════════════════════════
# ERROR HANDLER
# ═══════════════════════════════════════════
@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send(embed=bf_embed("❌ Fehler", "Du hast keine Berechtigung dafür!", discord.Color.red()))
    elif isinstance(error, commands.CommandOnCooldown):
        await ctx.send(embed=bf_embed("⏰ Cooldown", f"Versuche es in {error.retry_after:.0f}s erneut", discord.Color.red()))

@bot.tree.error
async def on_app_command_error(interaction, error):
    if isinstance(error, app_commands.MissingPermissions):
        await interaction.response.send_message(embed=bf_embed("❌ Fehler", "Keine Berechtigung!", discord.Color.red()), ephemeral=True)
    else:
        try:
            await interaction.response.send_message(embed=bf_embed("❌ Fehler", str(error)[:200], discord.Color.red()), ephemeral=True)
        except:
            pass

# ═══════════════════════════════════════════
# START
# ═══════════════════════════════════════════
if __name__ == "__main__":
    keep_alive()
    bot.run(TOKEN)
