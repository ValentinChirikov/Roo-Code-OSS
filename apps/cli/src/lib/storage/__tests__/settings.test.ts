import fs from "fs/promises"
import path from "path"

// Use vi.hoisted to make the test directory available to the mock
// This must return the path synchronously since settings path is computed at import time
const { getTestConfigDir } = vi.hoisted(() => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const os = require("os")
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const path = require("path")
	const testRunId = Date.now().toString()
	const testConfigDir = path.join(os.tmpdir(), `roo-cli-settings-test-${testRunId}`)
	return { getTestConfigDir: () => testConfigDir }
})

vi.mock("../config-dir.js", () => ({
	getConfigDir: getTestConfigDir,
}))

// Import after mocking
import { loadSettings, saveSettings, resetOnboarding, getSettingsPath } from "../settings.js"
import { OnboardingProviderChoice } from "@/types/index.js"

// Re-derive the test config dir for use in tests (must match the hoisted one)
const actualTestConfigDir = getTestConfigDir()

describe("Settings Storage", () => {
	const expectedSettingsFile = path.join(actualTestConfigDir, "cli-settings.json")

	beforeEach(async () => {
		// Clear test directory before each test
		await fs.rm(actualTestConfigDir, { recursive: true, force: true })
	})

	afterAll(async () => {
		// Clean up test directory
		await fs.rm(actualTestConfigDir, { recursive: true, force: true })
	})

	describe("getSettingsPath", () => {
		it("should return the correct settings file path", () => {
			expect(getSettingsPath()).toBe(expectedSettingsFile)
		})
	})

	describe("loadSettings", () => {
		it("should return empty object if no settings file exists", async () => {
			const settings = await loadSettings()
			expect(settings).toEqual({})
		})


		it("should load settings with only some fields set", async () => {
			const settingsData = {
				mode: "code",
			}

			await fs.mkdir(actualTestConfigDir, { recursive: true })
			await fs.writeFile(expectedSettingsFile, JSON.stringify(settingsData), "utf-8")

			const loaded = await loadSettings()
			expect(loaded).toEqual(settingsData)
		})
	})

	describe("saveSettings", () => {
		it("should save settings to disk", async () => {
			await saveSettings({ mode: "debug" })

			const savedData = await fs.readFile(expectedSettingsFile, "utf-8")
			const settings = JSON.parse(savedData)

			expect(settings.mode).toBe("debug")
		})


		it("should create config directory if it doesn't exist", async () => {
			await saveSettings({ mode: "ask" })

			const dirStats = await fs.stat(actualTestConfigDir)
			expect(dirStats.isDirectory()).toBe(true)
		})

		// Unix file permissions don't apply on Windows - skip this test
		it.skipIf(process.platform === "win32")("should set restrictive file permissions", async () => {
			await saveSettings({ mode: "code" })

			const stats = await fs.stat(expectedSettingsFile)
			// Check that only owner has read/write (mode 0o600)
			const mode = stats.mode & 0o777
			expect(mode).toBe(0o600)
		})
	})

	describe("default settings priority", () => {
		it("should support all configurable default settings", async () => {
			// Test that all the settings that can be used as defaults are properly saved and loaded
			const defaultSettings = {
				mode: "debug",
				provider: "openai-native" as const,
				model: "gpt-4o",
				reasoningEffort: "low" as const,
			}

			await saveSettings(defaultSettings)
			const loaded = await loadSettings()

			expect(loaded.mode).toBe("debug")
			expect(loaded.provider).toBe("openai-native")
			expect(loaded.model).toBe("gpt-4o")
			expect(loaded.reasoningEffort).toBe("low")
		})

		it("should support requireApproval setting", async () => {
			await saveSettings({ requireApproval: true })
			const loaded = await loadSettings()

			expect(loaded.requireApproval).toBe(true)
		})

		it("should support oneshot setting", async () => {
			await saveSettings({ oneshot: true })
			const loaded = await loadSettings()

			expect(loaded.oneshot).toBe(true)
		})

		it("should still load legacy dangerouslySkipPermissions setting", async () => {
			await saveSettings({ dangerouslySkipPermissions: true })
			const loaded = await loadSettings()

			expect(loaded.dangerouslySkipPermissions).toBe(true)
		})
	})
})
