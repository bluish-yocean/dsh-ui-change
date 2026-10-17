<!-- source: F:\App\DSH\resources\app.asar lines 737000-737080 (bundled DSH source) -->
737000: 					"useSessionRetainInfo: UseSessionRetainInfo",
737001: 					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
737002: 					"useChat: UseChat",
737003: 					"useConversation: UseConversation",
737004: 					"useInput: SnapshotSelectorHook<InputState>",
737005: 					"inputActions: InputActions",
737006: 					"useSession: SessionSnapshotSelector",
737007: 					"sessionId: SessionId",
737008: 					"useProjection: UseProjection",
737009: 					"useTrajectory: UseTrajectory"
737010: 				],
737011: 				keyDomain: "",
737012: 				hookContext: "",
737013: 				slotInject: "",
737014: 				declaredBy: "an entry in 'conversation.session.header' (client-ui-conversation), so it exists while that entry is mounted",
737015: 				occupants: [
737016: 					"client-ui-open-in-app SessionOpenInAppAction id 'open-in-app'",
737017: 					"client-ui-schedule ScheduleCatalogAction id 'schedule-catalog'",
737018: 					"session-log-export SessionLogDownloadHeaderAction id 'session-log-download'"
737019: 				],
737020: 				replaceRisk: "none",
737021: 				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register(\n      { name: 'conversation.session.header.utilities', id: 'my-entry', order: 100, label: 'My entry' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
737022: 				source: "packages/client/ui-conversation/src/client/contract/slots.ts:162"
737023: 			},
737024: 			{
737025: 				key: "conversation.trajectory.images",
737026: 				kind: "single",
737027: 				scope: "session",
737028: 				summary: "Renderer for one group of durable record images in the Trajectory ledger.",
737029: 				doc: "Renderer for one group of durable record images in the Trajectory\nledger. The owner supplies image references, an authorized loader, and\nalignment. A registration replaces the shipped gallery; without one,\nimages are omitted.",
737030: 				registerOptions: [],
737031: 				ownerProps: ["/** Message image group handed to the optional attachment presentation plugin. */\nexport interface MessageImagesOwnerProps {\n  /** Durable references or submission-echo previews in source order. */\n  images: readonly MessageImageSource[]\n  /** Session-authorized image URL loader for the durable arm. */\n  loadImage: MessageImageLoader\n  /** Horizontal placement inside the owning record. */\n  align: 'start' | 'end'\n  /** Force every image into the compact message-attachment tile size. */\n  compact?: boolean\n  /** Fixed, uncropped thumbnail for an attachment list row. */\n  thumbnail?: boolean\n}"],
737032: 				ownerPropsReferences: [
737033: 					"Message",
737034: 					"MessageImageLoader",
737035: 					"MessageImageSource"
737036: 				],
737037: 				standardProps: [
737038: 					"useResource: UseResource",
737039: 					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
737040: 					"usePanelInfo: UsePanelInfo",
737041: 					"useSessions: UseSessions",
737042: 					"useSessionStatus: UseSessionStatus",
737043: 					"useSessionRetainInfo: UseSessionRetainInfo",
737044: 					"useWorkspaces: SnapshotSelectorHook<WorkspaceSnapshot>",
737045: 					"useChat: UseChat",
737046: 					"useConversation: UseConversation",
737047: 					"useInput: SnapshotSelectorHook<InputState>",
737048: 					"inputActions: InputActions",
737049: 					"useSession: SessionSnapshotSelector",
737050: 					"sessionId: SessionId",
737051: 					"useProjection: UseProjection",
737052: 					"useTrajectory: UseTrajectory"
737053: 				],
737054: 				keyDomain: "",
737055: 				hookContext: "",
737056: 				slotInject: "",
737057: 				declaredBy: "an entry in 'conversation.view' (client-ui-trajectory), so it exists while that entry is mounted",
737058: 				occupants: ["client-ui-attachment MessageImages"],
737059: 				replaceRisk: "shadows-shipped-ui",
737060: 				example: "return {\n  inject: ['slots'],\n  apply(ctx) {\n    ctx.slots.inject('conversation.trajectory.images', () => ctx.slots.register(\n      { name: 'conversation.trajectory.images' },\n      () => React.createElement('div', null, 'hello'),\n    ))\n  },\n}",
737061: 				source: "packages/client/ui-trajectory/src/client/trajectory-contract.ts:98"
737062: 			},
737063: 			{
737064: 				key: "conversation.view",
737065: 				kind: "list",
737066: 				scope: "session",
737067: 				summary: "Registered Conversation target Views, rendered one at a time.",
737068: 				doc: "Registered Conversation target Views, rendered one at a time.",
737069: 				registerOptions: [
737070: 					{
737071: 						name: "id",
737072: 						requirement: "required",
737073: 						type: "string",
737074: 						doc: "Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."
737075: 					},
737076: 					{
737077: 						name: "order",
737078: 						requirement: "optional",
737079: 						type: "number",
737080: 						doc: "Position among the entries, ascending (default 0)."

