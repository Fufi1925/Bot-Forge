import { Link } from "react-router-dom";
import { Bot, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/5 bg-black/30 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">BotForge</span>
          </div>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">
            Der futuristische Discord-Bot mit modernem Dashboard, AutoMod, Tickets, Music,
            Logging und vielem mehr. Gebaut für Hunderte von Servern.
          </p>
          <div className="flex gap-3 mt-6">
            <a href="#" aria-label="GitHub" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.93c.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.77.12 3.06.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.41-5.27 5.69.42.37.8 1.1.8 2.22v3.29c0 .31.2.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
            </a>
            <a href="#" aria-label="X" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2H21l-6.52 7.45L22 22h-6.828l-4.77-6.22L4.8 22H2l7-8L2 2h6.914l4.31 5.72L18.244 2zm-1.2 18h1.64L7.04 4H5.3l11.744 16z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-white">Produkt</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/commands" className="hover:text-white">Commands</Link></li>
            <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
            <li><Link to="/status" className="hover:text-white">Status</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-white">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><a href="mailto:support@botforge.app" className="hover:text-white">Support</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-6 text-center text-xs text-gray-500">
        <div className="flex items-center justify-center gap-1">
          Made with <Heart className="w-3 h-3 text-pink-500" /> by BotForge · © {new Date().getFullYear()} All rights reserved.
        </div>
        <div className="mt-1">Not affiliated with Discord Inc.</div>
      </div>
    </footer>
  );
}
