import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Bot, Shield, Ticket, Music, MessageSquare, Sparkles, Zap, BarChart3,
  Users, Hash, Command, Activity, Lock, Wand2, ArrowRight, Play, Check,
  Crown, Bell, Globe, Cpu, Star, Rocket, Download, Settings,
  ChevronDown, ChevronUp, Gauge, Headphones, Code2, Database, Cloud,
  HeartHandshake, TrendingUp, Award, Terminal
} from "lucide-react";

function useCounter(target: number, duration = 2000, start = true) {
  const [value, setValue] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      setValue(Math.floor(p * target));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [target, duration, start]);
  return value;
}

function Stat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const v = useCounter(value);
  return (
    <div className="glass p-6 rounded-2xl hover-lift">
      <div className="text-4xl font-bold text-gradient">{v.toLocaleString()}{suffix}</div>
      <div className="text-sm text-gray-400 mt-2">{label}</div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition"
      >
        <span className="font-semibold">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-violet-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed fade-up">
          {a}
        </div>
      )}
    </div>
  );
}

const features = [
  { icon: Shield, title: "AutoMod 2.0", desc: "KI-gestützte Filter für Beleidigungen, Spam, Links, Caps, Invites, Massen-Pings und NSFW.", color: "from-red-500 to-pink-500" },
  { icon: Ticket, title: "Ticket-System", desc: "Dropdown-Menüs, Transcripts, Panel-Builder, private Threads und Team-Zuweisungen.", color: "from-amber-500 to-orange-500" },
  { icon: MessageSquare, title: "Welcome & Leave", desc: "Animierte Willkommens-Cards mit Banner-Upload, DM-Nachrichten und Rollen-Autoassign.", color: "from-green-500 to-emerald-500" },
  { icon: Music, title: "Music Player", desc: "YouTube, Spotify, SoundCloud — Queue, Loop, 24/7 Mode, Filters, Lyrics und Volume.", color: "from-violet-500 to-purple-500" },
  { icon: BarChart3, title: "Live Stats", desc: "Commands, Mitglieder, Nachrichten-Level, Voice-Minuten und Aktivitätscharts.", color: "from-cyan-500 to-blue-500" },
  { icon: Sparkles, title: "Custom Emojis", desc: "Lade Server-Emojis direkt über das Dashboard, Auto-Emoji-Steal mit Rechten.", color: "from-yellow-500 to-amber-500" },
  { icon: Lock, title: "Advanced Logging", desc: "Jede Aktion — auch Bot-Aktionen — mit Webhook, Filter und Channel-Zuweisung.", color: "from-slate-500 to-gray-500" },
  { icon: Wand2, title: "Embed Builder", desc: "Drag-and-drop Editor mit Banner-Upload, Farb-Picker und Live-Preview.", color: "from-fuchsia-500 to-pink-500" },
  { icon: Crown, title: "Leveling System", desc: "XP, Rank-Cards, Rollen-Rewards, Leaderboards und Blacklist-Channels.", color: "from-amber-400 to-yellow-500" },
  { icon: Command, title: "Custom Commands", desc: "Baue eigene Commands mit Variablen, Embeds, Reaktionen und Cooldowns.", color: "from-indigo-500 to-violet-500" },
  { icon: Bell, title: "DM Notifications", desc: "User bekommen automatische DMs bei Timeout, Mute, Kick, Ban — mit Grund und Dauer.", color: "from-sky-500 to-cyan-500" },
  { icon: Globe, title: "Multi-Language", desc: "Deutsch, Englisch, Französisch, Spanisch und 10 weitere Sprachen.", color: "from-emerald-500 to-teal-500" },
  { icon: Terminal, title: "Slash Commands", desc: "100+ moderne Slash-Commands mit Auto-Complete und eingebauter Hilfe.", color: "from-rose-500 to-red-500" },
  { icon: Gauge, title: "Live Dashboard", desc: "Konfiguriere alles per Web — kein einziger Command nötig.", color: "from-blue-500 to-indigo-500" },
  { icon: Headphones, title: "24/7 Support", desc: "Support-Server und schnelles Team für alle deine Fragen.", color: "from-lime-500 to-green-500" },
  { icon: Rocket, title: "Premium Features", desc: "Erweiterte Funktionen für Power-User und große Communities.", color: "from-pink-500 to-fuchsia-500" },
];

const commands = [
  { name: "/ticket", desc: "Erstelle ein Support-Ticket mit Panel" },
  { name: "/play", desc: "Spiele Musik von YouTube/Spotify" },
  { name: "/warn", desc: "Verwarne einen User mit Log" },
  { name: "/timeout", desc: "Timeout mit automatischer DM" },
  { name: "/embed", desc: "Embed Builder öffnen" },
  { name: "/level", desc: "Zeigt dein Rank-Card" },
  { name: "/automod", desc: "AutoMod konfigurieren" },
  { name: "/stats", desc: "Server-Statistiken anzeigen" },
];

const testimonials = [
  { name: "Nebula Gaming", members: "12,4k", quote: "BotForge hat 5 andere Bots auf unserem Server ersetzt. Das Dashboard ist genial.", color: "from-violet-500 to-pink-500" },
  { name: "ArtStation DE", members: "28,3k", quote: "Das AutoMod spart uns täglich Stunden an Moderationsarbeit.", color: "from-pink-500 to-rose-500" },
  { name: "Music Lounge", members: "8,4k", quote: "Der Music-Player ist butterweich und die Queue-Verwaltung perfekt.", color: "from-amber-500 to-orange-500" },
  { name: "CyberDev Hub", members: "4,8k", quote: "Tickets mit Dropdown und Transcripts — genau was wir brauchten.", color: "from-cyan-500 to-blue-500" },
  { name: "Anime Universe", members: "42,9k", quote: "Selbst bei 40k+ Membern läuft BotForge stabil und schnell.", color: "from-fuchsia-500 to-purple-500" },
  { name: "Study Together", members: "3,2k", quote: "Das Leveling-System motiviert unsere Community ungemein.", color: "from-emerald-500 to-teal-500" },
];

const techStack = [
  { icon: Code2, name: "Python 3.11", desc: "discord.py" },
  { icon: Gauge, name: "React + Vite", desc: "TypeScript" },
  { icon: Database, name: "MongoDB Atlas", desc: "Cloud DB" },
  { icon: Cloud, name: "Railway", desc: "Hosting" },
  { icon: Music, name: "Lavalink", desc: "Audio Engine" },
  { icon: Shield, name: "Discord OAuth2", desc: "Sicherer Login" },
];

export default function Home() {
  return (
    <div className="pt-24 pb-16">
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-24">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="orbit orbit-1" />
          <div className="orbit orbit-2" />
          <div className="orbit orbit-3" />
        </div>

        <div className="relative text-center max-w-4xl mx-auto">
          <div className="fade-up inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs mb-6 border border-violet-500/30">
            <span className="pulse-dot" />
            <span className="text-gray-300">Live auf <span className="text-white font-semibold">847 Servern</span> · v2.0 released</span>
          </div>

          <h1 className="fade-up fade-up-1 text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Der Discord-Bot<br />
            <span className="text-gradient">aus der Zukunft.</span>
          </h1>

          <p className="fade-up fade-up-2 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            BotForge ist der All-in-One Bot mit futuristischem Dashboard,
            AutoMod, Tickets, Music, Logging und 40+ weiteren Modulen — komplett
            per Web konfigurierbar.
          </p>

          <div className="fade-up fade-up-3 flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a
              href="https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Bot className="w-5 h-5" />
              Jetzt zu Discord hinzufügen
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link to="/dashboard" className="btn-ghost inline-flex items-center gap-2">
              <Play className="w-4 h-4" />
              Dashboard ansehen
            </Link>
          </div>

          <div className="fade-up fade-up-4 flex flex-wrap justify-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> Kostenlos</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> 99.9% Uptime</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> DSGVO-konform</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> 24/7 Support</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> 100+ Commands</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> Ticket-Dropdown</div>
          </div>
        </div>

        {/* Preview mockup */}
        <div className="relative mt-20 fade-up fade-up-4 max-w-5xl mx-auto">
          <div className="glass-strong p-2 rounded-2xl glow-violet">
            <div className="bg-[#0c0c18] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="ml-4 text-xs text-gray-400">dashboard.botforge.app/server/847293018</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                <div className="glass p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Commands heute</span>
                    <Zap className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-gradient">12,483</div>
                  <div className="text-xs text-green-400 mt-1">+18% vs. gestern</div>
                </div>
                <div className="glass p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">AutoMod Blocks</span>
                    <Shield className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-gradient">284</div>
                  <div className="text-xs text-green-400 mt-1">Server geschützt</div>
                </div>
                <div className="glass p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Aktive User</span>
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-gradient">1,932</div>
                  <div className="text-xs text-green-400 mt-1">+127 diese Woche</div>
                </div>
                <div className="glass p-4 md:col-span-3">
                  <div className="text-xs text-gray-400 mb-3">Aktivität der letzten 7 Tage</div>
                  <div className="flex items-end gap-2 h-24">
                    {[40, 65, 48, 80, 60, 92, 75].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-violet-500 to-cyan-400 rounded-t opacity-80" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat value={847} label="Aktive Server" />
          <Stat value={248000} label="Members gesamt" suffix="+" />
          <Stat value={12400000} label="Commands ausgeführt" suffix="+" />
          <Stat value={99} label="Uptime" suffix=".9%" />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs mb-4">
            <Rocket className="w-3 h-3 text-cyan-400" />
            <span>So funktioniert's</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            In 3 Schritten <span className="text-gradient">startklar.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Kein Programmieren, kein Kopfzerbrechen — einfach einladen und per Dashboard konfigurieren.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: "01", icon: Download, title: "Bot einladen", desc: "Klick auf 'Add to Discord' und wähle deinen Server. BotForge fragt nur nach nötigen Rechten." },
            { n: "02", icon: Settings, title: "Dashboard öffnen", desc: "Logge dich mit Discord ein, wähle deinen Server und konfiguriere alle Module per Mausklick." },
            { n: "03", icon: Sparkles, title: "Genießen", desc: "AutoMod, Tickets, Music und alles andere läuft automatisch. Du lehnst dich zurück." },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="glass p-8 relative hover-lift">
                <div className="absolute -top-4 -left-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center font-black text-lg glow-violet">
                  {s.n}
                </div>
                <Icon className="w-10 h-10 text-violet-400 mb-4 mt-4" />
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs mb-4">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span>Features</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Alles was dein Server <span className="text-gradient">braucht.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Über 40 Module — jedes einzelne über das Dashboard konfigurierbar, ohne jemals einen Befehl zu tippen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass p-6 hover-lift group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 glow-violet`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ticket Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs mb-4">
              <Ticket className="w-3 h-3 text-amber-400" />
              <span>Highlight · Ticket-System</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-5">
              Tickets mit <span className="text-gradient">Dropdown-Menü.</span>
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              User wählen per elegantem Discord-Dropdown ihre Ticket-Kategorie — Support, Report,
              Partner oder Bug-Report. Das Team wird automatisch zugewiesen und Transcripts werden
              gespeichert.
            </p>
            <ul className="space-y-3 text-sm text-gray-300">
              {[
                "Dropdown mit bis zu 25 Kategorien",
                "Auto-Claim durch Team-Members",
                "Transcripts als HTML oder TXT",
                "Private Threads als Alternative",
                "Feedback nach Ticket-Schließung",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass p-6">
            <div className="text-xs text-gray-400 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold">B</div>
              BotForge · Heute um 12:34
            </div>
            <div className="embed-preview" style={{ borderLeftColor: "#F59E0B" }}>
              <div className="font-bold mb-2">🎫 Support-Ticket erstellen</div>
              <div className="text-gray-300 text-sm mb-3">Wähle eine Kategorie, um ein Ticket zu öffnen.<br />Unser Team wird sich schnellstmöglich kümmern.</div>
              <div className="bg-black/40 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-black/60 transition">
                <span className="text-sm text-gray-300">Wähle eine Kategorie...</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <div className="mt-2 space-y-1">
                <div className="text-xs text-gray-400 p-2 bg-black/20 rounded flex items-center gap-2">❓ <span className="text-gray-300">Allgemeine Frage</span></div>
                <div className="text-xs text-gray-400 p-2 bg-black/20 rounded flex items-center gap-2">⚠️ <span className="text-gray-300">Report</span></div>
                <div className="text-xs text-gray-400 p-2 bg-black/20 rounded flex items-center gap-2">🤝 <span className="text-gray-300">Partner</span></div>
                <div className="text-xs text-gray-400 p-2 bg-black/20 rounded flex items-center gap-2">🐛 <span className="text-gray-300">Bug-Report</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs mb-4">
              <Command className="w-3 h-3 text-cyan-400" />
              <span>100+ Slash Commands</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-5">
              Alles per <span className="text-gradient">Slash Command.</span>
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Alle Befehle sind vollständig über Discord's Slash-Command-System verfügbar —
              mit Auto-Complete, Berechtigungs-Checks und eingebauter Hilfe.
            </p>
            <Link to="/commands" className="btn-primary inline-flex items-center gap-2">
              Alle Commands ansehen <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="glass p-6 space-y-2">
            {commands.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Hash className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-white">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.desc}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Warum <span className="text-gradient">BotForge?</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Cpu, title: "Blitzschnell", desc: "Gehostet auf Railway mit <50ms Response-Time und 99.9% Uptime." },
            { icon: Activity, title: "Live Dashboard", desc: "Alle Stats in Echtzeit — keine Fake-Zahlen, echte Discord API Daten." },
            { icon: Rocket, title: "Skaliert mit dir", desc: "Vom 10-Member-Server bis zum 100k-Member-Community — BotForge wächst mit." },
            { icon: HeartHandshake, title: "Community-driven", desc: "Feature-Requests werden ernst genommen und oft innerhalb einer Woche umgesetzt." },
            { icon: TrendingUp, title: "Immer besser", desc: "Wöchentliche Updates mit neuen Features und Verbesserungen." },
            { icon: Award, title: "Kostenlos für immer", desc: "Alle Kern-Features sind und bleiben kostenlos. Premium ist optional." },
          ].map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={i} className="glass p-8 text-center hover-lift">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{r.title}</h3>
                <p className="text-gray-400">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs mb-4">
            <Star className="w-3 h-3 text-yellow-400" />
            <span>Beliebt bei Top-Servern</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Von Communities <span className="text-gradient">geliebt.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="glass p-6 hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black`}>
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.members} Members</div>
                </div>
              </div>
              <p className="text-sm text-gray-300 italic">"{t.quote}"</p>
              <div className="flex gap-1 mt-3">
                {[1,2,3,4,5].map((s) => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs mb-4">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>Pricing</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Starte <span className="text-gradient">kostenlos.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Alle Kern-Features sind gratis. Premium gibt dir Extra-Power für große Communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="glass p-8 hover-lift">
            <h3 className="text-xl font-bold mb-2">Free</h3>
            <div className="text-4xl font-black mb-4">0€<span className="text-sm text-gray-400 font-normal">/mo</span></div>
            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Alle Kern-Features</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Dashboard-Zugang</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> AutoMod, Tickets, Music</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Community Support</li>
            </ul>
            <a href="https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands" target="_blank" rel="noopener noreferrer" className="btn-ghost w-full block text-center">Jetzt starten</a>
          </div>

          <div className="glass-strong p-8 hover-lift relative glow-violet">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-1 rounded-full font-bold">BELIEBT</div>
            <h3 className="text-xl font-bold mb-2">Premium</h3>
            <div className="text-4xl font-black mb-4">4,99€<span className="text-sm text-gray-400 font-normal">/mo</span></div>
            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Alles aus Free</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Custom Branding</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Erweiterte Analytics</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Priority Support</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> 24/7 Music Mode</li>
            </ul>
            <a href="https://discord.gg/botforge" target="_blank" rel="noopener noreferrer" className="btn-primary w-full block text-center">Upgrade</a>
          </div>

          <div className="glass p-8 hover-lift">
            <h3 className="text-xl font-bold mb-2">Enterprise</h3>
            <div className="text-4xl font-black mb-4">Custom</div>
            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Alles aus Premium</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Custom Bot-Branding</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> Dedicated Support</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-400" /> SLA-Garantie</li>
            </ul>
            <a href="mailto:enterprise@botforge.app" className="btn-ghost w-full block text-center">Kontakt</a>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Gebaut mit <span className="text-gradient">bestechender Tech.</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {techStack.map((t, i) => {
            const Icon = t.icon;
            return (
              <div key={i} className="glass p-5 text-center hover-lift">
                <Icon className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                <div className="font-bold text-sm">{t.name}</div>
                <div className="text-xs text-gray-400">{t.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Häufige <span className="text-gradient">Fragen.</span>
          </h2>
        </div>
        <div className="space-y-3">
          <FAQ q="Ist BotForge wirklich kostenlos?" a="Ja! Alle Kern-Features (AutoMod, Tickets, Music, Welcome, Leveling, Logging) sind komplett gratis. Premium bietet nur Zusatz-Features wie Custom Branding und erweiterte Analytics." />
          <FAQ q="Wie füge ich BotForge zu meinem Server hinzu?" a="Klicke einfach auf 'Add to Discord' oben auf der Seite, wähle deinen Server und bestätige die Berechtigungen. Danach kannst du alles über das Dashboard konfigurieren." />
          <FAQ q="Wo werden meine Daten gespeichert?" a="Alle Daten liegen DSGVO-konform auf Servern in der EU (MongoDB Atlas EU-Region). Wir speichern nur, was für den Betrieb nötig ist. Details in der Privacy Policy." />
          <FAQ q="Kann ich BotForge selbst hosten?" a="BotForge wird zentral von uns gehostet und gewartet. Du musst dich um nichts kümmern — der Bot läuft 24/7 auf unserer Infrastruktur. Self-Hosting wird aktuell nicht unterstützt." />
          <FAQ q="Wie funktioniert das Ticket-System?" a="Du sendest mit /ticket panel ein Embed mit Dropdown-Menü in einen Channel. User wählen per Dropdown ihre Kategorie (Support, Report, Partner, etc.) und das Ticket wird automatisch mit Team-Zuweisung erstellt." />
          <FAQ q="Unterstützt BotForge mehrere Sprachen?" a="Ja! Aktuell: Deutsch, Englisch, Französisch, Spanisch, Italienisch, Portugiesisch, Russisch, Japanisch — und weitere sind in Arbeit." />
          <FAQ q="Was ist wenn BotForge down ist?" a="Wir garantieren 99.9% Uptime. Auf /status siehst du live alle Services. Bei Problemen gibt es Updates auf unserem Discord Support Server." />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="glass-strong p-10 sm:p-14 text-center relative overflow-hidden glow-violet">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-cyan-500/20" />
          <div className="relative">
            <Star className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Bereit für die <span className="text-gradient">Zukunft?</span>
            </h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Schließe dich über 800 Servern an, die BotForge bereits vertrauen.
              Kostenlos starten — keine Kreditkarte nötig.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 justify-center"
              >
                <Bot className="w-5 h-5" /> Bot einladen
              </a>
              <Link to="/dashboard" className="btn-ghost inline-flex items-center gap-2 justify-center">
                Dashboard öffnen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
