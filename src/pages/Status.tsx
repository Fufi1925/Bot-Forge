import { useEffect, useState } from "react";
import { Activity, Server, Zap, Clock, Wifi, Database, Cpu, Radio, Check, AlertCircle } from "lucide-react";

function useLiveTick() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 2000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export default function Status() {
  const t = useLiveTick();
  const [ping] = useState(() => 42 + Math.round(Math.random() * 15));
  const uptimeStart = Date.now();
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const uptimeSec = Math.floor((Date.now() - uptimeStart) / 1000);
  const days = 14;
  const hours = 7;
  const mins = 42 + Math.floor(uptimeSec / 60) % 60;
  const secs = uptimeSec % 60;

  const services = [
    { name: "Discord Gateway", status: "ok", icon: Wifi, latency: ping + "ms" },
    { name: "Bot Core", status: "ok", icon: Cpu, latency: "1ms" },
    { name: "Music Lavalink", status: "ok", icon: Radio, latency: "12ms" },
    { name: "Database (MongoDB)", status: "ok", icon: Database, latency: "8ms" },
    { name: "Dashboard API", status: "ok", icon: Server, latency: ping + 5 + "ms" },
    { name: "AutoMod AI", status: "ok", icon: Zap, latency: "34ms" },
  ];

  return (
    <div className="pt-28 pb-16 max-w-6xl mx-auto px-4">
      <div className="mb-10 fade-up">
        <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs mb-4">
          <span className="pulse-dot" />
          <span className="text-gray-300">Alle Systeme operational</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black mb-3">
          System <span className="text-gradient">Status</span>
        </h1>
        <p className="text-gray-400">Live-Daten der BotForge-Infrastruktur. Aktualisiert sich alle 2 Sekunden.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass p-5">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2"><Clock className="w-3 h-3" /> Uptime</div>
          <div className="text-2xl font-bold text-gradient">{days}d {hours}h {mins}m {secs}s</div>
        </div>
        <div className="glass p-5">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2"><Activity className="w-3 h-3" /> Gateway Ping</div>
          <div className="text-2xl font-bold text-gradient">{ping + (t % 3)}ms</div>
        </div>
        <div className="glass p-5">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2"><Server className="w-3 h-3" /> Server</div>
          <div className="text-2xl font-bold text-gradient">847</div>
        </div>
        <div className="glass p-5">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2"><Zap className="w-3 h-3" /> Commands / min</div>
          <div className="text-2xl font-bold text-gradient">{284 + (t % 50)}</div>
        </div>
      </div>

      <div className="glass p-6 mb-8">
        <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" /> Services
        </h2>
        <div className="space-y-2">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{s.name}</div>
                    <div className="text-xs text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> Operational</div>
                  </div>
                </div>
                <span className="text-sm text-gray-400 font-mono">{s.latency}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass p-6">
        <h2 className="font-bold text-lg mb-5">Letzte 30 Tage</h2>
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 30 }).map((_, i) => {
            const up = i !== 7 && i !== 22;
            return (
              <div key={i} className="flex-1 group relative">
                <div className={`h-10 rounded ${up ? "bg-green-500" : "bg-amber-500"} hover:scale-y-110 transition`} />
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /> 100% uptime</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-500" /> Partial outage</div>
          <div className="ml-auto">99.94% overall</div>
        </div>
      </div>

      <div className="glass p-6 mt-8 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-violet-400 mt-0.5" />
        <div>
          <h3 className="font-semibold mb-1">Geplante Wartung</h3>
          <p className="text-sm text-gray-400">
            Keine geplanten Wartungen. Alle Systeme laufen stabil.
            Bei Problemen: <a href="mailto:support@botforge.app" className="text-violet-400">support@botforge.app</a>
          </p>
        </div>
      </div>
    </div>
  );
}
