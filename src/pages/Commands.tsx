import { useState } from "react";
import { Search, Terminal, Shield, Music, Ticket, Sparkles, Crown, BarChart3, Zap } from "lucide-react";

const categories = [
  {
    name: "Moderation",
    icon: Shield,
    color: "from-red-500 to-pink-500",
    cmds: [
      { n: "/ban <user> [grund] [dauer] [delete_days]", d: "Bannt einen User mit optionalem Grund und Dauer" },
      { n: "/unban <user>", d: "Entbannt einen User" },
      { n: "/kick <user> [grund]", d: "Kickt einen User vom Server" },
      { n: "/timeout <user> <dauer> [grund]", d: "Timeout mit automatischer DM" },
      { n: "/untimeout <user>", d: "Entfernt Timeout" },
      { n: "/warn <user> <grund>", d: "Verwarnt einen User mit Log" },
      { n: "/warnings <user>", d: "Listet alle Warns" },
      { n: "/clearwarnings <user>", d: "Löscht alle Warns" },
      { n: "/mute <user>", d: "Mute (legacy Rolle)" },
      { n: "/unmute <user>", d: "Unmute" },
      { n: "/slowmode <sekunden>", d: "Setzt Slowmode" },
      { n: "/lock [channel]", d: "Sperrt Channel" },
      { n: "/unlock [channel]", d: "Entsperrt Channel" },
      { n: "/nuke [channel]", d: "Klont Channel (lösst alle Nachrichten)" },
    ],
  },
  {
    name: "Music",
    icon: Music,
    color: "from-violet-500 to-purple-500",
    cmds: [
      { n: "/play <query|url>", d: "Spielt Song von YouTube/Spotify/SoundCloud" },
      { n: "/pause", d: "Pausiert aktuellen Song" },
      { n: "/resume", d: "Setzt fort" },
      { n: "/skip", d: "Überspringt Song" },
      { n: "/stop", d: "Stoppt Player und leert Queue" },
      { n: "/queue", d: "Zeigt Queue" },
      { n: "/shuffle", d: "Mischt Queue" },
      { n: "/loop <off|track|queue>", d: "Loop-Modus" },
      { n: "/volume <0-150>", d: "Setzt Volume" },
      { n: "/seek <time>", d: "Springt zu Zeit" },
      { n: "/nowplaying", d: "Aktueller Song" },
      { n: "/lyrics", d: "Songtext" },
      { n: "/filter <name>", d: "Audio-Filter" },
      { n: "/247", d: "24/7 Mode Toggle" },
    ],
  },
  {
    name: "Tickets",
    icon: Ticket,
    color: "from-amber-500 to-orange-500",
    cmds: [
      { n: "/ticket new [kategorie]", d: "Erstellt ein Ticket" },
      { n: "/ticket close", d: "Schließt Ticket" },
      { n: "/ticket add <user>", d: "Fügt User hinzu" },
      { n: "/ticket remove <user>", d: "Entfernt User" },
      { n: "/ticket rename <name>", d: "Benennt Ticket um" },
      { n: "/ticket transcript", d: "Erstellt Transcript" },
      { n: "/ticket panel", d: "Sendet Panel-Embed" },
    ],
  },
  {
    name: "Welcome",
    icon: Sparkles,
    color: "from-green-500 to-emerald-500",
    cmds: [
      { n: "/welcome setup", d: "Setup-Wizard" },
      { n: "/welcome test", d: "Test-Nachricht" },
      { n: "/welcome channel <#channel>", d: "Channel setzen" },
      { n: "/welcome toggle", d: "Ein/Aus" },
      { n: "/leave setup", d: "Leave-Nachrichten Setup" },
    ],
  },
  {
    name: "Leveling",
    icon: BarChart3,
    color: "from-cyan-500 to-blue-500",
    cmds: [
      { n: "/rank [user]", d: "Zeigt Rank-Card" },
      { n: "/leaderboard", d: "Top 10 Leaderboard" },
      { n: "/level role add <level> <role>", d: "Reward hinzufügen" },
      { n: "/level role remove <level>", d: "Reward entfernen" },
      { n: "/level set <user> <level>", d: "Level setzen" },
      { n: "/level blacklist add <channel>", d: "Channel blacklisten" },
    ],
  },
  {
    name: "Utility",
    icon: Terminal,
    color: "from-slate-500 to-gray-500",
    cmds: [
      { n: "/help [command]", d: "Hilfe" },
      { n: "/ping", d: "Bot-Latenz" },
      { n: "/stats", d: "Server-Statistiken" },
      { n: "/serverinfo", d: "Server-Info" },
      { n: "/userinfo [user]", d: "User-Info" },
      { n: "/avatar [user]", d: "Avatar" },
      { n: "/banner [user]", d: "Banner" },
      { n: "/roleinfo <role>", d: "Rollen-Info" },
      { n: "/channelinfo [channel]", d: "Channel-Info" },
      { n: "/poll <frage>", d: "Umfrage" },
      { n: "/giveaway start", d: "Gewinnspiel starten" },
      { n: "/giveaway end", d: "Gewinnspiel beenden" },
      { n: "/remindme <zeit> <text>", d: "Erinnerung" },
      { n: "/translate <text>", d: "Übersetzen" },
    ],
  },
  {
    name: "Fun",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
    cmds: [
      { n: "/8ball <frage>", d: "Magische 8-Ball" },
      { n: "/meme", d: "Random Meme" },
      { n: "/cat", d: "Katzenbild" },
      { n: "/dog", d: "Hundebild" },
      { n: "/roll", d: "Würfel" },
      { n: "/coinflip", d: "Münzwurf" },
      { n: "/rps <wahl>", d: "Schere Stein Papier" },
    ],
  },
  {
    name: "Config",
    icon: Crown,
    color: "from-fuchsia-500 to-pink-500",
    cmds: [
      { n: "/automod toggle", d: "AutoMod ein/aus" },
      { n: "/automod filter <name>", d: "Filter aktivieren" },
      { n: "/log channel <#channel>", d: "Log-Channel setzen" },
      { n: "/log event <event>", d: "Event toggle" },
      { n: "/prefix <prefix>", d: "Legacy Prefix setzen" },
      { n: "/language <lang>", d: "Bot-Sprache" },
      { n: "/autorole <role>", d: "Auto-Role setzen" },
      { n: "/embed create", d: "Embed Builder öffnen" },
      { n: "/emoji add <name> <image>", d: "Emoji hinzufügen" },
      { n: "/customcmd create <name>", d: "Custom Command" },
    ],
  },
];

export default function Commands() {
  const [q, setQ] = useState("");
  const filtered = categories.map((c) => ({
    ...c,
    cmds: c.cmds.filter((cmd) => cmd.n.toLowerCase().includes(q.toLowerCase()) || cmd.d.toLowerCase().includes(q.toLowerCase())),
  })).filter((c) => c.cmds.length > 0);

  return (
    <div className="pt-28 pb-16 max-w-6xl mx-auto px-4">
      <div className="mb-10 fade-up">
        <h1 className="text-4xl sm:text-5xl font-black mb-3">
          Alle <span className="text-gradient">Commands</span>
        </h1>
        <p className="text-gray-400 mb-6">Über 100 Slash-Commands in {categories.length} Kategorien.</p>
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Command suchen..."
            className="input pl-11"
          />
        </div>
      </div>

      <div className="space-y-8">
        {filtered.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div key={i} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">{cat.name}</h2>
                <span className="text-xs text-gray-400 glass px-2 py-1 rounded-full">{cat.cmds.length} Commands</span>
              </div>
              <div className="glass p-4 space-y-1">
                {cat.cmds.map((c, j) => (
                  <div key={j} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition">
                    <code className="text-sm text-violet-300 font-mono min-w-[280px] flex-shrink-0">{c.n}</code>
                    <span className="text-sm text-gray-300">{c.d}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
