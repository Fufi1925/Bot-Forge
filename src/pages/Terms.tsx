export default function Terms() {
  return (
    <div className="pt-28 pb-16 max-w-4xl mx-auto px-4">
      <h1 className="text-4xl sm:text-5xl font-black mb-3 fade-up">
        Terms of <span className="text-gradient">Service</span>
      </h1>
      <p className="text-gray-400 mb-10 text-sm">Zuletzt aktualisiert: {new Date().toLocaleDateString("de-DE")}</p>

      <div className="glass p-8 space-y-6 text-gray-300 leading-relaxed text-sm">
        <section>
          <h2 className="text-xl font-bold text-white mb-3">1. Geltungsbereich</h2>
          <p>Diese Nutzungsbedingungen gelten für die Nutzung des Discord-Bots "BotForge" sowie des dazugehörigen Web-Dashboards. Durch das Hinzufügen des Bots zu einem Discord-Server oder das Nutzen des Dashboards akzeptierst du diese Bedingungen.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">2. Nutzung</h2>
          <p>BotForge darf nur im Einklang mit den Discord Terms of Service und Community Guidelines genutzt werden. Missbrauch, Spam oder Angriffe auf die Infrastruktur führen zum Ausschluss.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">3. Daten</h2>
          <p>Wir speichern ausschließlich Daten, die für den Betrieb notwendig sind (Server-IDs, Konfigurationen, Log-Einträge). Details in der <a href="/privacy" className="text-violet-400">Privacy Policy</a>.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">4. Verfügbarkeit</h2>
          <p>Wir bemühen uns um 99,9% Uptime, garantieren jedoch keine unterbrechungsfreie Verfügbarkeit. Wartungen werden angekündigt.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">5. Haftung</h2>
          <p>BotForge wird "as-is" bereitgestellt. Wir haften nicht für Schäden, die durch Nutzung entstehen, soweit gesetzlich zulässig.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">6. Änderungen</h2>
          <p>Wir behalten uns vor, diese Bedingungen zu ändern. Wesentliche Änderungen werden kommuniziert.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">7. Kontakt</h2>
          <p>Bei Fragen: <a href="mailto:support@botforge.app" className="text-violet-400">support@botforge.app</a> oder über unseren Discord Support Server.</p>
        </section>
      </div>
    </div>
  );
}
