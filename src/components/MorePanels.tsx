import { useState } from 'react';
import {
  Brain, Smile, MessageCircle, BarChart2, Clock,
  TrendingUp, Filter, Gamepad2, Cake,
  Hash, Layout, Star, Crown, Target, Repeat,
  Save, Plus, Trash2, Zap, Users, Gift, Tv
} from 'lucide-react';

// Shared components (inline to avoid circular deps)
function Toggle({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`w-12 h-6 rounded-full transition-all ${active ? 'bg-gradient-to-r from-[#a855f7] to-[#ec4899]' : 'bg-white/10'}`}>
      <div className={`w-5 h-5 bg-white rounded-full transition-all mt-0.5 ${active ? 'ml-6' : 'ml-0.5'}`} />
    </button>
  );
}
function Input({ label, placeholder, value, onChange, type = 'text' }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return <div><label className="block text-sm font-medium text-gray-400 mb-2">{label}</label><input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all placeholder:text-white/20" /></div>;
}
function Select({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return <div><label className="block text-sm font-medium text-gray-400 mb-2">{label}</label><select value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-purple-500/50 transition-all">{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
}
function Textarea({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return <div><label className="block text-sm font-medium text-gray-400 mb-2">{label}</label><textarea placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} rows={4} className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-purple-500/50 transition-all resize-none placeholder:text-white/20" /></div>;
}
function SectionHeader({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return <div className="mb-8"><div className="flex items-center gap-3 mb-2">{icon}<h2 className="text-2xl font-bold text-white">{title}</h2></div><p className="text-gray-500">{desc}</p></div>;
}
function ConfigCard({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl"><div className="flex items-center gap-2 mb-4">{icon}<h3 className="text-lg font-semibold text-white">{title}</h3></div><div className="space-y-4">{children}</div></div>;
}
function SaveButton() {
  return <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2"><Save className="w-4 h-4" />Änderungen speichern</button>;
}

// ==========================================
// AI ASSISTANT
// ==========================================
export function AIAssistantPanel() {
  const [enabled, setEnabled] = useState(true);
  const [channel, setChannel] = useState('ai-chat');
  const [model, setModel] = useState('gpt-4');
  const [personality, setPersonality] = useState('Du bist ein hilfreicher Assistent für den Discord Server.');
  const [maxTokens, setMaxTokens] = useState('500');
  const [temperature, setTemperature] = useState('0.7');
  const [allowDM, setAllowDM] = useState(true);
  const [modFilter, setModFilter] = useState(true);

  return (
    <div className="space-y-6">
      <SectionHeader title="KI-Assistent" desc="Integrierter KI-Chatbot für deinen Server" icon={<Brain className="w-6 h-6 text-cyan-400" />} />
      <ConfigCard title="Allgemein">
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">KI-Assistent aktivieren</span><Toggle active={enabled} onChange={() => setEnabled(!enabled)} /></div>
        {enabled && (<>
          <Select label="KI Kanal" value={channel} onChange={setChannel} options={[{ value: 'ai-chat', label: '#ai-chat' },{ value: 'general', label: '#general' },{ value: 'bot-cmds', label: '#bot-cmds' }]} />
          <Select label="KI Modell" value={model} onChange={setModel} options={[{ value: 'gpt-4', label: '🧠 GPT-4 (Beste Qualität)' },{ value: 'gpt-3.5', label: '⚡ GPT-3.5 (Schneller)' },{ value: 'claude-3', label: '🤖 Claude 3 (Kreativ)' }]} />
          <Textarea label="Persönlichkeit (System Prompt)" placeholder="Du bist ein hilfreicher Assistent..." value={personality} onChange={setPersonality} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Max Tokens" placeholder="500" value={maxTokens} onChange={setMaxTokens} type="number" />
            <Input label="Temperatur (0-2)" placeholder="0.7" value={temperature} onChange={setTemperature} />
          </div>
          <div className="flex items-center justify-between"><span className="text-sm text-gray-400">DM-Konversationen erlauben</span><Toggle active={allowDM} onChange={() => setAllowDM(!allowDM)} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Moderations-Filter</span><Toggle active={modFilter} onChange={() => setModFilter(!modFilter)} /></div>
        </>)}
      </ConfigCard>
      <ConfigCard title="Vorschau">
        <div className="bg-[#2b2d31] rounded-xl p-4 space-y-3">
          <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm">👤</div><div className="rounded-xl bg-white/5 px-4 py-2 max-w-[80%]"><p className="text-sm text-gray-300">@BotForge Wie erstelle ich einen Ticket?</p></div></div>
          <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a855f7] to-[#ec4899] flex items-center justify-center text-sm">⚡</div><div className="rounded-xl bg-white/5 px-4 py-2 max-w-[80%]"><p className="text-sm text-gray-300">Um einen Ticket zu erstellen, klicke einfach auf den Ticket-Button in #tickets oder nutze den Befehl <code className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-400">/ticket create</code>! 🎫</p></div></div>
        </div>
      </ConfigCard>
      <SaveButton />
    </div>
  );
}

// ==========================================
// REACTION ROLES
// ==========================================
export function ReactionRolesPanel() {
  const [roles, setRoles] = useState([
    { emoji: '🔴', role: 'Red Team', channel: 'roles', message: 'Wähle dein Team!' },
    { emoji: '🔵', role: 'Blue Team', channel: 'roles', message: 'Wähle dein Team!' },
    { emoji: '🟢', role: 'Green Team', channel: 'roles', message: 'Wähle dein Team!' },
    { emoji: '🎮', role: 'Gamer', channel: 'roles', message: 'Wähle deine Interessen!' },
  ]);
  const [mode, setMode] = useState('toggle');
  const [newEmoji, setNewEmoji] = useState('');
  const [newRole, setNewRole] = useState('');

  return (
    <div className="space-y-6">
      <SectionHeader title="Reaction Roles" desc="Rollen per Reaktion vergeben" icon={<Smile className="w-6 h-6 text-yellow-400" />} />
      <ConfigCard title="Einstellungen">
        <Select label="Modus" value={mode} onChange={setMode} options={[
          { value: 'toggle', label: '🔄 Toggle (An/Aus)' },
          { value: 'single', label: '1️⃣ Nur eine Rolle' },
          { value: 'multi', label: '📋 Mehrere Rollen' },
          { value: 'unique', label: '🎯 Einzigartig (nur eine aus Gruppe)' },
        ]} />
      </ConfigCard>
      <ConfigCard title="Reaktion-Rollen">
        {roles.map((r, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{r.emoji}</span>
              <div><span className="text-sm font-medium text-white">{r.role}</span><p className="text-xs text-gray-500">#{r.channel}</p></div>
            </div>
            <button onClick={() => setRoles(roles.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-white/5 text-red-400"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <div className="flex gap-3">
          <input placeholder="😀 Emoji" value={newEmoji} onChange={e => setNewEmoji(e.target.value)} className="w-20 rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-gray-200 outline-none text-center" />
          <input placeholder="Rolle..." value={newRole} onChange={e => setNewRole(e.target.value)} className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-gray-200 outline-none" />
          <button onClick={() => { if (newEmoji && newRole) { setRoles([...roles, { emoji: newEmoji, role: newRole, channel: 'roles', message: '' }]); setNewEmoji(''); setNewRole(''); } }} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white text-sm font-medium flex items-center gap-1"><Plus className="w-4 h-4" />Add</button>
        </div>
      </ConfigCard>
      <SaveButton />
    </div>
  );
}

// ==========================================
// SUGGESTIONS
// ==========================================
export function SuggestionsPanel() {
  const [enabled, setEnabled] = useState(true);
  const [channel, setChannel] = useState('suggestions');
  const [autoThread, setAutoThread] = useState(true);
  const [upvoteEmoji, setUpvoteEmoji] = useState('⬆️');
  const [downvoteEmoji, setDownvoteEmoji] = useState('⬇️');
  const [minUpvotes, setMinUpvotes] = useState('10');
  const [approvedChannel, setApprovedChannel] = useState('approved');

  return (
    <div className="space-y-6">
      <SectionHeader title="Vorschläge" desc="Community-Vorschlagssystem" icon={<MessageCircle className="w-6 h-6 text-green-400" />} />
      <ConfigCard title="Allgemein">
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Vorschlagssystem aktivieren</span><Toggle active={enabled} onChange={() => setEnabled(!enabled)} /></div>
        {enabled && (<>
          <Select label="Vorschlags-Kanal" value={channel} onChange={setChannel} options={[{ value: 'suggestions', label: '#suggestions' },{ value: 'community', label: '#community' }]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Upvote Emoji" placeholder="⬆️" value={upvoteEmoji} onChange={setUpvoteEmoji} />
            <Input label="Downvote Emoji" placeholder="⬇️" value={downvoteEmoji} onChange={setDownvoteEmoji} />
          </div>
          <Input label="Min. Upvotes für Approval" placeholder="10" value={minUpvotes} onChange={setMinUpvotes} type="number" />
          <Select label="Approved-Kanal" value={approvedChannel} onChange={setApprovedChannel} options={[{ value: 'approved', label: '#approved' },{ value: 'announcements', label: '#announcements' }]} />
          <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Auto-Thread erstellen</span><Toggle active={autoThread} onChange={() => setAutoThread(!autoThread)} /></div>
        </>)}
      </ConfigCard>
      <SaveButton />
    </div>
  );
}

// ==========================================
// POLLS
// ==========================================
export function PollsPanel() {
  const [pollChannel, setPollChannel] = useState('polls');
  const [managerRole, setManagerRole] = useState('admin');
  const [defaultDuration, setDefaultDuration] = useState('24');
  const [multiVote, setMultiVote] = useState(false);
  const [allowRevote, setAllowRevote] = useState(true);

  return (
    <div className="space-y-6">
      <SectionHeader title="Umfragen" desc="Erstelle und verwalte Umfragen" icon={<BarChart2 className="w-6 h-6 text-orange-400" />} />
      <ConfigCard title="Einstellungen">
        <Select label="Umfragen-Kanal" value={pollChannel} onChange={setPollChannel} options={[{ value: 'polls', label: '#polls' },{ value: 'general', label: '#general' }]} />
        <Select label="Manager Rolle" value={managerRole} onChange={setManagerRole} options={[{ value: 'admin', label: '👑 Admin' },{ value: 'moderator', label: '🛡️ Moderator' }]} />
        <Input label="Standard-Dauer (Stunden)" placeholder="24" value={defaultDuration} onChange={setDefaultDuration} type="number" />
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Mehrfachauswahl erlauben</span><Toggle active={multiVote} onChange={() => setMultiVote(!multiVote)} /></div>
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Neu abstimmen erlauben</span><Toggle active={allowRevote} onChange={() => setAllowRevote(!allowRevote)} /></div>
      </ConfigCard>
      <ConfigCard title="Schnellbefehle">
        <div className="space-y-2">
          {['/poll create <frage> <option1> <option2> ...', '/poll quick <frage>', '/poll end <id>', '/poll results <id>'].map((cmd, i) => (
            <div key={i} className="p-2 rounded-lg bg-white/[0.02]"><code className="text-sm text-cyan-400 font-mono">{cmd}</code></div>
          ))}
        </div>
      </ConfigCard>
      <SaveButton />
    </div>
  );
}

// ==========================================
// REMINDERS
// ==========================================
export function RemindersPanel() {
  const [reminders] = useState([
    { text: 'Server Meeting', time: 'Jeden Freitag 18:00', channel: 'announcements', active: true },
    { text: 'Giveaway Ende', time: 'In 2 Stunden', channel: 'giveaways', active: true },
    { text: 'Backup Reminder', time: 'Täglich 03:00', channel: 'admin-only', active: true },
  ]);
  const [maxReminders, setMaxReminders] = useState('10');
  const [allowEveryone, setAllowEveryone] = useState(true);

  return (
    <div className="space-y-6">
      <SectionHeader title="Erinnerungen" desc="Automatische Nachrichten zu festgelegten Zeiten" icon={<Clock className="w-6 h-6 text-blue-400" />} />
      <ConfigCard title="Einstellungen">
        <Input label="Max Erinnerungen pro User" placeholder="10" value={maxReminders} onChange={setMaxReminders} type="number" />
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Für alle Nutzer verfügbar</span><Toggle active={allowEveryone} onChange={() => setAllowEveryone(!allowEveryone)} /></div>
      </ConfigCard>
      <ConfigCard title="Aktive Erinnerungen">
        {reminders.map((r, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
            <div><span className="text-sm font-medium text-white">{r.text}</span><p className="text-xs text-gray-500">🕐 {r.time} • #{r.channel}</p></div>
            <Toggle active={r.active} onChange={() => {}} />
          </div>
        ))}
      </ConfigCard>
      <SaveButton />
    </div>
  );
}

// ==========================================
// LEVELING
// ==========================================
export function LevelingPanel() {
  const [enabled, setEnabled] = useState(true);
  const [xpPerMsg, setXpPerMsg] = useState('15-25');
  const [xpCooldown, setXpCooldown] = useState('60');
  const [lvlUpChannel, setLvlUpChannel] = useState('general');
  const [lvlUpMsg, setLvlUpMsg] = useState('🎉 {user} hat Level {level} erreicht!');
  const [lvlRoles, setLvlRoles] = useState([
    { level: 5, role: 'Bronze 🥉' },
    { level: 10, role: 'Silver 🥈' },
    { level: 20, role: 'Gold 🥇' },
    { level: 50, role: 'Diamond 💎' },
  ]);
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <SectionHeader title="Leveling System" desc="XP und Ränge für aktive Mitglieder" icon={<TrendingUp className="w-6 h-6 text-emerald-400" />} />
      <ConfigCard title="Allgemein">
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Leveling aktivieren</span><Toggle active={enabled} onChange={() => setEnabled(!enabled)} /></div>
        {enabled && (<>
          <div className="grid grid-cols-2 gap-4">
            <Input label="XP pro Nachricht" placeholder="15-25" value={xpPerMsg} onChange={setXpPerMsg} />
            <Input label="Cooldown (Sek.)" placeholder="60" value={xpCooldown} onChange={setXpCooldown} type="number" />
          </div>
          <Select label="Level-Up Kanal" value={lvlUpChannel} onChange={setLvlUpChannel} options={[{ value: 'general', label: '#general' },{ value: 'level-up', label: '#level-up' },{ value: 'same', label: '📍 Gleicher Kanal' }]} />
          <Input label="Level-Up Nachricht" placeholder="🎉 {user} hat Level {level} erreicht!" value={lvlUpMsg} onChange={setLvlUpMsg} />
          <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Leaderboard</span><Toggle active={leaderboardEnabled} onChange={() => setLeaderboardEnabled(!leaderboardEnabled)} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Rank Cards generieren</span><Toggle active={cardEnabled} onChange={() => setCardEnabled(!cardEnabled)} /></div>
        </>)}
      </ConfigCard>
      <ConfigCard title="Level-Rollen">
        {lvlRoles.map((r, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
            <div className="flex items-center gap-3"><Star className="w-4 h-4 text-yellow-400" /><span className="text-sm text-white">Level {r.level} → {r.role}</span></div>
            <button onClick={() => setLvlRoles(lvlRoles.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <button onClick={() => setLvlRoles([...lvlRoles, { level: lvlRoles.length * 10 + 10, role: 'Neue Rolle' }])} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><Plus className="w-3 h-3" />Rolle hinzufügen</button>
      </ConfigCard>
      <ConfigCard title="Variablen">
        <div className="flex flex-wrap gap-2">
          {['{user}', '{level}', '{xp}', '{totalXp}', '{rank}', '{server}'].map(v => (
            <span key={v} className="px-2 py-1 rounded-lg bg-white/5 text-xs text-cyan-400 font-mono">{v}</span>
          ))}
        </div>
      </ConfigCard>
      <SaveButton />
    </div>
  );
}

// ==========================================
// WORD FILTER
// ==========================================
export function WordFilterPanel() {
  const [words, setWords] = useState(['spam', 'hack', 'free nitro', 'discord.gg/']);
  const [newWord, setNewWord] = useState('');
  const [action, setAction] = useState('delete');
  const [logEnabled, setLogEnabled] = useState(true);
  const [warnMsg, setWarnMsg] = useState('⚠️ Deine Nachricht wurde wegen unangemessenem Inhalt entfernt.');
  const [regex, setRegex] = useState(false);

  return (
    <div className="space-y-6">
      <SectionHeader title="Wort-Filter" desc="Benutzerdefinierte Wort- und Phrasen-Filter" icon={<Filter className="w-6 h-6 text-red-400" />} />
      <ConfigCard title="Gefilterte Wörter">
        <div className="flex flex-wrap gap-2">
          {words.map((w, i) => (
            <span key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {w}
              <button onClick={() => setWords(words.filter((_, j) => j !== i))} className="text-red-400/50 hover:text-red-400 ml-1">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-3">
          <input placeholder="Wort/Phrase hinzufügen..." value={newWord} onChange={e => setNewWord(e.target.value)} className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-gray-200 outline-none" onKeyDown={e => { if (e.key === 'Enter' && newWord) { setWords([...words, newWord]); setNewWord(''); } }} />
          <button onClick={() => { if (newWord) { setWords([...words, newWord]); setNewWord(''); } }} className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30">Hinzufügen</button>
        </div>
      </ConfigCard>
      <ConfigCard title="Aktion">
        <Select label="Bei Filter-Treffer" value={action} onChange={setAction} options={[
          { value: 'delete', label: '🗑️ Nachricht löschen' },
          { value: 'warn', label: '⚠️ Warnen' },
          { value: 'mute', label: '🔇 Stummschalten' },
          { value: 'delete+warn', label: '🗑️⚠️ Löschen + Warnen' },
        ]} />
        <Textarea label="Warn-Nachricht" placeholder="⚠️ Deine Nachricht wurde entfernt." value={warnMsg} onChange={setWarnMsg} />
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Logging aktivieren</span><Toggle active={logEnabled} onChange={() => setLogEnabled(!logEnabled)} /></div>
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Regex-Support</span><Toggle active={regex} onChange={() => setRegex(!regex)} /></div>
      </ConfigCard>
      <SaveButton />
    </div>
  );
}

// ==========================================
// YOUTUBE / TWITCH NOTIFICATIONS
// ==========================================
export function NotificationsPanel() {
  const [ytEnabled, setYtEnabled] = useState(true);
  const [ytChannel, setYtChannel] = useState('youtube');
  const [ytFeed, setYtFeed] = useState('UCxxxxx');
  const [twEnabled, setTwEnabled] = useState(true);
  const [twChannel, setTwChannel] = useState('twitch');
  const [twStreamer, setTwStreamer] = useState('');
  const [streamers] = useState([
    { name: 'BotForge_Dev', game: 'Software & Dev', live: false },
    { name: 'GamingLegends', game: 'Just Chatting', live: true },
  ]);
  const [tweetEnabled, setTweetEnabled] = useState(false);
  const [tweetChannel, setTweetChannel] = useState('twitter');

  return (
    <div className="space-y-6">
      <SectionHeader title="Social Notifications" desc="YouTube, Twitch & Twitter Benachrichtigungen" icon={<Tv className="w-6 h-6 text-red-500" />} />

      <ConfigCard title="YouTube" icon={<span className="text-lg">🎬</span>}>
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">YouTube Benachrichtigungen</span><Toggle active={ytEnabled} onChange={() => setYtEnabled(!ytEnabled)} /></div>
        {ytEnabled && (<>
          <Select label="Benachrichtigungs-Kanal" value={ytChannel} onChange={setYtChannel} options={[{ value: 'youtube', label: '#youtube' },{ value: 'content', label: '#content' }]} />
          <Input label="YouTube Kanal ID" placeholder="UCxxxxx" value={ytFeed} onChange={setYtFeed} />
        </>)}
      </ConfigCard>

      <ConfigCard title="Twitch" icon={<span className="text-lg">🎮</span>}>
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Twitch Benachrichtigungen</span><Toggle active={twEnabled} onChange={() => setTwEnabled(!twEnabled)} /></div>
        {twEnabled && (<>
          <Select label="Benachrichtigungs-Kanal" value={twChannel} onChange={setTwChannel} options={[{ value: 'twitch', label: '#twitch' },{ value: 'streams', label: '#streams' }]} />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">Überwachte Streamer</label>
            {streamers.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${s.live ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} /><span className="text-sm text-white">{s.name}</span></div>
                <span className="text-xs text-gray-500">{s.game}</span>
              </div>
            ))}
            <div className="flex gap-2"><input placeholder="Streamer Name..." value={twStreamer} onChange={e => setTwStreamer(e.target.value)} className="flex-1 rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-sm text-gray-200 outline-none" /><button className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm">Add</button></div>
          </div>
        </>)}
      </ConfigCard>

      <ConfigCard title="Twitter / X" icon={<span className="text-lg">🐦</span>}>
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Twitter Benachrichtigungen</span><Toggle active={tweetEnabled} onChange={() => setTweetEnabled(!tweetEnabled)} /></div>
        {tweetEnabled && <Select label="Kanal" value={tweetChannel} onChange={setTweetChannel} options={[{ value: 'twitter', label: '#twitter' },{ value: 'socials', label: '#socials' }]} />}
      </ConfigCard>
      <SaveButton />
    </div>
  );
}

// ==========================================
// BIRTHDAY SYSTEM
// ==========================================
export function BirthdayPanel() {
  const [enabled, setEnabled] = useState(true);
  const [channel, setChannel] = useState('general');
  const [announcement, setAnnouncement] = useState('🎂 Alles Gute zum Geburtstag, {user}! 🥳🎉');
  const [timezone, setTimezone] = useState('Europe/Berlin');
  const [birthdayRole, setBirthdayRole] = useState('🎂 Birthday');
  const [createEvent, setCreateEvent] = useState(true);

  return (
    <div className="space-y-6">
      <SectionHeader title="Geburtstage" desc="Automatische Geburtstagsgrüße" icon={<Cake className="w-6 h-6 text-pink-400" />} />
      <ConfigCard title="Einstellungen">
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Geburtstagssystem aktivieren</span><Toggle active={enabled} onChange={() => setEnabled(!enabled)} /></div>
        {enabled && (<>
          <Select label="Ankündigungs-Kanal" value={channel} onChange={setChannel} options={[{ value: 'general', label: '#general' },{ value: 'birthday', label: '#birthday' }]} />
          <Input label="Nachricht" placeholder="🎂 Happy Birthday {user}!" value={announcement} onChange={setAnnouncement} />
          <Select label="Zeitzone" value={timezone} onChange={setTimezone} options={[{ value: 'Europe/Berlin', label: '🇩🇪 Europe/Berlin' },{ value: 'US/Eastern', label: '🇺🇸 US/Eastern' },{ value: 'Asia/Tokyo', label: '🇯🇵 Asia/Tokyo' }]} />
          <Select label="Geburtstags-Rolle" value={birthdayRole} onChange={setBirthdayRole} options={[{ value: '🎂 Birthday', label: '🎂 Birthday' },{ value: '🎉 Special Day', label: '🎉 Special Day' }]} />
          <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Event erstellen</span><Toggle active={createEvent} onChange={() => setCreateEvent(!createEvent)} /></div>
        </>)}
      </ConfigCard>
      <SaveButton />
    </div>
  );
}

// ==========================================
// TEMPORARY CHANNELS
// ==========================================
export function TempChannelsPanel() {
  const [enabled, setEnabled] = useState(true);
  const [category, setCategory] = useState('temp-channels');
  const [maxChannels, setMaxChannels] = useState('10');
  const [autoDelete, setAutoDelete] = useState('300');
  const [naming, setNaming] = useState('{user}\'s Kanal');
  const [bitrate, setBitrate] = useState('64');
  const [userLimit, setUserLimit] = useState('0');

  return (
    <div className="space-y-6">
      <SectionHeader title="Temporäre Kanäle" desc="Automatische Voice- und Textkanäle" icon={<Hash className="w-6 h-6 text-indigo-400" />} />
      <ConfigCard title="Einstellungen">
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Temp. Kanäle aktivieren</span><Toggle active={enabled} onChange={() => setEnabled(!enabled)} /></div>
        {enabled && (<>
          <Select label="Kategorie" value={category} onChange={setCategory} options={[{ value: 'temp-channels', label: '📁 Temporäre Kanäle' },{ value: 'voice', label: '📁 Voice Channels' }]} />
          <Input label="Namensformat" placeholder="{user}'s Kanal" value={naming} onChange={setNaming} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Max Kanäle" placeholder="10" value={maxChannels} onChange={setMaxChannels} type="number" />
            <Input label="Auto-Löschen (Sek.)" placeholder="300" value={autoDelete} onChange={setAutoDelete} type="number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Bitrate (kbps)" placeholder="64" value={bitrate} onChange={setBitrate} />
            <Input label="User Limit" placeholder="0 = Unbegrenzt" value={userLimit} onChange={setUserLimit} type="number" />
          </div>
        </>)}
      </ConfigCard>
      <SaveButton />
    </div>
  );
}

// ==========================================
// SERVER TEMPLATES
// ==========================================
export function ServerTemplatesPanel() {
  const templates = [
    { name: 'Gaming Server', icon: '🎮', desc: 'Perfekt für Gaming Communities', channels: 12, roles: 5 },
    { name: 'Community Hub', icon: '🌐', desc: 'Allround Community Template', channels: 15, roles: 7 },
    { name: 'Support Server', icon: '🆘', desc: 'Professioneller Support Server', channels: 10, roles: 4 },
    { name: 'Music Lounge', icon: '🎵', desc: 'Musik & Entertainment', channels: 8, roles: 3 },
    { name: 'Study Group', icon: '📚', desc: 'Für Lern- und Studiergruppen', channels: 9, roles: 4 },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Server Templates" desc="Fertige Vorlagen für schnelles Setup" icon={<Layout className="w-6 h-6 text-violet-400" />} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all cursor-pointer group">
            <div className="text-3xl mb-3">{t.icon}</div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{t.name}</h3>
            <p className="text-sm text-gray-400 mb-3">{t.desc}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{t.channels} Kanäle</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.roles} Rollen</span>
            </div>
            <button className="mt-4 w-full py-2 rounded-lg border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/20 transition-all">Template laden</button>
          </div>
        ))}
      </div>
      <ConfigCard title="Eigenes Template erstellen">
        <p className="text-sm text-gray-400">Erstelle ein Template aus deiner aktuellen Server-Konfiguration und teile es mit anderen.</p>
        <button className="mt-3 px-6 py-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" />Template erstellen</button>
      </ConfigCard>
    </div>
  );
}

// ==========================================
// MINIGAMES
// ==========================================
export function MinigamesPanel() {
  const [enabled, setEnabled] = useState(true);
  const [channel, setChannel] = useState('games');
  const [games] = useState([
    { name: 'Trivia', icon: '🧠', enabled: true, plays: 1243 },
    { name: 'Rock Paper Scissors', icon: '✊', enabled: true, plays: 892 },
    { name: '8Ball', icon: '🔮', enabled: true, plays: 2105 },
    { name: 'Coinflip', icon: '🪙', enabled: true, plays: 567 },
    { name: 'Slots', icon: '🎰', enabled: true, plays: 3401 },
    { name: 'Word Scramble', icon: '🔤', enabled: false, plays: 0 },
    { name: 'Number Guess', icon: '🔢', enabled: true, plays: 789 },
    { name: 'Tic Tac Toe', icon: '❌', enabled: true, plays: 445 },
    { name: 'Connect Four', icon: '🔴', enabled: true, plays: 321 },
    { name: 'Snake', icon: '🐍', enabled: false, plays: 0 },
  ]);
  const [economyLinked, setEconomyLinked] = useState(true);

  return (
    <div className="space-y-6">
      <SectionHeader title="Minispiele" desc="Spaßige Spiele für deine Community" icon={<Gamepad2 className="w-6 h-6 text-purple-400" />} />
      <ConfigCard title="Allgemein">
        <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Minispiele aktivieren</span><Toggle active={enabled} onChange={() => setEnabled(!enabled)} /></div>
        {enabled && (<>
          <Select label="Spiele-Kanal" value={channel} onChange={setChannel} options={[{ value: 'games', label: '#games' },{ value: 'bot-cmds', label: '#bot-cmds' }]} />
          <div className="flex items-center justify-between"><span className="text-sm text-gray-400">Mit Economy verknüpfen</span><Toggle active={economyLinked} onChange={() => setEconomyLinked(!economyLinked)} /></div>
        </>)}
      </ConfigCard>
      <ConfigCard title="Spiele">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {games.map((g, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="text-xl">{g.icon}</span>
                <div><span className="text-sm font-medium text-white">{g.name}</span>{g.plays > 0 && <p className="text-xs text-gray-500">{g.plays}x gespielt</p>}</div>
              </div>
              <Toggle active={g.enabled} onChange={() => {}} />
            </div>
          ))}
        </div>
      </ConfigCard>
      <SaveButton />
    </div>
  );
}

// ==========================================
// DASHBOARD HOME WIDGET (for overview)
// ==========================================
export function QuickActionsWidget() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { icon: <Zap className="w-4 h-4" />, label: 'Restart Bot', color: 'from-yellow-500 to-orange-500' },
        { icon: <Crown className="w-4 h-4" />, label: 'Premium', color: 'from-amber-500 to-yellow-500' },
        { icon: <Target className="w-4 h-4" />, label: 'Quick Setup', color: 'from-cyan-500 to-blue-500' },
        { icon: <Repeat className="w-4 h-4" />, label: 'Reset Config', color: 'from-red-500 to-pink-500' },
      ].map((a, i) => (
        <button key={i} className={`rounded-xl p-4 text-center border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all group`}>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white mx-auto mb-2 group-hover:scale-110 transition-transform`}>{a.icon}</div>
          <span className="text-xs text-gray-400">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

// ==========================================
// EMBED MESSAGE SENDER
// ==========================================
export function EmbedSenderPanel() {
  const [targetChannel, setTargetChannel] = useState('general');
  const [content, setContent] = useState('');
  const [embedTitle, setEmbedTitle] = useState('');
  const [embedDesc, setEmbedDesc] = useState('');
  const [embedColor, setEmbedColor] = useState('#a855f7');
  const [embedImage, setEmbedImage] = useState('');
  const [embedThumbnail, setEmbedThumbnail] = useState('');

  return (
    <div className="space-y-6">
      <SectionHeader title="Embed Sender" desc="Sende Embeds direkt aus dem Dashboard" icon={<Gift className="w-6 h-6 text-rose-400" />} />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ConfigCard title="Konfiguration">
            <Select label="Ziel-Kanal" value={targetChannel} onChange={setTargetChannel} options={[{ value: 'general', label: '#general' },{ value: 'announcements', label: '#announcements' },{ value: 'rules', label: '#rules' }]} />
            <Textarea label="Nachricht (vor Embed)" placeholder="Optionale Nachricht vor dem Embed..." value={content} onChange={setContent} />
            <Input label="Embed Titel" placeholder="Titel..." value={embedTitle} onChange={setEmbedTitle} />
            <Textarea label="Embed Beschreibung" placeholder="Beschreibung..." value={embedDesc} onChange={setEmbedDesc} />
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400">Farbe:</label>
              <input type="color" value={embedColor} onChange={e => setEmbedColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
              <input type="text" value={embedColor} onChange={e => setEmbedColor(e.target.value)} className="flex-1 rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-sm text-gray-200 outline-none" />
            </div>
            <Input label="Bild URL" placeholder="https://..." value={embedImage} onChange={setEmbedImage} />
            <Input label="Thumbnail URL" placeholder="https://..." value={embedThumbnail} onChange={setEmbedThumbnail} />
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-xs text-yellow-400 flex items-center gap-1">🔒 Footer & Footer-Icon sind fest: "Powered by BotForge"</p>
            </div>
          </ConfigCard>
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white font-semibold flex items-center justify-center gap-2"><Zap className="w-4 h-4" />Embed senden</button>
        </div>
        <ConfigCard title="Vorschau">
          <div className="bg-[#2b2d31] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#ec4899]" /><span className="text-sm font-semibold text-white">BotForge</span></div>
            {content && <p className="text-sm text-gray-300 mb-3">{content}</p>}
            <div className="embed-preview" style={{ borderColor: embedColor }}>
              <div className="flex gap-4">
                <div className="flex-1">
                  {embedTitle && <div className="font-bold text-white mb-2">{embedTitle}</div>}
                  {embedDesc && <div className="text-sm text-gray-300 mb-2">{embedDesc}</div>}
                  {embedImage && <div className="w-full h-24 rounded-lg bg-white/5 flex items-center justify-center text-xs text-gray-600">Bild</div>}
                </div>
                {embedThumbnail && <div className="w-14 h-14 rounded-lg bg-white/5 flex-shrink-0" />}
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#ec4899]" /><span className="text-xs text-gray-500">Powered by BotForge</span></div>
            </div>
          </div>
        </ConfigCard>
      </div>
    </div>
  );
}
