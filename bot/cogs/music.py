"""Music — Lavalink-basierter Player (YouTube, Spotify, SoundCloud).

Nutzt wavelink als Lavalink-Wrapper.
"""

import discord
from discord import app_commands
from discord.ext import commands

try:
    import wavelink
    WAVE_OK = True
except ImportError:
    WAVE_OK = False

from config import Config


class Music(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    async def cog_load(self):
        if not WAVE_OK:
            return
        # Node beim Start verbinden
        node = wavelink.Node(uri=f"http://{Config.LAVALINK_HOST}:{Config.LAVALINK_PORT}", password=Config.LAVALINK_PASSWORD)
        await wavelink.Pool.connect(nodes=[node], client=self.bot)

    @commands.Cog.listener()
    async def on_wavelink_track_start(self, payload: wavelink.TrackStartEventPayload):
        player = payload.player
        if not player.guild:
            return
        ch = player.guild.get_channel(getattr(player, "text_channel", 0) or 0)
        if not ch:
            return
        track = payload.track
        embed = discord.Embed(
            title="🎵 Jetzt spielt",
            description=f"[{track.title}]({track.uri})\nVon: `{track.author}` · Länge: `{track.length // 1000 // 60}:{track.length // 1000 % 60:02d}`",
            color=0x7C3AED,
        )
        if track.artwork:
            embed.set_thumbnail(url=track.artwork)
        embed.set_footer(text="BotForge · Music", icon_url=self.bot.user.display_avatar.url)
        await ch.send(embed=embed)

    music = app_commands.Group(name="music", description="Musik-Player")

    @music.command(name="play", description="Spielt einen Song")
    @app_commands.describe(query="Song-Name oder URL")
    async def play(self, itx: discord.Interaction, query: str):
        if not WAVE_OK:
            return await itx.response.send_message("❌ Music-Modul nicht installiert.", ephemeral=True)
        if not itx.user.voice or not itx.user.voice.channel:
            return await itx.response.send_message("❌ Du musst in einem Voice-Channel sein.", ephemeral=True)

        vc: wavelink.Player = itx.user.voice.channel.cls if hasattr(itx.user.voice.channel, "cls") else None
        if not vc or not vc.connected:
            vc = await itx.user.voice.channel.connect(cls=wavelink.Player)

        vc.text_channel = itx.channel.id
        tracks = await wavelink.Playable.search(query)
        if not tracks:
            return await itx.response.send_message("❌ Nichts gefunden.", ephemeral=True)
        track = tracks[0]
        await vc.play(track)
        await itx.response.send_message(f"🎶 Spiele: **{track.title}**")

    @music.command(name="pause", description="Pausiert")
    async def pause(self, itx: discord.Interaction):
        vc = itx.guild.voice_client
        if not vc:
            return await itx.response.send_message("❌ Spiele nichts.", ephemeral=True)
        await vc.pause(True)
        await itx.response.send_message("⏸️ Pausiert.")

    @music.command(name="resume", description="Fortsetzen")
    async def resume(self, itx: discord.Interaction):
        vc = itx.guild.voice_client
        if not vc:
            return await itx.response.send_message("❌ Spiele nichts.", ephemeral=True)
        await vc.pause(False)
        await itx.response.send_message("▶️ Fortgesetzt.")

    @music.command(name="skip", description="Überspringt Song")
    async def skip(self, itx: discord.Interaction):
        vc = itx.guild.voice_client
        if not vc:
            return await itx.response.send_message("❌ Spiele nichts.", ephemeral=True)
        await vc.skip()
        await itx.response.send_message("⏭️ Geskippt.")

    @music.command(name="stop", description="Stoppt und verlässt Channel")
    async def stop(self, itx: discord.Interaction):
        vc = itx.guild.voice_client
        if not vc:
            return await itx.response.send_message("❌ Nicht verbunden.", ephemeral=True)
        await vc.disconnect()
        await itx.response.send_message("👋 Verlassen.")

    @music.command(name="volume", description="Setzt Volume")
    @app_commands.describe(value="Volume 0-150")
    async def volume(self, itx: discord.Interaction, value: int):
        vc = itx.guild.voice_client
        if not vc:
            return await itx.response.send_message("❌ Spiele nichts.", ephemeral=True)
        value = max(0, min(150, value))
        await vc.set_volume(value)
        await itx.response.send_message(f"🔊 Volume: {value}%")


async def setup(bot):
    await bot.add_cog(Music(bot))
