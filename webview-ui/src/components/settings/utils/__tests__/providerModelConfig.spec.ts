import {
	PROVIDER_SERVICE_CONFIG,
	PROVIDER_DEFAULT_MODEL_IDS,
	getProviderServiceConfig,
	getDefaultModelIdForProvider,
	getStaticModelsForProvider,
	isStaticModelProvider,
	PROVIDERS_WITH_CUSTOM_MODEL_UI,
	shouldUseGenericModelPicker,
} from "../providerModelConfig"

describe("providerModelConfig", () => {
	describe("PROVIDER_SERVICE_CONFIG", () => {
		it("contains service config for ollama", () => {
			expect(PROVIDER_SERVICE_CONFIG.ollama).toEqual({
				serviceName: "Ollama",
				serviceUrl: "https://ollama.ai",
			})
		})

		it("contains service config for lmstudio", () => {
			expect(PROVIDER_SERVICE_CONFIG.lmstudio).toEqual({
				serviceName: "LM Studio",
				serviceUrl: "https://lmstudio.ai/docs",
			})
		})

		it("contains service config for vscode-lm", () => {
			expect(PROVIDER_SERVICE_CONFIG["vscode-lm"]).toEqual({
				serviceName: "VS Code LM",
				serviceUrl: "https://code.visualstudio.com/api/extension-guides/language-model",
			})
		})
	})

	describe("getProviderServiceConfig", () => {
		it("returns fallback config for unknown provider", () => {
			const config = getProviderServiceConfig("unknown-provider" as any)
			expect(config.serviceName).toBe("unknown-provider")
			expect(config.serviceUrl).toBe("")
		})
	})

	describe("PROVIDER_DEFAULT_MODEL_IDS", () => {
		it("contains default model IDs for static providers", () => {
			expect(PROVIDER_DEFAULT_MODEL_IDS["openai-native"]).toBeDefined()
		})
	})

	describe("getDefaultModelIdForProvider", () => {
		it("returns empty string for unknown provider", () => {
			const defaultId = getDefaultModelIdForProvider("unknown" as any)
			expect(defaultId).toBe("")
		})
	})
})

describe("isStaticModelProvider", () => {
	it("returns true for providers with static models", () => {
		expect(isStaticModelProvider("openai-native")).toBe(true)
	})

	it("returns false for providers without static models", () => {
		expect(isStaticModelProvider("ollama")).toBe(false)
		expect(isStaticModelProvider("lmstudio")).toBe(false)
	})
})

describe("PROVIDERS_WITH_CUSTOM_MODEL_UI", () => {
	it("includes providers that have their own model selection UI", () => {
		expect(PROVIDERS_WITH_CUSTOM_MODEL_UI).toContain("ollama")
		expect(PROVIDERS_WITH_CUSTOM_MODEL_UI).toContain("lmstudio")
		expect(PROVIDERS_WITH_CUSTOM_MODEL_UI).toContain("vscode-lm")
	})
})

describe("shouldUseGenericModelPicker", () => {
	it("returns false for providers with custom model UI", () => {
		expect(shouldUseGenericModelPicker("ollama")).toBe(false)
		expect(shouldUseGenericModelPicker("lmstudio")).toBe(false)
		expect(shouldUseGenericModelPicker("vscode-lm")).toBe(false)
	})

	it("returns false for providers without static models", () => {
		expect(shouldUseGenericModelPicker("openai")).toBe(false)
	})
})
// })
