import crypto from "node:crypto";
import { env } from "../../../config/env";
import { redis } from "../../../lib/session";
import { oauthLoginOrRegister } from "./auth.service";

export type OAuthProvider = "google" | "github";

const providerConfig = (provider: OAuthProvider) => {
	if (provider === "google") return { clientId: env.googleClientId, clientSecret: env.googleClientSecret, callbackUrl: env.googleCallbackUrl };
	return { clientId: env.githubClientId, clientSecret: env.githubClientSecret, callbackUrl: env.githubCallbackUrl };
};

const stateKey = (state: string) => `oauth:state:${state}`;

export const createOAuthAuthorizationUrl = async (provider: OAuthProvider) => {
	const config = providerConfig(provider);
	if (!config.clientId || !config.clientSecret) throw new Error(`${provider} OAuth is not configured`);
	const state = crypto.randomBytes(24).toString("hex");
	await redis.set(stateKey(state), provider, "EX", 600);
	const params = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.callbackUrl, response_type: "code", state });
	if (provider === "google") {
		params.set("scope", "openid email profile");
		params.set("access_type", "offline");
		params.set("prompt", "consent");
		return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
	}
	params.delete("response_type");
	params.set("scope", "read:user user:email");
	return `https://github.com/login/oauth/authorize?${params}`;
};

const exchangeCode = async (provider: OAuthProvider, code: string) => {
	const config = providerConfig(provider);
	if (provider === "google") {
		const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.callbackUrl, grant_type: "authorization_code" }) });
		if (!tokenResponse.ok) throw new Error("Google OAuth token exchange failed");
		const tokens = (await tokenResponse.json()) as { access_token: string };
		const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
		if (!profileResponse.ok) throw new Error("Google profile request failed");
		const profile = (await profileResponse.json()) as { sub: string; email: string; name?: string };
		return { providerAccountId: profile.sub, email: profile.email, name: profile.name, accessToken: tokens.access_token };
	}

	const tokenResponse = await fetch("https://github.com/login/oauth/access_token", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ client_id: config.clientId, client_secret: config.clientSecret, code, redirect_uri: config.callbackUrl }) });
	if (!tokenResponse.ok) throw new Error("GitHub OAuth token exchange failed");
	const tokens = (await tokenResponse.json()) as { access_token: string };
	const profileResponse = await fetch("https://api.github.com/user", { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${tokens.access_token}`, "User-Agent": "AutonomIQ" } });
	if (!profileResponse.ok) throw new Error("GitHub profile request failed");
	const profile = (await profileResponse.json()) as { id: number; login: string; name?: string; email?: string };
	let email = profile.email;
	if (!email) {
		const emailsResponse = await fetch("https://api.github.com/user/emails", { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${tokens.access_token}`, "User-Agent": "AutonomIQ" } });
		const emails = (await emailsResponse.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
		email = emails.find((item) => item.primary && item.verified)?.email ?? emails.find((item) => item.verified)?.email;
	}
	return { providerAccountId: String(profile.id), email, name: profile.name ?? profile.login, accessToken: tokens.access_token };
};

export const completeOAuthAuthorization = async (provider: OAuthProvider, code: string, state: string) => {
	const storedProvider = await redis.get(stateKey(state));
	if (storedProvider !== provider) throw new Error("Invalid OAuth state");
	await redis.del(stateKey(state));
	const profile = await exchangeCode(provider, code);
	if (!profile.email) throw new Error("OAuth provider did not return an email address");
	return oauthLoginOrRegister({ provider: provider.toUpperCase() as "GOOGLE" | "GITHUB", ...profile });
};
