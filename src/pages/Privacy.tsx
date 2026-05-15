export default function Privacy() {
  return (
    <div className="pt-28 pb-16 max-w-4xl mx-auto px-4">
      <h1 className="text-4xl sm:text-5xl font-black mb-3 fade-up">
        Privacy <span className="text-gradient">Policy</span>
      </h1>
      <p className="text-gray-400 mb-10 text-sm">Zuletzt aktualisiert: {new Date().toLocaleDateString("de-DE")}</p>

      <div className="glass p-8 space-y-6 text-gray-300 leading-relaxed text-sm">
        <section>
          <h2 className="text-xl font-bold text-white mb-3">1. Verantwortlicher</h2>
          <p>BotForge · Kontakt: <a href="mailto:privacy@botforge.app" className="text-violet-400">privacy@botforge.app</a></p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">2. Welche Daten wir speichern</h2>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Server-IDs und Konfigurationen</li>
            <li>User-IDs für Warns, Level, XP</li>
            <li>Log-Events (temporär, max. 30 Tage)</li>
            <li>Ticket-Transcripts (auf Wunsch)</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">3. Was wir NICHT speichern</h2>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Inhalte von Nachrichten (außer bei AutoMod-Verstößen, kurzzeitig)</li>
            <li>Voice-Daten</li>
            <li>Passwörter, Tokens oder Payment-Daten</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">4. Zweck der Verarbeitung</h2>
          <p>Ausschließlich zur Bereitstellung der Bot-Funktionen (Logging, Leveling, Tickets, Moderation).</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">5. Deine Rechte (DSGVO)</h2>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Recht auf Auskunft (Art. 15)</li>
            <li>Recht auf Löschung (Art. 17)</li>
            <li>Recht auf Datenübertragbarkeit (Art. 20)</li>
            <li>Widerspruchsrecht (Art. 21)</li>
          </ul>
          <p className="mt-2">Zum Löschen aller deiner Daten nutze den Befehl <code className="text-violet-300">/deletedata</code> oder kontaktiere uns.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">6. Drittanbieter</h2>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Railway (Hosting, EU/US)</li>
            <li>MongoDB Atlas (Datenbank)</li>
            <li>Discord (API)</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-white mb-3">7. Speicherdauer</h2>
          <p>Konfigurationsdaten: solange der Bot auf dem Server ist. Log-Daten: 30 Tage. User-Daten auf Anfrage löschbar.</p>
        </section>
      </div>
    </div>
  );
}
