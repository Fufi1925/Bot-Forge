"""Levels — XP für Nachrichten, Rank-Card, Rollen-Rewards."""

import datetime
import random
import discord
from discord import app_commands
from discord.ext import commands

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_OK = True
except ImportError:
    PIL_OK = False


class Levels(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.cooldowns: dict[int, dict[int, float]] = {}

    @commands.Cog.listener()
    async def on_message(self, msg: discord.Message):
        if not msg.guild or msg.author.bot:
            return
        cfg = await self.bot.get_guild_config(msg.guild.id)
        lvl = cfg.get("levels", {})
        if not lvl.get("enabled"):
            return
        # Blacklist
        if msg.channel.id in lvl.get("blacklist", []):
            return
        # Cooldown
        now = datetime.datetime.utcnow().timestamp()
        cd = self.cooldowns.setdefault(msg.guild.id, {})
        if now - cd.get(msg.author.id, 0) < lvl.get("cooldown", 60):
            return
        cd[msg.author.id] = now

        xp = random.randint(lvl.get("xp_min", 10), lvl.get("xp_max", 20))
        if not self.bot.db:
            return
        res = await self.bot.db.levels.find_one_and_update(
            {"guild": msg.guild.id, "user": msg.author.id},
            {"$inc": {"xp": xp}, "$setOnInsert": {"level": 0}},
            upsert=True,
            return_document=True,
        )
        old_level = res.get("level", 0)
        new_level = self._calc_level(res.get("xp", 0))
        if new_level > old_level:
            await self.bot.db.levels.update_one(
                {"guild": msg.guild.id, "user": msg.author.id},
                {"$set": {"level": new_level}},
            )
            if lvl.get("announce"):
                ch_id = lvl.get("announce_channel") or msg.channel.id
                ch = msg.guild.get_channel(int(ch_id))
                if ch:
                    await ch.send(f"🎉 {msg.author.mention} hat Level **{new_level}** erreicht!")

            # Reward-Rollen
            rewards = lvl.get("rewards", {})
            if str(new_level) in rewards:
                role = msg.guild.get_role(int(rewards[str(new_level)]))
                if role:
                    try:
                        await msg.author.add_roles(role)
                    except discord.Forbidden:
                        pass

    def _calc_level(self, xp: int) -> int:
        level = 0
        total = 0
        while True:
            need = 5 * (level ** 2) + 50 * level + 100
            if xp < total + need:
                return level
            total += need
            level += 1

    @app_commands.command(name="rank", description="Zeigt dein Rank-Card")
    async def rank(self, itx: discord.Interaction, user: discord.Member = None):
        user = user or itx.user
        if not self.bot.db:
            return await itx.response.send_message("Keine DB.", ephemeral=True)
        data = await self.bot.db.levels.find_one({"guild": itx.guild.id, "user": user.id}) or {"xp": 0, "level": 0}
        level = data["level"]
        xp = data["xp"]
        need = 5 * (level ** 2) + 50 * level + 100
        # Rank position
        rank = await self.bot.db.levels.count_documents({
            "guild": itx.guild.id,
            "xp": {"$gt": xp},
        }) + 1

        if PIL_OK:
            file = await self._render_card(user, level, xp, need, rank)
            return await itx.response.send_message(file=file)

        embed = discord.Embed(title=f"Rank von {user.display_name}", color=0x7C3AED)
        embed.add_field(name="Level", value=str(level), inline=True)
        embed.add_field(name="XP", value=f"{xp}/{need}", inline=True)
        embed.add_field(name="Rank", value=f"#{rank}", inline=True)
        embed.set_thumbnail(url=user.display_avatar.url)
        embed.set_footer(text="BotForge · Levels", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed)

    async def _render_card(self, user, level, xp, need, rank):
        import io, aiohttp
        img = Image.new("RGBA", (600, 200), (30, 30, 50, 255))
        draw = ImageDraw.Draw(img)
        async with aiohttp.ClientSession() as cs:
            async with cs.get(str(user.display_avatar.url)) as r:
                av = Image.open(io.BytesIO(await r.read())).convert("RGBA").resize((150, 150))
        img.paste(av, (25, 25), av)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
            small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
        except Exception:
            font = ImageFont.load_default()
            small = font
        draw.text((200, 30), user.display_name, fill="white", font=font)
        draw.text((200, 70), f"Rank #{rank} · Level {level}", fill="#a78bfa", font=small)
        # Progress bar
        draw.rounded_rectangle([200, 120, 570, 150], radius=10, fill="#222233")
        width = int((xp / need) * 370)
        draw.rounded_rectangle([200, 120, 200 + width, 150], radius=10, fill="#7c3aed")
        draw.text((200, 155), f"{xp}/{need} XP", fill="#cccccc", font=small)
        buf = io.BytesIO()
        img.save(buf, "PNG")
        buf.seek(0)
        return discord.File(buf, "rank.png")

    @app_commands.command(name="leaderboard", description="Top 10")
    async def leaderboard(self, itx: discord.Interaction):
        if not self.bot.db:
            return await itx.response.send_message("Keine DB.", ephemeral=True)
        top = await self.bot.db.levels.find({"guild": itx.guild.id}).sort("xp", -1).limit(10).to_list(10)
        lines = []
        for i, doc in enumerate(top, 1):
            u = itx.guild.get_member(doc["user"])
            name = u.display_name if u else f"User {doc['user']}"
            lines.append(f"**{i}.** {name} · Level {doc['level']} · {doc['xp']} XP")
        embed = discord.Embed(title="🏆 Leaderboard", description="\n".join(lines) or "Noch niemand aktiv.", color=0x7C3AED)
        embed.set_footer(text="BotForge", icon_url=self.bot.user.display_avatar.url)
        await itx.response.send_message(embed=embed)


async def setup(bot):
    await bot.add_cog(Levels(bot))
