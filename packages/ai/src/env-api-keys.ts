import type { KnownProvider } from "./types.js";

/**
 * Get API key for provider from known environment variables, e.g. OPENAI_API_KEY.
 *
 * Will not return API keys for providers that require OAuth tokens.
 */
export function getEnvApiKey(provider: KnownProvider): string | undefined;
export function getEnvApiKey(provider: string): string | undefined;
export function getEnvApiKey(provider: any): string | undefined {
	// ANTHROPIC_OAUTH_TOKEN takes precedence over ANTHROPIC_API_KEY
	if (provider === "anthropic") {
		return process.env.ANTHROPIC_OAUTH_TOKEN || process.env.ANTHROPIC_API_KEY;
	}

	const envMap: Record<string, string> = {
		openai: "OPENAI_API_KEY",
		openrouter: "OPENROUTER_API_KEY",
	};

	const envVar = envMap[provider];
	return envVar ? process.env[envVar] : undefined;
}
