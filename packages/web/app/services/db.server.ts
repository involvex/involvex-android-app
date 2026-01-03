export interface User {
  id: string;
  email: string | null;
  password_hash: string | null;
  username: string | null;
  role: 'user' | 'admin';
  avatar_url: string | null;
  discord_id: string | null;
  github_id: string | null;
  created_at: number;
  updated_at: number;
}

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const user = await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first<User>();
  return user;
}

export async function getUserByDiscordId(db: D1Database, discordId: string): Promise<User | null> {
  return await db.prepare("SELECT * FROM users WHERE discord_id = ?").bind(discordId).first<User>();
}

export async function getUserByGitHubId(db: D1Database, githubId: string): Promise<User | null> {
  return await db.prepare("SELECT * FROM users WHERE github_id = ?").bind(githubId).first<User>();
}

export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<User>();
  return user;
}

export async function createUser(db: D1Database, email: string | null, passwordHash: string | null, username: string, oauth?: { provider: 'discord' | 'github', id: string }): Promise<User> {
  const id = crypto.randomUUID();
  const now = Date.now();
  const role = 'user'; 

  const discord_id = oauth?.provider === 'discord' ? oauth.id : null;
  const github_id = oauth?.provider === 'github' ? oauth.id : null;

  await db.prepare(
    "INSERT INTO users (id, email, password_hash, username, role, discord_id, github_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, email, passwordHash, username, role, discord_id, github_id, now, now).run();

  return {
    id,
    email,
    password_hash: passwordHash,
    username,
    role,
    avatar_url: null,
    discord_id,
    github_id,
    created_at: now,
    updated_at: now
  };
}

export async function getAllUsers(db: D1Database): Promise<User[]> {
  const { results } = await db.prepare("SELECT * FROM users ORDER BY created_at DESC").all<User>();
  return results || [];
}

export async function getStats(db: D1Database) {
  const userCount = await db.prepare("SELECT COUNT(*) as count FROM users").first<{ count: number }>();
  const subCount = await db.prepare("SELECT COUNT(*) as count FROM subscriptions").first<{ count: number }>();
  
  return {
    users: userCount?.count || 0,
    subscriptions: subCount?.count || 0
  };
}

export async function linkDiscordAccount(db: D1Database, userId: string, discordId: string): Promise<void> {
  await db.prepare("UPDATE users SET discord_id = ?, updated_at = ? WHERE id = ?")
    .bind(discordId, Date.now(), userId)
    .run();
}

export async function linkGitHubAccount(db: D1Database, userId: string, githubId: string): Promise<void> {
  await db.prepare("UPDATE users SET github_id = ?, updated_at = ? WHERE id = ?")
    .bind(githubId, Date.now(), userId)
    .run();
}
