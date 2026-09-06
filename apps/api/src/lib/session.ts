import crypto from "node:crypto";
import Redis from "ioredis";
import { env } from "../config/env";

export const SESSION_COOKIE = "autonomiq_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface StoredSession {
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
	await redis.set(
		sessionKey(token),
		JSON.stringify(session),
		"EX",
		SESSION_TTL_SECONDS,
	);
	return token;
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
