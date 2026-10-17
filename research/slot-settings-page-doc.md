<!-- source: F:\App\DSH\resources\app.asar lines 737300-737360 (bundled DSH source) -->
737300: 				registerOptions: [{
737301: 					name: "key",
737302: 					requirement: "required",
737303: 					type: "string",
737304: 					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
737305: 				}],
737306: 				ownerProps: ["/** One user-requested bundle activation and navigation to its configuration page. */\nexport interface PluginActivationOwnerProps {\n  readonly packageName: string\n  /** Dismiss guidance for this activation. */\n  readonly onDismiss: () => void\n  /** Dismiss guidance and open this bundle's detail page. */\n  readonly onOpenDetails: () => void\n}"],
737307: 				ownerPropsReferences: [],
737308: 				standardProps: [
737309: 					"useResource: UseResource",
737310: 					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
737311: 					"usePanelInfo: UsePanelInfo",
737312: 					"useSessions: UseSessions",
737313: 					"useSessionStatus: UseSessionStatus",
737314: 					"useSessionRetainInfo: UseSessionRetainInfo",
737315: 					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>"
737316: 				],
737317: 				keyDomain: "open: any string the owner dispatches (no compile-time key set), already taken: @deepseek-ai/dsh-experimental-voice-input-bundle",
737318: 				hookContext: "",
737319: 				slotInject: "",
737320: 				declaredBy: "an entry in 'main' (client-ui-plugin-manager), so it exists while that entry is mounted",
737321: 				occupants: ["experimental-client-ui-voice-input VoiceSetupPrompt key '@deepseek-ai/dsh-experimental-voice-input-bundle'"],
737322: 				replaceRisk: "shadows-shipped-ui",
737323: 				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('plugins.bundle.activation', () => ctx.slots.register(\n      { name: 'plugins.bundle.activation', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
737324: 				source: "packages/client/ui-plugin-manager/src/client/slot-contract.ts:78"
737325: 			},
737326: 			{
737327: 				key: "plugins.bundle.config",
737328: 				kind: "keyed",
737329: 				scope: "root",
737330: 				summary: "A bundle's own configuration, keyed by the bundle's package name and rendered on the bundle's page between its description and its rows (`view: 'page'` only).",
737331: 				doc: "A bundle's own configuration, keyed by the bundle's package name and\nrendered on the bundle's page between its description and its rows\n(`view: 'page'` only).",
737332: 				registerOptions: [{
737333: 					name: "key",
737334: 					requirement: "required",
737335: 					type: "string",
737336: 					doc: "Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."
737337: 				}],
737338: 				ownerProps: ["/** The view the page asks a configuration entry for. */\nexport interface PluginConfigViewProps {\n  /** `summary` renders the one-liner alone, as text or inline nodes; `page` renders the form with its save control. */\n  readonly view: 'summary' | 'page'\n  /** Host-owned configuration values and write actions for this page's entry. */\n  readonly form?: ConfigPageForm | undefined\n}"],
737339: 				ownerPropsReferences: ["ConfigPageForm"],
737340: 				standardProps: [
737341: 					"useResource: UseResource",
737342: 					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
737343: 					"usePanelInfo: UsePanelInfo",
737344: 					"useSessions: UseSessions",
737345: 					"useSessionStatus: UseSessionStatus",
737346: 					"useSessionRetainInfo: UseSessionRetainInfo",
737347: 					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>"
737348: 				],
737349: 				keyDomain: "open: any string the owner dispatches (no compile-time key set), already taken: @deepseek-ai/dsh-experimental-voice-input-bundle",
737350: 				hookContext: "",
737351: 				slotInject: "",
737352: 				declaredBy: "an entry in 'main' (client-ui-plugin-manager), so it exists while that entry is mounted",
737353: 				occupants: ["experimental-client-ui-voice-input VoicePreparation key '@deepseek-ai/dsh-experimental-voice-input-bundle'"],
737354: 				replaceRisk: "shadows-shipped-ui",
737355: 				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register(\n      { name: 'plugins.bundle.config', key: '<one key the owner dispatches>' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
737356: 				source: "packages/client/ui-plugin-manager/src/client/slot-contract.ts:94"
737357: 			},
737358: 			{
737359: 				key: "plugins.detail.actions",
737360: 				kind: "list",

