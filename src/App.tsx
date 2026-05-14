import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AnimatedBackground from "./components/AnimatedBackground";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Status from "./pages/Status";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Commands from "./pages/Commands";

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <Navbar scrolled={scrolled} />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:guildId" element={<Dashboard />} />
            <Route path="/status" element={<Status />} />
            <Route path="/commands" element={<Commands />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
