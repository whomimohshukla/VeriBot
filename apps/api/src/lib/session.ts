import crypto from "node:crypto";
import Redis from "ioredis";
import { env } from "../config/env";

export const SESSION_COOKIE = "autonomiq_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface StoredSession {
	sessionId: string;
	userId: string;
	orgId?: string;
	role?: string;
	email: string;
	expiresAt: string;
	userAgent?: string;
	ipAddress?: string;
}

export const redis = new Redis(env.redisUrl, {
	lazyConnect: true,
	maxRetriesPerRequest: 1,
});
export const sessionKey = (token: string) => `session:${token}`;

export const createSession = async (session: StoredSession) => {
	const token = crypto.randomUUID();
	const storedSession = { ...session, sessionId: session.sessionId ?? crypto.randomUUID() };
	await redis.set(
		sessionKey(token),
		JSON.stringify(storedSession),
		"EX",
		SESSION_TTL_SECONDS,
	);
	return token;
};

export const listSessionsForUser = async (userId: string) => {
	const sessions: Array<StoredSession & { token: string }> = [];
	let cursor = "0";

	do {
		const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "session:*", "COUNT", 100);
		cursor = nextCursor;
		if (keys.length === 0) continue;
		const values = await redis.mget(keys);
		values.forEach((value, index) => {
			if (!value) return;
			const session = JSON.parse(value) as StoredSession;
			if (session.userId === userId) sessions.push({ ...session, token: keys[index].slice("session:".length) });
		});
	} while (cursor !== "0");

	return sessions;
};

export const deleteSessionById = async (userId: string, sessionId: string) => {
	const sessions = await listSessionsForUser(userId);
	const session = sessions.find((item) => item.sessionId === sessionId);
	if (!session) return false;
	await deleteSession(session.token);
	return true;
};

export const deleteOtherSessions = async (userId: string, currentToken: string) => {
	const sessions = await listSessionsForUser(userId);
	const tokens = sessions.filter((session) => session.token !== currentToken).map((session) => session.token);
	if (tokens.length > 0) await redis.del(...tokens.map(sessionKey));
	return tokens.length;
};

export const getSession = async (token: string) => {
	const value = await redis.get(sessionKey(token));
	return value ? (JSON.parse(value) as StoredSession) : null;
};

export const deleteSession = async (token: string) => {
	await redis.del(sessionKey(token));
};

export const updateSession = async (
	token: string,
	patch: Partial<StoredSession>,
) => {
	const current = await getSession(token);
	if (!current) return null;
	const updated = {
		...current,
		...patch,
		expiresAt: new Date(
			Date.now() + SESSION_TTL_SECONDS * 1000,
		).toISOString(),
	};
	await redis.set(
		sessionKey(token),
		JSON.stringify(updated),
		"EX",
		SESSION_TTL_SECONDS,
	);
	return updated;
};

export const getSessionById = async (userId: string, sessionId: string) => {
	const sessions = await listSessionsForUser(userId);
	return sessions.find((session) => session.sessionId === sessionId) ?? null;
};
