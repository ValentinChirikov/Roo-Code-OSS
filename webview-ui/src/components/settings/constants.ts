import { type ProviderName, type ModelInfo, openAiNativeModels, openAiCodexModels } from "@roo-code/types"

export const MODELS_BY_PROVIDER: Partial<Record<ProviderName, Record<string, ModelInfo>>> = {
	"openai-native": openAiNativeModels,
	"openai-codex": openAiCodexModels,
}

export const PROVIDERS = [
	{ value: "openai-native", label: "OpenAI", proxy: false },
	{ value: "openai-codex", label: "OpenAI - ChatGPT Plus/Pro", proxy: false },
	{ value: "openai", label: "OpenAI Compatible", proxy: true },
	{ value: "vscode-lm", label: "VS Code LM API", proxy: false },
	{ value: "lmstudio", label: "LM Studio", proxy: true },
	{ value: "ollama", label: "Ollama", proxy: true },
	{ value: "litellm", label: "LiteLLM", proxy: true },
].sort((a, b) => a.label.localeCompare(b.label))
