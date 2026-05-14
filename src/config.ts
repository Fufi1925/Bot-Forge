// ============================================
// BotForge Configuration
// ============================================
// Rename this to .env and fill in your values.
// NEVER commit real tokens to GitHub!
// ============================================

interface BotForgeConfig {
  // Discord Bot Token (from discord.com/developers)
  botToken: string;
  // Discord Application Client ID
  clientId: string;
  // Discord Client Secret for OAuth2
  clientSecret: string;
  // Bot public invite link
  inviteUrl: string;
  // Dashboard URL (for OAuth2 redirect)
  dashboardUrl: string;
  // Support server invite
  supportServer: string;
  // Discord Bot ID (for avatar fetching)
  botId: string;
  // Top.gg token (optional)
  topGgToken: string;
  // API base URL for backend (Railway)
  apiBaseUrl: string;
  // WebSocket URL for live data
  wsUrl: string;
}

const config: BotForgeConfig = {
  botToken: import.meta.env.VITE_BOT_TOKEN || '',
  clientId: import.meta.env.VITE_CLIENT_ID || '1234567890123456789',
  clientSecret: import.meta.env.VITE_CLIENT_SECRET || '',
  inviteUrl: import.meta.env.VITE_INVITE_URL || 'https://discord.com/oauth2/authorize?client_id=1234567890123456789&permissions=8&scope=bot%20applications.commands',
  dashboardUrl: import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5173',
  supportServer: import.meta.env.VITE_SUPPORT_SERVER || 'https://discord.gg/botforge',
  botId: import.meta.env.VITE_BOT_ID || '1234567890123456789',
  topGgToken: import.meta.env.VITE_TOPGG_TOKEN || '',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://botforge-api.up.railway.app',
  wsUrl: import.meta.env.VITE_WS_URL || 'wss://botforge-api.up.railway.app/ws',
};

export default config;

// Discord API Endpoints
export const DISCORD_API = {
  BASE: 'https://discord.com/api/v10',
  USER: (id: string) => `/users/${id}`,
  GUILDS: '/users/@me/guilds',
  GUILD: (id: string) => `/guilds/${id}`,
  GUILD_MEMBERS: (id: string) => `/guilds/${id}/members`,
  GUILD_CHANNELS: (id: string) => `/guilds/${id}/channels`,
  GUILD_ROLES: (id: string) => `/guilds/${id}/roles`,
  GUILD_EMOJIS: (id: string) => `/guilds/${id}/emojis`,
  BOT_GATEWAY: '/gateway/bot',
  OAUTH2_TOKEN: '/oauth2/token',
  OAUTH2_AUTHORIZE: 'https://discord.com/oauth2/authorize',
  CDN_AVATAR: (userId: string, avatarHash: string) =>
    `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=256`,
  CDN_DEFAULT_AVATAR: (discriminator: string) =>
    `https://cdn.discordapp.com/embed/avatars/${parseInt(discriminator) % 5}.png`,
  CDN_EMOJI: (emojiId: string) =>
    `https://cdn.discordapp.com/emojis/${emojiId}.png`,
  CDN_ICON: (guildId: string, iconHash: string) =>
    `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png?size=256`,
};

// Bot invite permissions (Administrator for full functionality)
export const BOT_PERMISSIONS = 8; // Administrator
export const BOT_SCOPES = ['bot', 'applications.commands'];
