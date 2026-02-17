import { clearApiProviders, registerApiProvider } from "../api-registry.js";
import { streamAnthropic, streamSimpleAnthropic } from "./anthropic.js";
import { streamOpenAICodexResponses, streamSimpleOpenAICodexResponses } from "./openai-codex-responses.js";
import { streamOpenAICompletions, streamSimpleOpenAICompletions } from "./openai-completions.js";
import { streamOpenAIResponses, streamSimpleOpenAIResponses } from "./openai-responses.js";

export function registerBuiltInApiProviders(): void {
	registerApiProvider({
		api: "anthropic-messages",
		stream: streamAnthropic,
		streamSimple: streamSimpleAnthropic,
	});

	registerApiProvider({
		api: "openai-completions",
		stream: streamOpenAICompletions,
		streamSimple: streamSimpleOpenAICompletions,
	});

	registerApiProvider({
		api: "openai-responses",
		stream: streamOpenAIResponses,
		streamSimple: streamSimpleOpenAIResponses,
	});

	registerApiProvider({
		api: "openai-codex-responses",
		stream: streamOpenAICodexResponses,
		streamSimple: streamSimpleOpenAICodexResponses,
	});
}

export function resetApiProviders(): void {
	clearApiProviders();
	registerBuiltInApiProviders();
}

registerBuiltInApiProviders();
