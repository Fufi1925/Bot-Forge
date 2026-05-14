import { useState, createContext, useContext, type ReactNode } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Logs from './pages/Logs';
import Status from './pages/Status';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Inline Dashboard to fix build
function DashboardPlaceholder() {
  const { isLogged, login, selServer, setSel, servers, logout, user } = useAuth();
  const nav = useNavigate();
  if (!isLogged) return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4">
      <div className="glass-s rounded-xl p-6 text-center max-w-xs w-full anim-scale-in">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center text-xl mx-auto mb-3">⚡</div>
        <h2 className="text-base font-bold text-white mb-1">Anmeldung nötig</h2>
        <p className="text-[10px] text-gray-400 mb-3">Melde dich mit Discord an.</p>
        <button onClick={login} className="w-full py-2 rounded-lg bg-[#5865F2] text-white font-semibold text-xs">Mit Discord anmelden</button>
        <Link to="/" className="text-[10px] text-gray-500 mt-2 block">Zurück</Link>
      </div>
    </div>
  );
  if (!selServer) return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full anim-fade-in text-center">
        <h2 className="text-lg font-bold text-white mb-4">Wähle einen Server</h2>
        <div className="space-y-2">{servers.map(s => (
          <button key={s.id} onClick={() => setSel(s)} className="w-full card neon-b !p-3 text-left flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">{s.name.charAt(0)}</div>
            <div><div className="text-xs font-semibold text-white">{s.name}</div><div className="text-[9px] text-gray-500">{s.memberCount.toLocaleString()} Mitglieder</div></div>
          </button>
        ))}</div>
        <button onClick={() => { logout(); nav('/'); }} className="mt-4 text-[10px] text-gray-500 hover:text-white">Abmelden</button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen grid-bg p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold grad-text">⚡ {selServer.name} Dashboard</h1>
          <button onClick={() => setSel(null)} className="text-[10px] text-gray-400 hover:text-white">Server wechseln</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
          {[{l:'Mitglieder',v:selServer.memberCount.toLocaleString()},{l:'Nachrichten',v:Math.floor(selServer.memberCount*5.8).toLocaleString()},{l:'Befehle',v:Math.floor(selServer.memberCount*0.2).toLocaleString()},{l:'Tickets',v:Math.floor(selServer.memberCount*0.003).toString()},{l:'Mod-Aktionen',v:Math.floor(selServer.memberCount*0.01).toString()},{l:'Musik',v:Math.floor(selServer.memberCount*0.08).toLocaleString()}].map((x,i)=>(
            <div key={i} className="card !p-3"><div className="text-base font-bold text-white">{x.v}</div><div className="text-[9px] text-gray-500">{x.l}</div></div>
          ))}
        </div>
        <div className="glass-s rounded-xl p-4 neon-b">
          <p className="text-xs text-gray-400">Dashboard wird geladen... Konfiguriere alle Module über das Panel.</p>
        </div>
        <Link to="/" className="mt-4 block text-center text-[10px] text-gray-500 hover:text-white">← Zurück zur Startseite</Link>
      </div>
    </div>
  );
}

interface User { id: string; username: string; avatar?: string | null; discriminator: string; }
interface Server { id: string; name: string; icon?: string | null; memberCount: number; }
interface CtxType {
  user: User | null;
  isLogged: boolean;
  login: () => void;
  logout: () => void;
  servers: Server[];
  selServer: Server | null;
  setSel: (s: Server | null) => void;
  mobMenu: boolean;
  setMob: (v: boolean) => void;
}

const Ctx = createContext<CtxType>({
  user: null, isLogged: false, login: () => {}, logout: () => {},
  servers: [], selServer: null, setSel: () => {},
  mobMenu: false, setMob: () => {},
});
export const useAuth = () => useContext(Ctx);

const SERVERS: Server[] = [
  { id: '1', name: 'Gaming Paradise', icon: null, memberCount: 15420 },
  { id: '2', name: 'Developer Hub', icon: null, memberCount: 8932 },
  { id: '3', name: 'Music Lovers', icon: null, memberCount: 5211 },
  { id: '4', name: 'Community Central', icon: null, memberCount: 32100 },
  { id: '5', name: 'Art & Design', icon: null, memberCount: 7800 },
];

function Provider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sel, setSel] = useState<Server | null>(null);
  const [mob, setMob] = useState(false);
  const login = () => setUser({ id: '123', username: 'BotForgeUser', avatar: null, discriminator: '1337' });
  const logout = () => { setUser(null); setSel(null); };
  return (
    <Ctx.Provider value={{ user, isLogged: !!user, login, logout, servers: SERVERS, selServer: sel, setSel: setSel, mobMenu: mob, setMob: setMob }}>
      {children}
    </Ctx.Provider>
  );
}

export default function App() {
  return (
    <Provider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/status" element={<Status />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/logs" element={<Logs />} />
        </Routes>
      </HashRouter>
    </Provider>
  );
}
