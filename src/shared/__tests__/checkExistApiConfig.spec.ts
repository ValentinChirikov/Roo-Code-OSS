// npx vitest run src/shared/__tests__/checkExistApiConfig.spec.ts

import type { ProviderSettings } from "@roo-code-oss/types"

import { checkExistKey } from "../checkExistApiConfig"

describe("checkExistKey", () => {
	it("should return false for undefined config", () => {
		expect(checkExistKey(undefined)).toBe(false)
	})

	it("should return false for empty config", () => {
		const config: ProviderSettings = {}
		expect(checkExistKey(config)).toBe(false)
	})

	it("should return true for fake-ai provider without API key", () => {
		const config: ProviderSettings = {
			apiProvider: "fake-ai",
		}
		expect(checkExistKey(config)).toBe(true)
	})

	it("should return true for openai-codex provider without API key", () => {
		const config: ProviderSettings = {
			apiProvider: "openai-codex",
		}
		expect(checkExistKey(config)).toBe(true)
	})
})
