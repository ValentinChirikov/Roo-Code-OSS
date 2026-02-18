export * from "./lite-llm.js"
export * from "./lm-studio.js"
export * from "./ollama.js"
export * from "./openai.js"
export * from "./openai-codex.js"
export * from "./openai-codex-rate-limits.js"
export * from "./vscode-llm.js"

import { litellmDefaultModelId } from "./lite-llm.js"
import { openAiCodexDefaultModelId } from "./openai-codex.js"
import { vscodeLlmDefaultModelId } from "./vscode-llm.js"

// Import the ProviderName type from provider-settings to avoid duplication
import type { ProviderName } from "../provider-settings.js"

/**
 * Get the default model ID for a given provider.
 * This function returns only the provider's default model ID, without considering user configuration.
 * Used as a fallback when provider models are still loading.
 */
export function getProviderDefaultModelId(
	provider: ProviderName,
	options: { isChina?: boolean } = { isChina: false },
): string {
	switch (provider) {
		case "litellm":
			return litellmDefaultModelId
		case "openai-native":
			return "gpt-4o" // Based on openai-native patterns
		case "openai-codex":
			return openAiCodexDefaultModelId

		case "openai":
			return "" // OpenAI provider uses custom model configuration
		case "ollama":
			return "" // Ollama uses dynamic model selection
		case "lmstudio":
			return "" // LMStudio uses dynamic model selection
		case "vscode-lm":
			return vscodeLlmDefaultModelId
		case "fake-ai":
		default:
			return ""
	}
}
