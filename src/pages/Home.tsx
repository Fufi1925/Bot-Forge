import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Bot, ChevronRight, CheckCircle2, Headphones, Zap, Users, Shield, Music, Ticket, BarChart3, Lock, Globe, Sparkles, Star, MessageSquare, Brain, Gamepad2, Cake, Smile, TrendingUp, Clock, Filter, Hash, Tv, Send, Layout, BarChart2, Activity, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// ============ PARTICLE CANVAS ============
function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let mx = 0, my = 0;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    type P = { x: number; y: number; vx: number; vy: number; s: number; o: number; c: string; p: number; ps: number };
    let ps: P[] = [];
    const cols = ['rgba(6,182,212,', 'rgba(168,85,247,', 'rgba(236,72,153,', 'rgba(59,130,246,'];
    const init = () => {
      const n = Math.min(Math.floor(c.width * c.height / 15000), 100);
      ps = Array.from({ length: n }, () => ({
        x: Math.random() * c.width, y: Math.random() * c.height,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        s: Math.random() * 1.5 + 0.5, o: Math.random() * 0.4 + 0.1,
        c: cols[Math.floor(Math.random() * cols.length)],
        p: Math.random() * 6.28, ps: Math.random() * 0.02 + 0.005,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      // gradient orbs
      const t = Date.now() * 0.0003;
      [{ x: 0.3, y: 0.3, col: 'rgba(168,85,247,0.03)' }, { x: 0.7, y: 0.6, col: 'rgba(6,182,212,0.025)' }, { x: 0.5, y: 0.8, col: 'rgba(236,72,153,0.02)' }].forEach(o => {
        const gx = c.width * o.x + Math.sin(t * 1.2) * 80, gy = c.height * o.y + Math.cos(t) * 60;
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 280);
        g.addColorStop(0, o.col); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
      });
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy; p.p += p.ps;
        if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
        const op = p.o + Math.sin(p.p) * 0.1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.28);
        ctx.fillStyle = p.c + op + ')'; ctx.fill();
        // mouse lines
        const dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 180) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my);
          ctx.strokeStyle = 'rgba(6,182,212,' + ((1 - d / 180) * 0.12) + ')';
          ctx.lineWidth = 0.5; ctx.stroke();
          p.vx += dx * 0.000015; p.vy += dy * 0.000015;
        }
      }
      // connections
      for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
        const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) {
          ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y);
          ctx.strokeStyle = 'rgba(168,85,247,' + ((1 - d / 90) * 0.05) + ')';
          ctx.lineWidth = 0.4; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    resize(); init(); draw();
    window.addEventListener('resize', () => { resize(); init(); });
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    return () => { cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none" />;
}

// ============ FEATURES DATA ============
const FEAT = [
  { i: <Shield className="w-6 h-6" />, t: 'Auto Mod', d: 'KI-Moderation + DM bei jeder Aktion', c: 'from-cyan-500 to-blue-500' },
  { i: <Music className="w-6 h-6" />, t: 'Musik', d: 'Play, Queue, DJ-Modus, 24/7', c: 'from-purple-500 to-pink-500' },
  { i: <Ticket className="w-6 h-6" />, t: 'Tickets', d: 'Panel, Transkripte, DM, Auto-Close', c: 'from-pink-500 to-rose-500' },
  { i: <Users className="w-6 h-6" />, t: 'Welcome/Leave', d: 'Embed, Banner, DM, Auto-Rolle', c: 'from-green-500 to-emerald-500' },
  { i: <Zap className="w-6 h-6" />, t: 'Commands', d: 'Eigene Befehle mit Embeds & Variablen', c: 'from-yellow-500 to-orange-500' },
  { i: <BarChart3 className="w-6 h-6" />, t: 'Logging', d: 'Alle Aktionen loggen, auch Bot-Aktionen', c: 'from-indigo-500 to-violet-500' },
  { i: <MessageSquare className="w-6 h-6" />, t: 'Embed Builder', d: 'Builder mit Banner-Upload & Dropdowns', c: 'from-teal-500 to-cyan-500' },
  { i: <Lock className="w-6 h-6" />, t: 'Verification', d: 'Reaktion, Button, Captcha', c: 'from-red-500 to-pink-500' },
  { i: <Globe className="w-6 h-6" />, t: 'Giveaways', d: 'Multi-Winner, Requirements, DM', c: 'from-amber-500 to-yellow-500' },
  { i: <Sparkles className="w-6 h-6" />, t: 'Economy', d: 'Shop, Daily, Work, Rob, Leaderboard', c: 'from-fuchsia-500 to-purple-500' },
  { i: <Brain className="w-6 h-6" />, t: 'KI-Assistent', d: 'GPT-4/Claude Integration', c: 'from-sky-500 to-blue-500' },
  { i: <Activity className="w-6 h-6" />, t: 'Backup', d: 'Auto-Backup, Restore, Templates', c: 'from-lime-500 to-green-500' },
  { i: <Smile className="w-6 h-6" />, t: 'Reaction Roles', d: 'Toggle, Single, Multi, Unique', c: 'from-rose-500 to-orange-500' },
  { i: <MessageSquare className="w-6 h-6" />, t: 'Vorschläge', d: 'Up/Downvotes, Auto-Approval', c: 'from-green-400 to-teal-500' },
  { i: <BarChart2 className="w-6 h-6" />, t: 'Umfragen', d: 'Multi-Option, Zeitlimits', c: 'from-orange-400 to-amber-500' },
  { i: <Clock className="w-6 h-6" />, t: 'Erinnerungen', d: 'Einmalig oder wiederkehrend', c: 'from-blue-400 to-indigo-500' },
  { i: <TrendingUp className="w-6 h-6" />, t: 'Leveling', d: 'XP, Rank Cards, Level-Rollen', c: 'from-emerald-400 to-green-500' },
  { i: <Filter className="w-6 h-6" />, t: 'Wort-Filter', d: 'Regex, Auto-Löschung, DM', c: 'from-red-400 to-rose-500' },
  { i: <Tv className="w-6 h-6" />, t: 'Social Notify', d: 'YouTube, Twitch, Twitter', c: 'from-red-500 to-pink-600' },
  { i: <Cake className="w-6 h-6" />, t: 'Geburtstage', d: 'Auto-Gruß, Rolle, Event', c: 'from-pink-400 to-fuchsia-500' },
  { i: <Hash className="w-6 h-6" />, t: 'Temp. Kanäle', d: 'Auto-Erstellung & Löschung', c: 'from-indigo-400 to-violet-500' },
  { i: <Layout className="w-6 h-6" />, t: 'Templates', d: 'Fertige Server-Vorlagen', c: 'from-violet-400 to-purple-500' },
  { i: <Gamepad2 className="w-6 h-6" />, t: 'Minispiele', d: '12+ Spiele für die Community', c: 'from-purple-400 to-fuchsia-500' },
  { i: <Send className="w-6 h-6" />, t: 'Embed Sender', d: 'Embeds aus dem Dashboard senden', c: 'from-rose-400 to-red-500' },
];

// ============ HOME PAGE ============
export default function Home() {
  const { isLogged, mobMenu, setMob } = useAuth();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 400); }, []);

  const navs = [
    { to: '/', l: 'Home' }, { to: '/status', l: 'Status' }, { to: '/logs', l: 'Logs' },
    { to: '/terms', l: 'Terms' }, { to: '/privacy', l: 'Privacy' },
  ];

  return (
    <div className="min-h-screen grid-bg relative">
      <Particles />

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 glass-s anim-fade-in" style={{ animationDelay: '0s' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">⚡</div>
            <span className="text-base font-bold grad-text hide-mobile">BotForge</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navs.map(n => <Link key={n.to} to={n.to} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all">{n.l}</Link>)}
          </div>
          <div className="flex items-center gap-2 z-10">
            {isLogged ? (
              <Link to="/dashboard" className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold">Dashboard</Link>
            ) : (
              <Link to="/login" className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-semibold">Bot hinzufügen</Link>
            )}
            <button onClick={() => setMob(!mobMenu)} className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-gray-400">
              {mobMenu ? '✕' : '☰'}
            </button>
          </div>
        </div>
        {mobMenu && (
          <div className="md:hidden border-t border-white/5 px-4 pb-3 anim-fade-in">
            {navs.map(n => <Link key={n.to} to={n.to} onClick={() => setMob(false)} className="block px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5">{n.l}</Link>)}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex items-center justify-center pt-14">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/[0.015] rounded-full anim-spin" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-6 anim-fade-up">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 anim-pulse" />
            <span className="text-[11px] text-gray-400">v3.2 — 25+ Module verfügbar</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 anim-fade-up d1 leading-tight">
            <span className="grad-text">BotForge</span>
            <br /><span className="text-white/90">Die Zukunft der</span>
            <br /><span className="text-white/90">Discord Bots</span>
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto mb-8 anim-fade-up d2">
            Der fortschrittlichste Discord Bot. <span className="text-cyan-400">Moderation</span>, Musik, Tickets, KI-Assistent und <span className="text-purple-400">mehr</span> — steuerbar über ein futuristisches Dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 anim-fade-up d3">
            <Link to="/login" className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 anim-grad">
              <Bot className="w-5 h-5" /> BotForge invite <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto px-6 py-3 rounded-xl glass neon-b text-white font-semibold text-sm flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> Dashboard
            </Link>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-14 anim-fade-up d4">
            {[
              { v: '52,847', l: 'Server' }, { v: '2.1M+', l: 'Nutzer' }, { v: '99.97%', l: 'Uptime' }, { v: '23ms', l: 'Latenz' },
            ].map((s, i) => (
              <div key={i} className={`glass rounded-xl p-4 text-center transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
                <div className="text-xl font-bold grad-text">{loaded ? s.v : '—'}</div>
                <div className="text-[10px] text-gray-500 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Alles was du <span className="grad-text">brauchst</span></h2>
            <p className="text-xs text-gray-400">25 leistungsstarke Module für deinen Server</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {FEAT.map((f, i) => (
              <div key={i} className="card group cursor-pointer anim-scale-in" style={{ animationDelay: `${i * 25}ms` }}>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${f.c} flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform`}>{f.i}</div>
                <h3 className="text-xs font-bold text-white mb-0.5">{f.t}</h3>
                <p className="text-[10px] text-gray-500 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10">So einfach <span className="grad-text">geht's</span></h2>
          <div className="grid md:grid-cols-3 gap-4">
            {['🤖', '🎛️', '✨'].map((e, i) => (
              <div key={i} className="card neon-b p-6 text-center">
                <div className="text-3xl mb-2">{e}</div>
                <div className="text-[10px] font-mono text-purple-400 mb-1 tracking-widest">SCHRITT 0{i + 1}</div>
                <h3 className="text-sm font-bold text-white mb-1">{['Bot invite', 'Dashboard öffnen', 'Alles einstellen'][i]}</h3>
                <p className="text-[10px] text-gray-400">{['Füge BotForge hinzu.', 'Melde dich an.', 'Konfiguriere alles live.'][i]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="py-16 relative z-10">
        <div className="max-w-5xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-black mb-6">Gebaut für die <span className="grad-text">Zukunft</span></h2>
            <div className="space-y-3">
              {['Jede Aktion wird geloggt', 'DM bei jeder Mod-Aktion', 'Blitzschnell (unter 50ms)', 'Echtzeit Dashboard', 'DSGVO-konform', 'Wöchentliche Updates'].map((t, i) => (
                <div key={i} className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-300">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-s rounded-xl p-4 neon-b">
            <div className="flex gap-1.5 mb-3"><div className="w-2 h-2 rounded-full bg-red-500" /><div className="w-2 h-2 rounded-full bg-yellow-500" /><div className="w-2 h-2 rounded-full bg-green-500" /></div>
            {[
              { i: <Shield className="w-4 h-4" />, t: 'Auto Mod', s: '142 Aktionen heute', c: 'from-cyan-500 to-blue-500' },
              { i: <Music className="w-4 h-4" />, t: 'Music', s: 'Spielt • Lo-fi Beats', c: 'from-purple-500 to-pink-500' },
              { i: <Ticket className="w-4 h-4" />, t: 'Tickets', s: '3 offen', c: 'from-green-500 to-emerald-500' },
              { i: <BarChart3 className="w-4 h-4" />, t: 'Logging', s: '1,247 Events', c: 'from-yellow-500 to-orange-500' },
            ].map((x, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] mb-2 last:mb-0">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${x.c} flex items-center justify-center text-white`}>{x.i}</div>
                  <div><div className="text-[11px] font-semibold text-white">{x.t}</div><div className="text-[9px] text-gray-500">{x.s}</div></div>
                </div>
                <div className="w-8 h-[18px] rounded-full bg-gradient-to-r from-purple-500 to-pink-500 relative"><div className="absolute right-[3px] top-[2px] w-[14px] h-[14px] bg-white rounded-full" /></div>
              </div>
            ))}
            <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/5"><div className="w-1.5 h-1.5 rounded-full bg-green-400 anim-pulse" /><span className="text-[9px] text-gray-600">Live • Alle Systeme OK</span></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 relative z-10">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="glass-s rounded-2xl p-8 md:p-10 neon-border relative overflow-hidden">
            <h2 className="text-2xl font-black mb-3">Bereit für die <span className="grad-text">Zukunft</span>?</h2>
            <p className="text-xs text-gray-400 mb-6">Füge BotForge hinzu und erlebe Discord wie nie zuvor.</p>
            <Link to="/login" className="inline-flex px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-bold text-sm gap-2 items-center">
              <Bot className="w-4 h-4" /> Jetzt starten
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div><span className="font-bold grad-text text-sm">⚡ BotForge</span><p className="text-[10px] text-gray-600 mt-1">Der fortschrittlichste Discord Bot.</p></div>
            <div><h4 className="font-semibold text-white text-xs mb-2">Produkt</h4>{['Features', 'Status', 'Changelog'].map(l => <a key={l} href="#" className="block text-[10px] text-gray-600 hover:text-white py-0.5">{l}</a>)}</div>
            <div><h4 className="font-semibold text-white text-xs mb-2">Legal</h4>{[{ l: 'Terms', to: '/terms' }, { l: 'Privacy', to: '/privacy' }].map(x => <Link key={x.l} to={x.to} className="block text-[10px] text-gray-600 hover:text-white py-0.5">{x.l}</Link>)}</div>
            <div><h4 className="font-semibold text-white text-xs mb-2">Status</h4><Link to="/status" className="text-[10px] text-green-400">● Operational</Link></div>
          </div>
          <p className="text-[10px] text-gray-700 text-center">© 2024 BotForge. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
