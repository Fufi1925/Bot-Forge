"""Live Stats Hook — Die Website kann diese Daten über /api/stats abrufen."""

import discord
from discord.ext import commands
import datetime


class LiveStats(commands.Cog):
    """Sammelt Live-Daten für die Website."""

    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.messages_today = 0
        self.commands_today = 0
        self.last_reset = datetime.datetime.utcnow().date()

    @commands.Cog.listener()
    async def on_message(self, msg: discord.Message):
        if msg.author.bot:
            return
        today = datetime.datetime.utcnow().date()
        if today != self.last_reset:
            self.messages_today = 0
            self.commands_today = 0
            self.last_reset = today
        self.messages_today += 1

    @commands.Cog.listener()
    async def on_app_command_completion(self, itx: discord.Interaction, command):
        self.commands_today += 1

    @commands.Cog.listener()
    async def on_command_completion(self, ctx):
        self.commands_today += 1


async def setup(bot):
    await bot.add_cog(LiveStats(bot))
