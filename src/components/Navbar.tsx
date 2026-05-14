import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Bot, Menu, X, Gauge, Activity, Terminal, Home, FileText, Shield } from "lucide-react";

export default function Navbar({ scrolled }: { scrolled: boolean }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const nav = [
    { to: "/", label: "Home", icon: Home },
    { to: "/commands", label: "Commands", icon: Terminal },
    { to: "/status", label: "Status", icon: Activity },
    { to: "/dashboard", label: "Dashboard", icon: Gauge },
    { to: "/terms", label: "Terms", icon: FileText },
    { to: "/privacy", label: "Privacy", icon: Shield },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`glass-strong flex items-center justify-between px-4 sm:px-6 py-3 transition-all ${scrolled ? "shadow-2xl" : ""}`}>
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center glow-violet">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0a0a14] pulse-dot" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-gradient">BotForge</span>
              <span className="text-[10px] text-gray-400 -mt-0.5">v2.0 · public</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    active
                      ? "text-white bg-white/5 border border-violet-500/30"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm hidden sm:inline-flex"
            >
              Add to Discord
            </a>
            <button
              className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden mt-2 glass-strong p-3 flex flex-col gap-1 fade-up">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 hover:bg-white/5"
                >
                  <Icon className="w-4 h-4 text-violet-400" />
                  {item.label}
                </Link>
              );
            })}
            <a
              href="https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm text-center mt-2"
            >
              Add to Discord
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
