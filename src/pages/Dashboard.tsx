import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Sparkles, Shield, Ticket, Music, FileText, Hash, Wand2,
  Crown, Command, MessageSquare, Settings, Bell, Smile, Activity, Users,
  Zap, BarChart3, LogOut, Upload, Plus, Trash2, Image as ImageIcon,
  Eye, Save, Check, Bot, Lock, Gift, Heart, Database, ScrollText, Star
} from "lucide-react";

/* ---------- Mock "real" data (in production this comes from the bot API) ---------- */
const MOCK_GUILDS = [
  { id: "847293018394820", name: "Nebula Gaming", icon: null, memberCount: 12483, color: "from-violet-500 to-pink-500" },
  { id: "293847293847293", name: "CyberDev Hub", icon: null, memberCount: 4832, color: "from-cyan-500 to-blue-500" },
  { id: "384756283746283", name: "ArtStation DE", icon: null, memberCount: 28394, color: "from-pink-500 to-rose-500" },
  { id: "495867394857394", name: "Music Lounge", icon: null, memberCount: 8472, color: "from-amber-500 to-orange-500" },
  { id: "586978495867394", name: "Anime Universe", icon: null, memberCount: 42938, color: "from-fuchsia-500 to-purple-500" },
  { id: "697089506978405", name: "Study Together", icon: null, memberCount: 3284, color: "from-emerald-500 to-teal-500" },
];

const MOCK_CHANNELS = [
  { id: "1", name: "general", type: "text" },
  { id: "2", name: "welcome", type: "text" },
  { id: "3", name: "logs", type: "text" },
  { id: "4", name: "tickets", type: "text" },
  { id: "5", name: "music", type: "voice" },
  { id: "6", name: "mod-log", type: "text" },
  { id: "7", name: "bot-commands", type: "text" },
];

const MOCK_ROLES = [
  { id: "1", name: "Admin", color: "#ef4444" },
  { id: "2", name: "Moderator", color: "#3b82f6" },
  { id: "3", name: "Member", color: "#22c55e" },
  { id: "4", name: "VIP", color: "#eab308" },
  { id: "5", name: "DJ", color: "#a855f7" },
];

/* ---------- Shared UI helpers ---------- */
function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label?: string }) {
  return (
    <button onClick={onChange} className={`switch ${on ? "on" : ""}`} aria-label={label}>
      <span className="sr-only">{label}</span>
    </button>
  );
}

function SectionCard({ title, desc, icon: Icon, children }: any) {
  return (
    <div className="glass p-6 mb-5">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center border border-violet-500/20">
            <Icon className="w-5 h-5 text-violet-300" />
          </div>
          <div>
            <h3 className="font-bold text-white">{title}</h3>
            {desc && <p className="text-xs text-gray-400">{desc}</p>}
          </div>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-gray-200">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function Row({ label, children }: any) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-300">{label}</span>
      {children}
    </div>
  );
}

/* ---------- Login View ---------- */
function LoginView() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 -mt-24">
      <div className="glass-strong max-w-md w-full p-10 text-center glow-violet fade-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center mx-auto mb-5 glow-violet">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black mb-2">BotForge Dashboard</h1>
        <p className="text-gray-400 mb-8 text-sm">Melde dich mit Discord an, um deine Server zu verwalten.</p>

        <a
          href="https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=identify%20guilds"
          className="btn-primary w-full inline-flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          Mit Discord anmelden
        </a>

        <p className="text-xs text-gray-500 mt-6">
          Durch die Anmeldung akzeptierst du unsere <a href="/terms" className="text-violet-400">Terms</a> & <a href="/privacy" className="text-violet-400">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

/* ---------- Server Picker ---------- */
function ServerPicker({ onSelect, onLogout }: { onSelect: (id: string) => void; onLogout: () => void }) {
  return (
    <div className="pt-28 pb-16 max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8 fade-up">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black mb-1">Wähle einen Server</h1>
          <p className="text-gray-400 text-sm">Server, auf denen du Manage Server Rechte hast.</p>
        </div>
        <button onClick={onLogout} className="btn-ghost text-sm inline-flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {MOCK_GUILDS.map((g, i) => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className="glass p-6 text-left hover-lift fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g.color} mb-4 flex items-center justify-center text-white font-black text-xl`}>
              {g.name[0]}
            </div>
            <h3 className="font-bold text-lg mb-1">{g.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <Users className="w-3 h-3" />
              {g.memberCount.toLocaleString()} Members
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-xs text-green-400 flex items-center gap-1.5">
                <span className="pulse-dot" style={{ width: 8, height: 8 }} /> Online
              </span>
              <span className="text-xs text-violet-400 font-semibold">Konfigurieren →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Dashboard Tabs Content ---------- */
function OverviewTab({ guild }: { guild: any }) {
  const stats = [
    { label: "Commands (24h)", value: "12,483", change: "+18%", icon: Command, color: "from-violet-500 to-purple-500" },
    { label: "Aktive User", value: guild.memberCount.toLocaleString(), change: "+127", icon: Users, color: "from-cyan-500 to-blue-500" },
    { label: "AutoMod Blocks", value: "284", change: "-12%", icon: Shield, color: "from-red-500 to-pink-500" },
    { label: "Tickets offen", value: "18", change: "+3", icon: Ticket, color: "from-amber-500 to-orange-500" },
    { label: "Music Sessions", value: "42", change: "live", icon: Music, color: "from-emerald-500 to-teal-500" },
    { label: "Avg. Latency", value: "47ms", change: "gut", icon: Activity, color: "from-fuchsia-500 to-pink-500" },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="glass p-5 hover-lift">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">{s.change}</span>
              </div>
              <div className="text-2xl font-bold text-gradient">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      <SectionCard title="Top Commands" desc="Meistgenutzte Befehle der letzten 7 Tage" icon={BarChart3}>
        {[
          { name: "/play", count: 4283, pct: 95 },
          { name: "/ticket", count: 1843, pct: 60 },
          { name: "/rank", count: 1248, pct: 45 },
          { name: "/warn", count: 482, pct: 20 },
          { name: "/skip", count: 384, pct: 15 },
        ].map((c) => (
          <div key={c.name} className="flex items-center gap-4">
            <code className="text-sm text-violet-300 w-24">{c.name}</code>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${c.pct}%` }} />
            </div>
            <span className="text-sm text-gray-300 w-20 text-right">{c.count.toLocaleString()}</span>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Recent Bot Actions" desc="Automatische Aktionen des Bots" icon={Zap}>
        <div className="space-y-2 text-sm">
          {[
            { t: "vor 2 min", a: "Nachricht in #general gelöscht (Invite-Link)", c: "text-red-400" },
            { t: "vor 5 min", a: "User timeout: 10 min (Spam)", c: "text-amber-400" },
            { t: "vor 12 min", a: "Welcome-Card gesendet für @newuser", c: "text-green-400" },
            { t: "vor 24 min", a: "Ticket #4738 geschlossen (Transcript erstellt)", c: "text-cyan-400" },
            { t: "vor 48 min", a: "Level-Up Rolle vergeben an @pro_gamer", c: "text-violet-400" },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${a.c.replace("text-", "bg-")}`} />
                <span className="text-gray-200">{a.a}</span>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">{a.t}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function WelcomeTab() {
  const [on, setOn] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);
  return (
    <>
      <SectionCard title="Welcome & Leave Messages" desc="Begrüße neue Member automatisch" icon={Sparkles}>
        <Row label="Welcome-Modul aktiviert">
          <Toggle on={on} onChange={() => setOn(!on)} label="toggle" />
        </Row>
        <Field label="Channel">
          <select className="select">
            {MOCK_CHANNELS.filter((c) => c.type === "text").map((c) => <option key={c.id}>#{c.name}</option>)}
          </select>
        </Field>
        <Field label="Willkommens-Nachricht" hint="Variablen: {user}, {server}, {membercount}, {createdate}">
          <textarea className="input min-h-24" defaultValue="Willkommen {user} auf **{server}**! 🎉 Du bist Mitglied #{membercount}." />
        </Field>
        <Field label="Banner hochladen (PNG/JPG, max. 8MB)" hint="Wird über der Welcome-Card angezeigt.">
          <label className="block">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]; if (f) setBanner(URL.createObjectURL(f));
            }} />
            <div className="input flex items-center justify-center gap-3 cursor-pointer hover:bg-white/10 min-h-24 border-dashed">
              {banner ? (
                <img src={banner} alt="banner" className="max-h-20 rounded" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400">Klicken zum Hochladen</span>
                </>
              )}
            </div>
          </label>
        </Field>
        <Row label="DM an User senden">
          <Toggle on={true} onChange={() => {}} label="dm" />
        </Row>
        <Row label="Auto-Role vergeben">
          <select className="select max-w-xs"><option>Member</option><option>Neu</option></select>
        </Row>
      </SectionCard>
    </>
  );
}

function AutomodTab() {
  const [enabled, setEnabled] = useState(true);
  return (
    <>
      <SectionCard title="AutoMod 2.0" desc="Schütze deinen Server automatisch" icon={Shield}>
        <Row label="AutoMod global aktivieren">
          <Toggle on={enabled} onChange={() => setEnabled(!enabled)} label="automod" />
        </Row>
      </SectionCard>

      <SectionCard title="Filter" icon={Lock}>
        {[
          { l: "Beleidigungen / Hate Speech", d: "KI-basierte Erkennung" },
          { l: "Invite-Links", d: "Blockt discord.gg Links" },
          { l: "Externe Links", d: "Alle außer Whitelist" },
          { l: "Massenerwähnungen", d: "> 5 Mentions in einer Nachricht" },
          { l: "Caps-Lock Spam", d: "> 70% Großbuchstaben" },
          { l: "Wort-Spam", d: "Gleiche Nachricht mehrfach" },
          { l: "NSFW-Content", d: "Bild-Scan via AI" },
          { l: "Token / Secret Leaks", d: "Erkennt API-Keys" },
        ].map((f, i) => (
          <Row key={i} label={f.l}>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 hidden sm:inline">{f.d}</span>
              <Toggle on={i !== 6} onChange={() => {}} label={f.l} />
            </div>
          </Row>
        ))}
      </SectionCard>

      <SectionCard title="Aktion bei Verstoß" icon={Zap}>
        <Field label="Erster Verstoß">
          <select className="select"><option>Nachricht löschen</option><option>Warn + DM</option><option>Timeout 1 min</option></select>
        </Field>
        <Field label="Zweiter Verstoß">
          <select className="select"><option>Timeout 10 min + DM</option><option>Timeout 1 h</option><option>Kick</option></select>
        </Field>
        <Field label="Dritter Verstoß">
          <select className="select"><option>Timeout 1 h + DM</option><option>Ban</option><option>Softban</option></select>
        </Field>
        <Row label="DM an User nach Aktion (mit Grund + Dauer)">
          <Toggle on={true} onChange={() => {}} label="dm" />
        </Row>
        <Row label="Embed nach 15 Sek automatisch löschen">
          <Toggle on={true} onChange={() => {}} label="delete" />
        </Row>
        <Field label="Whitelist-Rollen (diese sind immun)">
          <div className="flex flex-wrap gap-2">
            {MOCK_ROLES.slice(0, 2).map((r) => (
              <span key={r.id} className="text-xs px-3 py-1 rounded-full" style={{ background: r.color + "30", color: r.color }}>{r.name} ✕</span>
            ))}
            <button className="text-xs px-3 py-1 rounded-full bg-white/5 border border-dashed border-white/20">+ Rolle</button>
          </div>
        </Field>
      </SectionCard>
    </>
  );
}

function TicketTab() {
  return (
    <>
      <SectionCard title="Ticket-System" desc="Support-Tickets mit Transcripts" icon={Ticket}>
        <Row label="Tickets aktiviert">
          <Toggle on={true} onChange={() => {}} label="toggle" />
        </Row>
        <Field label="Ticket-Kategorie">
          <select className="select"><option>Tickets</option><option>Support</option></select>
        </Field>
        <Field label="Transcript-Channel">
          <select className="select">
            {MOCK_CHANNELS.filter((c) => c.type === "text").map((c) => <option key={c.id}>#{c.name}</option>)}
          </select>
        </Field>
        <Field label="Support-Team Rolle">
          <select className="select">
            {MOCK_ROLES.map((r) => <option key={r.id}>{r.name}</option>)}
          </select>
        </Field>
        <Row label="Ticket-Panel in Channel senden">
          <button className="btn-primary text-xs py-2 px-4">Panel senden</button>
        </Row>
      </SectionCard>

      <SectionCard title="Ticket-Kategorien" icon={Hash}>
        {[
          { n: "Allgemeine Frage", e: "❓", d: "FAQ & Hilfe" },
          { n: "Report", e: "⚠️", d: "User melden" },
          { n: "Partner", e: "🤝", d: "Partnerschaften" },
          { n: "Bug-Report", e: "🐛", d: "Fehler melden" },
        ].map((t, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="text-2xl">{t.e}</div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{t.n}</div>
              <div className="text-xs text-gray-400">{t.d}</div>
            </div>
            <button className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <button className="w-full py-2 rounded-xl border border-dashed border-white/20 text-sm text-gray-400 hover:bg-white/5 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Neue Kategorie
        </button>
      </SectionCard>
    </>
  );
}

function MusicTab() {
  return (
    <>
      <SectionCard title="Music Player" desc="YouTube, Spotify, SoundCloud" icon={Music}>
        <Row label="Music-Modul aktiviert">
          <Toggle on={true} onChange={() => {}} label="toggle" />
        </Row>
        <Field label="Music-Channel (optional, limitiert Commands)">
          <select className="select">
            <option>Überall erlaubt</option>
            {MOCK_CHANNELS.filter((c) => c.type === "voice").map((c) => <option key={c.id}>🔊 {c.name}</option>)}
          </select>
        </Field>
        <Row label="24/7 Mode">
          <Toggle on={false} onChange={() => {}} label="24/7" />
        </Row>
        <Row label="DJ-Rolle benötigt für /skip /stop">
          <Toggle on={true} onChange={() => {}} label="dj" />
        </Row>
        <Row label="Song-Request Embed anzeigen">
          <Toggle on={true} onChange={() => {}} label="embed" />
        </Row>
        <Row label="Max Queue-Länge">
          <input className="input max-w-24" type="number" defaultValue="100" />
        </Row>
        <Row label="Volume-Limit (%)">
          <input className="input max-w-24" type="number" defaultValue="150" />
        </Row>
      </SectionCard>
    </>
  );
}

function LoggingTab() {
  return (
    <>
      <SectionCard title="Advanced Logging" desc="Jede Aktion — auch Bot-Aktionen — wird geloggt" icon={FileText}>
        <Row label="Logging aktiviert">
          <Toggle on={true} onChange={() => {}} label="toggle" />
        </Row>
        <Field label="Log-Channel">
          <select className="select">
            {MOCK_CHANNELS.filter((c) => c.type === "text").map((c) => <option key={c.id}>#{c.name}</option>)}
          </select>
        </Field>
        <Row label="Auch Bot-Aktionen loggen">
          <Toggle on={true} onChange={() => {}} label="bot-logs" />
        </Row>
      </SectionCard>

      <SectionCard title="Events" icon={Bell}>
        {[
          "Nachricht gelöscht", "Nachricht bearbeitet", "Bulk-Delete",
          "Member joined", "Member left", "Member gebannt", "Member entbannt",
          "Rolle erstellt", "Rolle gelöscht", "Rolle bearbeitet",
          "Channel erstellt", "Channel gelöscht", "Channel bearbeitet",
          "Voice joined", "Voice left", "Voice switched",
          "User timeout", "User muten (manuell)", "User entmuten (manuell)",
          "Nickname geändert", "Avatar geändert",
          "Bot hat Nachricht gelöscht (AutoMod)", "Bot hat User getimeoutet",
          "Bot hat Ticket erstellt", "Bot hat Ticket geschlossen",
          "Invite erstellt", "Invite gelöscht",
        ].map((e, i) => (
          <Row key={i} label={e}>
            <Toggle on={i < 15} onChange={() => {}} label={e} />
          </Row>
        ))}
      </SectionCard>
    </>
  );
}

function ChannelLogsTab() {
  return (
    <SectionCard title="Channel-spezifische Logs" desc="Weise verschiedenen Channels eigene Log-Events zu" icon={Hash}>
      {[
        { n: "#mod-log", e: "Moderation, Timeouts, Bans, Mutes" },
        { n: "#server-log", e: "Channel/Rolle create/delete/edit" },
        { n: "#message-log", e: "Message delete/edit/bulk" },
        { n: "#voice-log", e: "Voice join/leave/switch" },
        { n: "#join-leave", e: "Member join/leave" },
        { n: "#ticket-log", e: "Ticket open/close/transcript" },
        { n: "#bot-log", e: "Nur Bot-Aktionen" },
      ].map((c, i) => (
        <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/5">
          <code className="text-sm text-cyan-300">{c.n}</code>
          <span className="text-xs text-gray-400 flex-1">{c.e}</span>
          <button className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30">Edit</button>
        </div>
      ))}
      <button className="w-full py-2 rounded-xl border border-dashed border-white/20 text-sm text-gray-400 hover:bg-white/5 flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Neuen Log-Channel hinzufügen
      </button>
    </SectionCard>
  );
}

function EmbedBuilderTab() {
  const [title, setTitle] = useState("Willkommen auf unserem Server! 🎉");
  const [desc, setDesc] = useState("Wir freuen uns, dass du hier bist. Lies bitte die Regeln in #rules und habe Spaß!");
  const [color, setColor] = useState("#7c3aed");
  const [banner, setBanner] = useState<string | null>(null);
  const footer = "BotForge · Automatische Nachricht";
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SectionCard title="Embed Editor" desc="Footer und Footer-Icon sind fest und können nicht geändert werden." icon={Wand2}>
        <Field label="Banner hochladen (optional)">
          <label className="block">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]; if (f) setBanner(URL.createObjectURL(f));
            }} />
            <div className="input flex items-center justify-center gap-3 cursor-pointer hover:bg-white/10 min-h-20 border-dashed">
              {banner ? <img src={banner} alt="banner" className="max-h-16 rounded" /> : (
                <><ImageIcon className="w-5 h-5 text-gray-400" /><span className="text-gray-400">Banner auswählen</span></>
              )}
            </div>
          </label>
        </Field>
        <Field label="Titel">
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Beschreibung">
          <textarea className="input min-h-24" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </Field>
        <Field label="Farbe">
          <div className="flex gap-3 items-center">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 rounded-lg bg-transparent cursor-pointer" />
            <input className="input flex-1 font-mono" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
        </Field>
        <Field label="Footer (fixiert)">
          <input className="input opacity-60" value={footer} readOnly />
          <p className="text-xs text-amber-400 mt-1 flex items-center gap-1"><Lock className="w-3 h-3" /> Footer und Footer-Icon sind durch BotForge fest vorgegeben.</p>
        </Field>
        <Field label="Senden an Channel">
          <div className="flex gap-2">
            <select className="select flex-1">
              {MOCK_CHANNELS.filter((c) => c.type === "text").map((c) => <option key={c.id}>#{c.name}</option>)}
            </select>
            <button className="btn-primary text-sm">Senden</button>
          </div>
        </Field>
      </SectionCard>

      <div>
        <div className="glass p-6 sticky top-24">
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
            <Eye className="w-4 h-4" /> Live Preview
          </div>
          <div className="embed-preview" style={{ borderLeftColor: color }}>
            {banner && <img src={banner} alt="banner" className="w-full rounded mb-3 max-h-40 object-cover" />}
            {title && <div className="font-bold mb-1" style={{ color }}>{title}</div>}
            {desc && <div className="text-gray-200 whitespace-pre-wrap text-sm">{desc}</div>}
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400" />
              BotForge · Heute um 12:34
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RolesTab() {
  return (
    <SectionCard title="Auto-Roles & Reaktions-Rollen" desc="Rollen automatisch vergeben" icon={Crown}>
      <Field label="Auto-Role beim Join">
        <select className="select">
          <option>Keine</option>
          {MOCK_ROLES.map((r) => <option key={r.id}>{r.name}</option>)}
        </select>
      </Field>
      <Field label="Verzögerung (Minuten)">
        <input className="input" type="number" defaultValue="0" />
      </Field>
      <div className="mt-6">
        <h4 className="text-sm font-semibold mb-3">Reaktions-Rollen</h4>
        {[
          { e: "🎮", r: "Gamer", c: "#a855f7" },
          { e: "🎨", r: "Artist", c: "#ec4899" },
          { e: "🎵", r: "Music Lover", c: "#06b6d4" },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-2">
            <span className="text-2xl">{r.e}</span>
            <span className="flex-1 text-sm">→ <span style={{ color: r.c }}>{r.r}</span></span>
            <button className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function LevelsTab() {
  return (
    <SectionCard title="Leveling-System" desc="XP für Aktivität, Rollen als Belohnung" icon={BarChart3}>
      <Row label="Leveling aktiviert"><Toggle on={true} onChange={() => {}} label="toggle" /></Row>
      <Row label="XP pro Nachricht"><input className="input max-w-24" type="number" defaultValue="15" /></Row>
      <Row label="XP-Cooldown (Sek.)"><input className="input max-w-24" type="number" defaultValue="60" /></Row>
      <Row label="Level-Up Nachricht"><Toggle on={true} onChange={() => {}} label="lvl" /></Row>
      <Field label="Level-Up Channel">
        <select className="select">
          <option>Aktueller Channel</option>
          {MOCK_CHANNELS.filter((c) => c.type === "text").map((c) => <option key={c.id}>#{c.name}</option>)}
        </select>
      </Field>
      <Field label="Rank-Card Hintergrund-Farbe">
        <div className="flex gap-3">
          <input type="color" defaultValue="#7c3aed" className="w-12 h-10 rounded-lg bg-transparent" />
          <input className="input flex-1 font-mono" defaultValue="#7c3aed" />
        </div>
      </Field>
      <h4 className="text-sm font-semibold mt-4 mb-2">Rollen-Rewards</h4>
      {[
        { l: 5, r: "Active" },
        { l: 15, r: "Regular" },
        { l: 30, r: "VIP" },
        { l: 50, r: "Legend" },
      ].map((r, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-2">
          <span className="text-sm text-gray-400 w-16">Level {r.l}</span>
          <span className="flex-1 text-sm">→ <span className="text-yellow-400">{r.r}</span></span>
          <button className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
    </SectionCard>
  );
}

function CustomCommandsTab() {
  return (
    <SectionCard title="Custom Commands" desc="Eigene Slash-Commands mit Variablen" icon={Command}>
      {[
        { n: "/rules", r: "Zeigt die Serverregeln" },
        { n: "/apply", r: "Bewerbungs-Link" },
        { n: "/socials", r: "Social Media Links" },
      ].map((c, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-2">
          <code className="text-sm text-violet-300 w-28">{c.n}</code>
          <span className="flex-1 text-sm text-gray-300">{c.r}</span>
          <button className="text-xs px-3 py-1 rounded-lg bg-white/10">Edit</button>
          <button className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <button className="w-full py-3 rounded-xl border border-dashed border-white/20 text-sm text-gray-400 hover:bg-white/5 flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Neuen Command erstellen
      </button>
    </SectionCard>
  );
}

function ModerationDMTab() {
  return (
    <SectionCard title="Moderations-DMs" desc="Automatische DMs bei Mod-Aktionen" icon={MessageSquare}>
      <p className="text-sm text-gray-400 mb-4">
        Wann immer ein User getimeoutet, gemutet, gekickt oder gebannt wird — auch manuell durch Moderatoren — erhält er automatisch eine DM mit Grund, Dauer und Aussteller.
      </p>
      {[
        { l: "DM bei Warn", d: "Mit Grund + Regelverstoß" },
        { l: "DM bei Timeout", d: "Mit Dauer + Grund + Moderator" },
        { l: "DM bei Mute", d: "Mit Grund + Moderator" },
        { l: "DM bei Kick", d: "Mit Grund + Moderator" },
        { l: "DM bei Ban", d: "Mit Grund + Dauer + Moderator" },
        { l: "DM bei AutoMod-Aktion", d: "Vom Bot automatisch ausgelöst" },
        { l: "DM Embed nach 15s löschen", d: "Löscht die öffentliche Embed-Nachricht" },
      ].map((c, i) => (
        <Row key={i} label={c.l}>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:inline">{c.d}</span>
            <Toggle on={true} onChange={() => {}} label={c.l} />
          </div>
        </Row>
      ))}
    </SectionCard>
  );
}

function CustomEmojisTab() {
  return (
    <SectionCard title="Custom Emojis" desc="Server-Emojis verwalten und hinzufügen" icon={Smile}>
      <p className="text-sm text-gray-400">Lade neue Emojis direkt über das Dashboard hoch. Unterstützt PNG, JPG, GIF (animiert).</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 my-4">
        {["🔥", "⚡", "💎", "🚀", "🎮", "🎯", "🌟", "💀", "👑", "🐛", "🎵", "🎨"].map((e, i) => (
          <div key={i} className="aspect-square glass flex items-center justify-center text-3xl hover-lift cursor-pointer">{e}</div>
        ))}
      </div>
      <button className="w-full py-3 rounded-xl border border-dashed border-white/20 text-sm text-gray-400 hover:bg-white/5 flex items-center justify-center gap-2">
        <Upload className="w-4 h-4" /> Emoji hochladen
      </button>
    </SectionCard>
  );
}

function ReactionRolesTab() {
  return (
    <>
      <SectionCard title="Reaktions-Rollen" desc="Rollen per Dropdown oder Reaction vergeben" icon={Heart}>
        <p className="text-sm text-gray-400 mb-4">
          Erstelle Dropdown-Menüs in Channels, über die User sich selbst Rollen zuweisen können.
          Bis zu 25 Optionen pro Menü.
        </p>
        <Field label="Channel für Rollen-Menü">
          <select className="select">
            {MOCK_CHANNELS.filter((c) => c.type === "text").map((c) => <option key={c.id}>#{c.name}</option>)}
          </select>
        </Field>
        <Field label="Platzhalter-Text im Dropdown">
          <input className="input" defaultValue="Wähle deine Rollen..." />
        </Field>
      </SectionCard>

      <SectionCard title="Aktive Menüs" icon={Hash}>
        {[
          { ch: "#roles-games", opts: ["🎮 Gamer", "🎯 FPS", "🎲 Strategy", "🏎️ Racing"], count: 4 },
          { ch: "#roles-notifications", opts: ["🔔 Announcements", "📰 News", "🎉 Events", "🎵 Music", "🎬 Movies"], count: 5 },
          { ch: "#roles-colors", opts: ["🔴 Rot", "🟢 Grün", "🔵 Blau", "🟡 Gelb", "🟣 Lila"], count: 5 },
        ].map((m, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/5 mb-3">
            <div className="flex items-center justify-between mb-2">
              <code className="text-sm text-cyan-300">{m.ch}</code>
              <span className="text-xs text-gray-400">{m.count} Optionen</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {m.opts.map((o, j) => (
                <span key={j} className="text-xs px-2 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20">{o}</span>
              ))}
            </div>
          </div>
        ))}
        <button className="w-full py-2 rounded-xl border border-dashed border-white/20 text-sm text-gray-400 hover:bg-white/5 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Neues Rollen-Menü erstellen
        </button>
      </SectionCard>
    </>
  );
}

function GiveawaysTab() {
  return (
    <>
      <SectionCard title="Giveaways" desc="Verlosungen mit Dropdown-Teilnahme" icon={Gift}>
        <Row label="Giveaway-Modul aktiviert"><Toggle on={true} onChange={() => {}} label="toggle" /></Row>
        <Field label="Standard Giveaway-Channel">
          <select className="select">
            {MOCK_CHANNELS.filter((c) => c.type === "text").map((c) => <option key={c.id}>#{c.name}</option>)}
          </select>
        </Field>
        <Field label="Ping-Rolle bei neuem Giveaway">
          <select className="select">
            <option>Keine</option>
            {MOCK_ROLES.map((r) => <option key={r.id}>{r.name}</option>)}
          </select>
        </Field>
        <Row label="Teilnahme nur per Button (nicht Reaction)">
          <Toggle on={true} onChange={() => {}} label="btn" />
        </Row>
        <Row label="Winner-Reroll erlauben">
          <Toggle on={true} onChange={() => {}} label="reroll" />
        </Row>
      </SectionCard>

      <SectionCard title="Aktive Giveaways" icon={Star}>
        {[
          { p: "🎁 Discord Nitro (1 Monat)", e: "in 2 Tagen", entries: 247 },
          { p: "🎮 20€ Steam Guthaben", e: "in 5 Tagen", entries: 182 },
          { p: "🎨 Custom Role", e: "in 12 Stunden", entries: 89 },
        ].map((g, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 mb-2">
            <div>
              <div className="font-semibold">{g.p}</div>
              <div className="text-xs text-gray-400">Endet {g.e} · {g.entries} Teilnehmer</div>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30">End</button>
          </div>
        ))}
        <button className="w-full py-2 rounded-xl border border-dashed border-white/20 text-sm text-gray-400 hover:bg-white/5 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Neues Giveaway starten
        </button>
      </SectionCard>
    </>
  );
}

function BackupTab() {
  return (
    <>
      <SectionCard title="Backup & Export" desc="Sichere deine komplette Server-Config" icon={Database}>
        <p className="text-sm text-gray-400 mb-4">
          Exportiere alle BotForge-Einstellungen deines Servers als JSON-Datei.
          Nützlich für Backups oder zum Übertragen auf einen anderen Server.
        </p>
        <div className="flex gap-3 flex-wrap">
          <button className="btn-primary text-sm inline-flex items-center gap-2">
            <Upload className="w-4 h-4" /> Config exportieren
          </button>
          <button className="btn-ghost text-sm inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Config importieren
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Verlauf" icon={ScrollText}>
        {[
          { t: "vor 2 Std.", a: "Config gespeichert (Welcome)", u: "@admin" },
          { t: "vor 1 Tag", a: "AutoMod Filter aktiviert", u: "@mod" },
          { t: "vor 3 Tagen", a: "Ticket-Kategorie hinzugefügt", u: "@admin" },
          { t: "vor 1 Woche", a: "Backup exportiert", u: "@owner" },
          { t: "vor 2 Wochen", a: "Music DJ-Rolle gesetzt", u: "@admin" },
        ].map((h, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <span className="text-sm text-gray-200">{h.a}</span>
            </div>
            <div className="text-xs text-gray-500 flex gap-3">
              <span>{h.u}</span>
              <span>{h.t}</span>
            </div>
          </div>
        ))}
      </SectionCard>
    </>
  );
}

function PremiumTab() {
  return (
    <div className="glass-strong p-10 text-center relative overflow-hidden glow-violet">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-pink-500/10" />
      <div className="relative">
        <Crown className="w-16 h-16 text-amber-400 mx-auto mb-5" />
        <h2 className="text-4xl font-black mb-3">BotForge <span className="text-gradient">Premium</span></h2>
        <p className="text-gray-300 mb-8 max-w-xl mx-auto">
          Schalte erweiterte Features für deinen Server frei: Custom Branding, 24/7 Music,
          erweiterte Analytics, Priority Support und mehr.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto text-left mb-8">
          {[
            { t: "🎨 Custom Branding", d: "Eigenes Logo, Farben und Name im Bot" },
            { t: "🎵 24/7 Music", d: "Bot bleibt dauerhaft im Voice" },
            { t: "📊 Erweiterte Analytics", d: "Detaillierte Statistiken & Graphen" },
            { t: "⚡ Priority Support", d: "Schnelle Hilfe vom Dev-Team" },
            { t: "🔓 Mehr Custom Commands", d: "Unbegrenzt statt 25" },
            { t: "🎫 Erweiterte Tickets", d: "Forms, Surveys, private Threads" },
          ].map((f, i) => (
            <div key={i} className="glass p-4">
              <div className="font-bold text-sm mb-1">{f.t}</div>
              <div className="text-xs text-gray-400">{f.d}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="https://discord.gg/botforge" target="_blank" rel="noopener noreferrer" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
            <Crown className="w-5 h-5" /> Upgrade für 4,99€/Monat
          </a>
          <a href="mailto:premium@botforge.app" className="btn-ghost">Enterprise anfragen</a>
        </div>
        <p className="text-xs text-gray-500 mt-4">Jederzeit kündbar · 30 Tage Geld-zurück-Garantie</p>
      </div>
    </div>
  );
}

function GeneralSettingsTab() {
  return (
    <>
      <SectionCard title="Allgemein" desc="Basis-Einstellungen" icon={Settings}>
        <Field label="Prefix (für legacy Commands)"><input className="input" defaultValue="!" /></Field>
        <Field label="Sprache">
          <select className="select">
            <option>🇩🇪 Deutsch</option>
            <option>🇬🇧 English</option>
            <option>🇫🇷 Français</option>
            <option>🇪🇸 Español</option>
            <option>🇮🇹 Italiano</option>
            <option>🇵🇹 Português</option>
            <option>🇷🇺 Русский</option>
            <option>🇯🇵 日本語</option>
          </select>
        </Field>
        <Field label="Zeitzone">
          <select className="select">
            <option>Europe/Berlin (UTC+1)</option>
            <option>Europe/London (UTC+0)</option>
            <option>America/New_York (UTC-5)</option>
          </select>
        </Field>
      </SectionCard>

      <SectionCard title="Gefahrenzone" icon={Lock}>
        <p className="text-sm text-gray-400">Diese Aktionen sind irreversibel.</p>
        <div className="flex gap-3 flex-wrap">
          <button className="btn-ghost text-sm border-red-500/30 text-red-400 hover:bg-red-500/10">Alle Daten zurücksetzen</button>
          <button className="btn-ghost text-sm border-red-500/30 text-red-400 hover:bg-red-500/10">Bot vom Server entfernen</button>
        </div>
      </SectionCard>
    </>
  );
}

/* ---------- Main Dashboard Component ---------- */
export default function Dashboard() {
  const { guildId } = useParams();
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(guildId || null);
  const [tab, setTab] = useState("overview");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Check URL for ?code= from Discord OAuth (demo: skip)
    const params = new URLSearchParams(window.location.search);
    if (params.get("code") || sessionStorage.getItem("bf_logged")) {
      setLoggedIn(true);
    }
    if (guildId) setSelectedGuildId(guildId);
  }, [guildId]);

  const guild = MOCK_GUILDS.find((g) => g.id === selectedGuildId);

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "welcome", label: "Welcome/Leave", icon: Sparkles },
    { id: "automod", label: "AutoMod", icon: Shield },
    { id: "tickets", label: "Tickets", icon: Ticket },
    { id: "music", label: "Music", icon: Music },
    { id: "logging", label: "Logging", icon: FileText },
    { id: "channellogs", label: "Channel Logs", icon: Hash },
    { id: "embed", label: "Embed Builder", icon: Wand2 },
    { id: "roles", label: "Roles", icon: Crown },
    { id: "reactionroles", label: "Reaction Roles", icon: Heart },
    { id: "levels", label: "Levels", icon: BarChart3 },
    { id: "giveaways", label: "Giveaways", icon: Gift },
    { id: "custom", label: "Custom Commands", icon: Command },
    { id: "dm", label: "Mod DMs", icon: MessageSquare },
    { id: "emojis", label: "Custom Emojis", icon: Smile },
    { id: "backup", label: "Backup", icon: Database },
    { id: "premium", label: "Premium", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!loggedIn) return <LoginView />;
  if (!selectedGuildId || !guild) {
    return <ServerPicker onSelect={(id) => { setSelectedGuildId(id); navigate(`/dashboard/${id}`); }} onLogout={() => { sessionStorage.removeItem("bf_logged"); setLoggedIn(false); }} />;
  }

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4">
      {/* Guild header */}
      <div className="glass p-5 mb-6 flex items-center justify-between gap-4 flex-wrap fade-up">
        <div className="flex items-center gap-4">
          <button onClick={() => { setSelectedGuildId(null); navigate("/dashboard"); }} className="text-sm text-gray-400 hover:text-white">← Server</button>
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${guild.color} flex items-center justify-center text-white font-black text-xl`}>
            {guild.name[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold">{guild.name}</h1>
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <Users className="w-3 h-3" /> {guild.memberCount.toLocaleString()} Members
              <span className="text-green-400 flex items-center gap-1 ml-2"><span className="pulse-dot" style={{ width: 6, height: 6 }} /> Bot online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-green-400 flex items-center gap-1 fade-up">
              <Check className="w-4 h-4" /> Gespeichert
            </span>
          )}
          <button onClick={handleSave} className="btn-primary text-sm inline-flex items-center gap-2">
            <Save className="w-4 h-4" /> Speichern
          </button>
        </div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="glass p-3 h-fit lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto sticky top-24">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`tab ${tab === t.id ? "active" : ""}`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </aside>

        {/* Content */}
        <div className="fade-up">
          {tab === "overview" && <OverviewTab guild={guild} />}
          {tab === "welcome" && <WelcomeTab />}
          {tab === "automod" && <AutomodTab />}
          {tab === "tickets" && <TicketTab />}
          {tab === "music" && <MusicTab />}
          {tab === "logging" && <LoggingTab />}
          {tab === "channellogs" && <ChannelLogsTab />}
          {tab === "embed" && <EmbedBuilderTab />}
          {tab === "roles" && <RolesTab />}
          {tab === "levels" && <LevelsTab />}
          {tab === "custom" && <CustomCommandsTab />}
          {tab === "dm" && <ModerationDMTab />}
          {tab === "emojis" && <CustomEmojisTab />}
          {tab === "reactionroles" && <ReactionRolesTab />}
          {tab === "giveaways" && <GiveawaysTab />}
          {tab === "backup" && <BackupTab />}
          {tab === "premium" && <PremiumTab />}
          {tab === "settings" && <GeneralSettingsTab />}
        </div>
      </div>
    </div>
  );
}
