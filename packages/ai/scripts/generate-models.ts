#!/usr/bin/env tsx

import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { Model } from "../src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, "..");

type CoreApi = "anthropic-messages" | "openai-responses" | "openai-completions" | "openai-codex-responses";
type CoreModel = Model<CoreApi>;

interface ModelsDevModel {
	id: string;
	name: string;
	tool_call?: boolean;
	reasoning?: boolean;
	limit?: {
		context?: number;
		output?: number;
	};
	cost?: {
		input?: number;
		output?: number;
		cache_read?: number;
		cache_write?: number;
	};
	modalities?: {
		input?: string[];
	};
}

interface ModelsDevResponse {
	anthropic?: { models?: Record<string, ModelsDevModel> };
	openai?: { models?: Record<string, ModelsDevModel> };
}

interface OpenRouterModel {
	id: string;
	name: string;
	context_length?: number;
	top_provider?: { max_completion_tokens?: number };
	pricing?: {
		prompt?: string;
		completion?: string;
		input_cache_read?: string;
		input_cache_write?: string;
	};
	supported_parameters?: string[];
	architecture?: {
		modality?: string[];
	};
}

function parsePricePerToken(value: string | undefined): number {
	return parseFloat(value || "0") * 1_000_000;
}

function mapInputModalities(inputs: string[] | undefined): ("text" | "image")[] {
	const result: ("text" | "image")[] = ["text"];
	if (inputs?.includes("image")) {
		result.push("image");
	}
	return result;
}

function ensureModel(allModels: CoreModel[], model: CoreModel): void {
	if (!allModels.some((candidate) => candidate.provider === model.provider && candidate.id === model.id)) {
		allModels.push(model);
	}
}

async function fetchOpenRouterModels(): Promise<Model<"openai-completions">[]> {
	try {
		console.log("Fetching models from OpenRouter API...");
		const response = await fetch("https://openrouter.ai/api/v1/models");
		const data = (await response.json()) as { data?: OpenRouterModel[] };
		const models: Model<"openai-completions">[] = [];

		for (const model of data.data || []) {
			if (!model.supported_parameters?.includes("tools")) continue;

			const input = mapInputModalities(model.architecture?.modality);
			models.push({
				id: model.id,
				name: model.name,
				api: "openai-completions",
				baseUrl: "https://openrouter.ai/api/v1",
				provider: "openrouter",
				reasoning: model.supported_parameters?.includes("reasoning") || false,
				input,
				cost: {
					input: parsePricePerToken(model.pricing?.prompt),
					output: parsePricePerToken(model.pricing?.completion),
					cacheRead: parsePricePerToken(model.pricing?.input_cache_read),
					cacheWrite: parsePricePerToken(model.pricing?.input_cache_write),
				},
				contextWindow: model.context_length || 4096,
				maxTokens: model.top_provider?.max_completion_tokens || 4096,
			});
		}

		console.log(`Fetched ${models.length} tool-capable models from OpenRouter`);
		return models;
	} catch (error) {
		console.error("Failed to fetch OpenRouter models:", error);
		return [];
	}
}

async function loadModelsDevData(): Promise<Array<Model<"anthropic-messages"> | Model<"openai-responses">>> {
	try {
		console.log("Fetching models from models.dev API...");
		const response = await fetch("https://models.dev/api.json");
		const data = (await response.json()) as ModelsDevResponse;
		const models: Array<Model<"anthropic-messages"> | Model<"openai-responses">> = [];

		if (data.anthropic?.models) {
			for (const [modelId, model] of Object.entries(data.anthropic.models)) {
				if (model.tool_call !== true) continue;
				models.push({
					id: modelId,
					name: model.name || modelId,
					api: "anthropic-messages",
					provider: "anthropic",
					baseUrl: "https://api.anthropic.com",
					reasoning: model.reasoning === true,
					input: mapInputModalities(model.modalities?.input),
					cost: {
						input: model.cost?.input || 0,
						output: model.cost?.output || 0,
						cacheRead: model.cost?.cache_read || 0,
						cacheWrite: model.cost?.cache_write || 0,
					},
					contextWindow: model.limit?.context || 4096,
					maxTokens: model.limit?.output || 4096,
				});
			}
		}

		if (data.openai?.models) {
			for (const [modelId, model] of Object.entries(data.openai.models)) {
				if (model.tool_call !== true) continue;
				models.push({
					id: modelId,
					name: model.name || modelId,
					api: "openai-responses",
					provider: "openai",
					baseUrl: "https://api.openai.com/v1",
					reasoning: model.reasoning === true,
					input: mapInputModalities(model.modalities?.input),
					cost: {
						input: model.cost?.input || 0,
						output: model.cost?.output || 0,
						cacheRead: model.cost?.cache_read || 0,
						cacheWrite: model.cost?.cache_write || 0,
					},
					contextWindow: model.limit?.context || 4096,
					maxTokens: model.limit?.output || 4096,
				});
			}
		}

		console.log(`Loaded ${models.length} tool-capable models from models.dev`);
		return models;
	} catch (error) {
		console.error("Failed to load models.dev data:", error);
		return [];
	}
}

function addFallbackModels(allModels: CoreModel[]): void {
	const opus45 = allModels.find((model) => model.provider === "anthropic" && model.id === "claude-opus-4-5");
	if (opus45) {
		opus45.cost.cacheRead = 0.5;
		opus45.cost.cacheWrite = 6.25;
	}

	for (const model of allModels) {
		if (model.provider === "anthropic" && model.id === "claude-opus-4-6") {
			model.contextWindow = 200000;
		}
	}

	ensureModel(allModels, {
		id: "claude-opus-4-6",
		name: "Claude Opus 4.6",
		api: "anthropic-messages",
		baseUrl: "https://api.anthropic.com",
		provider: "anthropic",
		reasoning: true,
		input: ["text", "image"],
		cost: {
			input: 5,
			output: 25,
			cacheRead: 0.5,
			cacheWrite: 6.25,
		},
		contextWindow: 200000,
		maxTokens: 128000,
	});

	ensureModel(allModels, {
		id: "claude-sonnet-4-6",
		name: "Claude Sonnet 4.6",
		api: "anthropic-messages",
		baseUrl: "https://api.anthropic.com",
		provider: "anthropic",
		reasoning: true,
		input: ["text", "image"],
		cost: {
			input: 3,
			output: 15,
			cacheRead: 0.3,
			cacheWrite: 3.75,
		},
		contextWindow: 200000,
		maxTokens: 64000,
	});

	ensureModel(allModels, {
		id: "gpt-5-chat-latest",
		name: "GPT-5 Chat Latest",
		api: "openai-responses",
		baseUrl: "https://api.openai.com/v1",
		provider: "openai",
		reasoning: false,
		input: ["text", "image"],
		cost: {
			input: 1.25,
			output: 10,
			cacheRead: 0.125,
			cacheWrite: 0,
		},
		contextWindow: 128000,
		maxTokens: 16384,
	});

	ensureModel(allModels, {
		id: "gpt-5.1-codex",
		name: "GPT-5.1 Codex",
		api: "openai-responses",
		baseUrl: "https://api.openai.com/v1",
		provider: "openai",
		reasoning: true,
		input: ["text", "image"],
		cost: {
			input: 1.25,
			output: 5,
			cacheRead: 0.125,
			cacheWrite: 1.25,
		},
		contextWindow: 400000,
		maxTokens: 128000,
	});

	ensureModel(allModels, {
		id: "gpt-5.1-codex-max",
		name: "GPT-5.1 Codex Max",
		api: "openai-responses",
		baseUrl: "https://api.openai.com/v1",
		provider: "openai",
		reasoning: true,
		input: ["text", "image"],
		cost: {
			input: 1.25,
			output: 10,
			cacheRead: 0.125,
			cacheWrite: 0,
		},
		contextWindow: 400000,
		maxTokens: 128000,
	});

	ensureModel(allModels, {
		id: "gpt-5.3-codex-spark",
		name: "GPT-5.3 Codex Spark",
		api: "openai-responses",
		baseUrl: "https://api.openai.com/v1",
		provider: "openai",
		reasoning: true,
		input: ["text"],
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
		},
		contextWindow: 128000,
		maxTokens: 16384,
	});

	ensureModel(allModels, {
		id: "auto",
		name: "Auto",
		api: "openai-completions",
		provider: "openrouter",
		baseUrl: "https://openrouter.ai/api/v1",
		reasoning: true,
		input: ["text", "image"],
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
		},
		contextWindow: 2000000,
		maxTokens: 30000,
	});

	const CODEX_BASE_URL = "https://chatgpt.com/backend-api";
	const CODEX_CONTEXT = 272000;
	const CODEX_MAX_TOKENS = 128000;
	const codexModels: Model<"openai-codex-responses">[] = [
		{
			id: "gpt-5.1",
			name: "GPT-5.1",
			api: "openai-codex-responses",
			provider: "openai-codex",
			baseUrl: CODEX_BASE_URL,
			reasoning: true,
			input: ["text", "image"],
			cost: { input: 1.25, output: 10, cacheRead: 0.125, cacheWrite: 0 },
			contextWindow: CODEX_CONTEXT,
			maxTokens: CODEX_MAX_TOKENS,
		},
		{
			id: "gpt-5.1-codex-max",
			name: "GPT-5.1 Codex Max",
			api: "openai-codex-responses",
			provider: "openai-codex",
			baseUrl: CODEX_BASE_URL,
			reasoning: true,
			input: ["text", "image"],
			cost: { input: 1.25, output: 10, cacheRead: 0.125, cacheWrite: 0 },
			contextWindow: CODEX_CONTEXT,
			maxTokens: CODEX_MAX_TOKENS,
		},
		{
			id: "gpt-5.1-codex-mini",
			name: "GPT-5.1 Codex Mini",
			api: "openai-codex-responses",
			provider: "openai-codex",
			baseUrl: CODEX_BASE_URL,
			reasoning: true,
			input: ["text", "image"],
			cost: { input: 0.25, output: 2, cacheRead: 0.025, cacheWrite: 0 },
			contextWindow: CODEX_CONTEXT,
			maxTokens: CODEX_MAX_TOKENS,
		},
		{
			id: "gpt-5.2",
			name: "GPT-5.2",
			api: "openai-codex-responses",
			provider: "openai-codex",
			baseUrl: CODEX_BASE_URL,
			reasoning: true,
			input: ["text", "image"],
			cost: { input: 1.75, output: 14, cacheRead: 0.175, cacheWrite: 0 },
			contextWindow: CODEX_CONTEXT,
			maxTokens: CODEX_MAX_TOKENS,
		},
		{
			id: "gpt-5.2-codex",
			name: "GPT-5.2 Codex",
			api: "openai-codex-responses",
			provider: "openai-codex",
			baseUrl: CODEX_BASE_URL,
			reasoning: true,
			input: ["text", "image"],
			cost: { input: 1.75, output: 14, cacheRead: 0.175, cacheWrite: 0 },
			contextWindow: CODEX_CONTEXT,
			maxTokens: CODEX_MAX_TOKENS,
		},
		{
			id: "gpt-5.3-codex",
			name: "GPT-5.3 Codex",
			api: "openai-codex-responses",
			provider: "openai-codex",
			baseUrl: CODEX_BASE_URL,
			reasoning: true,
			input: ["text", "image"],
			cost: { input: 1.75, output: 14, cacheRead: 0.175, cacheWrite: 0 },
			contextWindow: CODEX_CONTEXT,
			maxTokens: CODEX_MAX_TOKENS,
		},
		{
			id: "gpt-5.3-codex-spark",
			name: "GPT-5.3 Codex Spark",
			api: "openai-codex-responses",
			provider: "openai-codex",
			baseUrl: CODEX_BASE_URL,
			reasoning: true,
			input: ["text"],
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
			contextWindow: 128000,
			maxTokens: CODEX_MAX_TOKENS,
		},
	];

	for (const model of codexModels) {
		ensureModel(allModels, model);
	}
}

function generateModelFile(allModels: CoreModel[]): void {
	const providers: Record<string, Record<string, CoreModel>> = {};
	for (const model of allModels) {
		if (!providers[model.provider]) {
			providers[model.provider] = {};
		}
		if (!providers[model.provider][model.id]) {
			providers[model.provider][model.id] = model;
		}
	}

	let output = `// This file is auto-generated by scripts/generate-models.ts
// Do not edit manually - run 'npm run generate-models' to update

import type { Model } from "./types.js";

export const MODELS = {
`;

	const sortedProviderIds = Object.keys(providers).sort();
	for (const providerId of sortedProviderIds) {
		output += `\t${JSON.stringify(providerId)}: {\n`;
		const sortedModelIds = Object.keys(providers[providerId]).sort();
		for (const modelId of sortedModelIds) {
			const model = providers[providerId][modelId];
			output += `\t\t"${model.id}": {\n`;
			output += `\t\t\tid: "${model.id}",\n`;
			output += `\t\t\tname: "${model.name}",\n`;
			output += `\t\t\tapi: "${model.api}",\n`;
			output += `\t\t\tprovider: "${model.provider}",\n`;
			output += `\t\t\tbaseUrl: "${model.baseUrl}",\n`;
			if (model.headers) {
				output += `\t\t\theaders: ${JSON.stringify(model.headers)},\n`;
			}
			if (model.compat) {
				output += `\t\t\tcompat: ${JSON.stringify(model.compat)},\n`;
			}
			output += `\t\t\treasoning: ${model.reasoning},\n`;
			output += `\t\t\tinput: [${model.input.map((input) => `"${input}"`).join(", ")}],\n`;
			output += `\t\t\tcost: {\n`;
			output += `\t\t\t\tinput: ${model.cost.input},\n`;
			output += `\t\t\t\toutput: ${model.cost.output},\n`;
			output += `\t\t\t\tcacheRead: ${model.cost.cacheRead},\n`;
			output += `\t\t\t\tcacheWrite: ${model.cost.cacheWrite},\n`;
			output += `\t\t\t},\n`;
			output += `\t\t\tcontextWindow: ${model.contextWindow},\n`;
			output += `\t\t\tmaxTokens: ${model.maxTokens},\n`;
			output += `\t\t} satisfies Model<"${model.api}">,\n`;
		}
		output += `\t},\n`;
	}

	output += `} as const;
`;

	writeFileSync(join(packageRoot, "src/models.generated.ts"), output);
	console.log("Generated src/models.generated.ts");

	console.log(`\nModel Statistics:`);
	console.log(`  Total tool-capable models: ${allModels.length}`);
	console.log(`  Reasoning-capable models: ${allModels.filter((model) => model.reasoning).length}`);
	for (const [provider, models] of Object.entries(providers)) {
		console.log(`  ${provider}: ${Object.keys(models).length} models`);
	}
}

async function generateModels() {
	const modelsDevModels = await loadModelsDevData();
	const openRouterModels = await fetchOpenRouterModels();
	const allModels: CoreModel[] = [...modelsDevModels, ...openRouterModels];
	addFallbackModels(allModels);
	generateModelFile(allModels);
}

generateModels().catch((error) => {
	console.error(error);
	process.exit(1);
});
