import { useCallback, useEffect, useRef, useState } from "react"
import {
	VSCodeProgressRing,
	VSCodeRadio,
	VSCodeRadioGroup,
	VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"

import type { ProviderSettings } from "@roo-code/types"

import { useExtensionState } from "@src/context/ExtensionStateContext"
import { validateApiConfiguration } from "@src/utils/validate"
import { vscode } from "@src/utils/vscode"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { Button } from "@src/components/ui"

import ApiOptions from "../settings/ApiOptions"
import { Tab, TabContent } from "../common/Tab"

import RooHero from "./RooHero"
import { Trans } from "react-i18next"
import { ArrowLeft, ArrowRight, BadgeInfo, Brain, TriangleAlert } from "lucide-react"
import { buildDocLink } from "@/utils/docLinks"

type ProviderOption = "custom"
type AuthOrigin = "landing" | "providerSelection"

const WelcomeViewProvider = () => {
	const {
		apiConfiguration,
		currentApiConfigName,
		setApiConfiguration,
		uriScheme,
		cloudAuthSkipModel,
	} = useExtensionState()
	const { t } = useAppTranslation()
	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
	const [selectedProvider, setSelectedProvider] = useState<ProviderOption | null>(null)
	// const [authInProgress, setAuthInProgress] = useState(false)
	// const [authOrigin, setAuthOrigin] = useState<AuthOrigin | null>(null)
	const [showManualEntry, setShowManualEntry] = useState(false)
	const [manualUrl, setManualUrl] = useState("")
	const [manualErrorMessage, setManualErrorMessage] = useState<boolean | undefined>(undefined)
	const manualUrlInputRef = useRef<HTMLInputElement | null>(null)

	// When auth completes during the provider signup flow, either:
	// 1. If user skipped model selection (cloudAuthSkipModel=true), navigate to provider selection with "custom" selected
	// 2. Otherwise, save the Roo config and navigate to chat
	// useEffect(() => {
	// 	if (authInProgress) {
	// 		// User skipped model selection during signup - navigate to provider selection with 3rd-party selected
	// 		// setSelectedProvider("custom")
	// 		setSelectedProvider(null)
	// 		setAuthInProgress(false)
	// 		setShowManualEntry(false)
	// 		// Clear the flag so it doesn't affect future flows
	// 		vscode.postMessage({ type: "clearCloudAuthSkipModel" })
	// 	}
	// }, [authInProgress, currentApiConfigName, cloudAuthSkipModel])

	// Focus the manual URL input when it becomes visible
	useEffect(() => {
		if (showManualEntry && manualUrlInputRef.current) {
			setTimeout(() => {
				manualUrlInputRef.current?.focus()
			}, 50)
		}
	}, [showManualEntry])

	// Memoize the setApiConfigurationField function to pass to ApiOptions
	const setApiConfigurationFieldForApiOptions = useCallback(
		<K extends keyof ProviderSettings>(field: K, value: ProviderSettings[K]) => {
			setApiConfiguration({ [field]: value })
		},
		[setApiConfiguration], // setApiConfiguration from context is stable
	)

	const handleGetStarted = useCallback(() => {
		// Custom provider - validate first
		const error = apiConfiguration ? validateApiConfiguration(apiConfiguration) : undefined

		if (error) {
			setErrorMessage(error)
			return
		}

		setErrorMessage(undefined)
		vscode.postMessage({ type: "upsertApiConfiguration", text: currentApiConfigName, apiConfiguration })
	}, [selectedProvider, apiConfiguration, currentApiConfigName])

	const handleNoAccount = useCallback(() => {
		setSelectedProvider("custom")
	}, [])

	const handleBackToLanding = useCallback(() => {
		// Return to the landing screen
		setSelectedProvider(null)
		setErrorMessage(undefined)
	}, [])


	// Landing screen - shown when selectedProvider === null
	if (selectedProvider === null) {
		return (
			<Tab>
				<TabContent className="relative flex flex-col gap-4 p-6 justify-center">
					<RooHero />
					<h2 className="mt-0 mb-0 text-xl">{t("welcome:landing.greeting")}</h2>

					<div className="space-y-4 leading-normal">
						<p className="text-base text-vscode-foreground">
							<Trans i18nKey="welcome:landing.introduction" />
						</p>
					</div>

					<div className="mt-2 flex gap-2 items-center">
						<Button onClick={handleNoAccount} variant="primary">
							{t("welcome:landing.noAccount")}
						</Button>
					</div>

					<div className="absolute bottom-6 left-6">
						<button
							onClick={() => vscode.postMessage({ type: "importSettings" })}
							className="cursor-pointer bg-transparent border-none p-0 text-vscode-foreground hover:underline">
							{t("welcome:importSettings")}
						</button>
					</div>
				</TabContent>
			</Tab>
		)
	}

	// Provider Selection screen - shown when selectedProvider is "custom"
	return (
		<Tab>
			<TabContent className="flex flex-col gap-4 p-6 justify-center">
				<Brain className="size-8" strokeWidth={1.5} />
				<h2 className="mt-0 mb-0 text-xl">{t("welcome:providerSignup.heading")}</h2>

				<p className="text-base text-vscode-foreground">
					<Trans i18nKey="welcome:providerSignup.chooseProvider" />
				</p>

				<div>
					<VSCodeRadioGroup
						value={selectedProvider}
						onChange={(e: Event | React.FormEvent<HTMLElement>) => {
							const target = ((e as CustomEvent)?.detail?.target ||
								(e.target as HTMLInputElement)) as HTMLInputElement
							setSelectedProvider(target.value as ProviderOption)
						}}>
						{/* Use Another Provider Option */}
						<VSCodeRadio value="custom" className="flex items-start gap-2">
							<div className="flex-1 space-y-1 cursor-pointer">
								<p className="text-lg font-semibold block -mt-1">
									{t("welcome:providerSignup.useAnotherProvider")}
								</p>
								<p className="text-base text-vscode-descriptionForeground mt-0">
									{t("welcome:providerSignup.useAnotherProviderDescription")}
								</p>
							</div>
						</VSCodeRadio>
					</VSCodeRadioGroup>

					{/* Expand API options only when custom provider is selected, max height is used to force a transition */}
					<div className="mb-8 border-l-2 border-vscode-panel-border pl-6 ml-[7px]">
						<div
							className={`overflow-clip transition-[max-height] ease-in-out duration-300 ${selectedProvider === "custom" ? "max-h-[600px]" : "max-h-0"}`}>
							<ApiOptions
								fromWelcomeView
								apiConfiguration={apiConfiguration || {}}
								uriScheme={uriScheme}
								setApiConfigurationField={setApiConfigurationFieldForApiOptions}
								errorMessage={errorMessage}
								setErrorMessage={setErrorMessage}
							/>
						</div>
					</div>
				</div>

				<div className="-mt-4 flex gap-2">
					<Button onClick={handleBackToLanding} variant="secondary">
						<ArrowLeft className="size-4" />
						{t("welcome:providerSignup.goBack")}
					</Button>
					<Button onClick={handleGetStarted} variant="primary">
						{t("welcome:providerSignup.finish")} →
					</Button>
				</div>
			</TabContent>
		</Tab>
	)
}

export default WelcomeViewProvider
