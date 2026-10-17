<!-- source: F:\App\DSH\resources\app.asar lines 698240-698560 (bundled DSH source) -->
698240: 				cssVariable: "--dsw-specific-sidebar-fill"
698241: 			}
698242: 		]);
698243: 		/**
698244: 		* Theme registry and preference owner. `light`/`dark` are built in (the base
698245: 		* stylesheets carry both palettes); third-party themes register alias-layer
698246: 		* overrides. Reads go through {@link getTheme}; preference writes only
698247: 		* through {@link setTheme}; continuous sync only through the `theme/change`
698248: 		* event. {@link overrideTokens} stacks partial token layers over the active
698249: 		* theme without touching the registry.
698250: 		* The service holds the `prefers-color-scheme` media query (environment
698251: 		* sensing, not presentation) and re-emits when the OS scheme flips while the
698252: 		* preference is `system`.
698253: 		*/
698254: 		var ThemeRuntime = class {
698255: 			ctx;
698256: 			host;
698257: 			themes = [...BUILTIN_THEMES];
698258: 			preference;
698259: 			fontSize = bootstrapFontSize();
698260: 			revision = 0;
698261: 			snapshot;
698262: 			media;
698263: 			/** Override layers by source; seq (monotonic) is the stacking order. */
698264: 			overrides = /* @__PURE__ */ new Map();
698265: 			overrideSeq = 0;
698266: 			/**
698267: 			* @param ctx - owning context (change events are emitted on it; the
698268: 			* media-query and scope listeners are released through ctx.effect on dispose).
698269: 			* @param host - durable preference scope owned by the same plugin.
698270: 			*/
698271: 			constructor(ctx, host) {
698272: 				this.ctx = ctx;
698273: 				this.host = host;
698274: 				this.preference = DEFAULT_PREFERENCE;
698275: 				this.media = typeof matchMedia === "undefined" ? void 0 : matchMedia("(prefers-color-scheme: dark)");
698276: 				this.snapshot = this.buildSnapshot();
698277: 				if (this.media !== void 0) {
698278: 					const media = this.media;
698279: 					const onChange = () => {
698280: 						if (this.preference !== "system") return;
698281: 						this.publish();
698282: 					};
698283: 					ctx.effect(() => {
698284: 						media.addEventListener("change", onChange);
698285: 						return () => {
698286: 							media.removeEventListener("change", onChange);
698287: 						};
698288: 					}, "ui-theme: prefers-color-scheme listener");
698289: 				}
698290: 				ctx.effect(() => host.subscribe(() => {
698291: 					this.adopt();
698292: 				}), "ui-theme: settings scope adoption");
698293: 				this.adopt();
698294: 			}
698295: 			/**
698296: 			* Read the current immutable theme snapshot.
698297: 			* @returns the current snapshot (stable reference until the next change).
698298: 			*/
698299: 			getTheme() {
698300: 				return this.snapshot;
698301: 			}
698302: 			/**
698303: 			* Export the current token directory without reading DOM or computed styles.
698304: 			* @returns stable JSON-safe token descriptions, including registered and override-only names.
698305: 			*/
698306: 			exportInspectTokens() {
698307: 				const tokens = new Map(BUILTIN_INSPECT_TOKENS.map((token) => [token.name, token]));
698308: 				for (const theme of this.themes) for (const name of Object.keys(theme.tokens)) if (!tokens.has(name)) tokens.set(name, dynamicToken(name));
698309: 				for (const layer of this.overrides.values()) for (const name of Object.keys(layer.tokens)) if (!tokens.has(name)) tokens.set(name, dynamicToken(name));
698310: 				return [...tokens.values()].map((token) => ({ ...token })).sort((left, right) => left.name.localeCompare(right.name));
698311: 			}
698312: 			/**
698313: 			* Switch the theme preference — the only user preference write entry.
698314: 			* Built-in preferences are written through the settings scope and every
698315: 			* accepted value emits `theme/change`.
698316: 			* @param id - a registered theme id or `system`; unknown ids throw.
698317: 			*/
698318: 			setTheme(id) {
698319: 				if (id !== "system" && !this.themes.some((t) => t.id === id)) throw new Error(`theme "${id}" is not registered`);
698320: 				if (this.preference === id) return;
698321: 				this.preference = id;
698322: 				if (isThemePreference(id)) this.host.set(THEME_PREFERENCE_FIELD, id);
698323: 				this.publish();
698324: 			}
698325: 			/**
698326: 			* Change the conversation content font size — the only font-size write
698327: 			* entry. Accepted values are written through the settings scope and emit
698328: 			* `theme/change`.
698329: 			* @param px - integer px within FONT_SIZE_MIN..FONT_SIZE_MAX; out-of-range or fractional values throw.
698330: 			*/
698331: 			setFontSize(px) {
698332: 				if (!Number.isInteger(px) || px < 10 || px > 22) throw new Error(`font size ${px} is outside 10..22`);
698333: 				if (this.fontSize === px) return;
698334: 				this.fontSize = px;
698335: 				this.host.set(FONT_SIZE_FIELD, px);
698336: 				this.publish();
698337: 			}
698338: 			/** Adopt the scope's accepted durable preference without writing it back. */
698339: 			adopt() {
698340: 				const section = this.host.getSnapshot().value;
698341: 				if (section === void 0) return;
698342: 				if (this.preference === section.preference && this.fontSize === section.fontSize) return;
698343: 				this.preference = section.preference;
698344: 				this.fontSize = section.fontSize;
698345: 				this.publish();
698346: 			}
698347: 			/**
698348: 			* Register a theme. Duplicate id throws (single occupant per id; the
698349: 			* built-in pair counts; `system` is a preference, not a registrable id).
698350: 			* @param definition - theme id, colorScheme, and alias-token overrides.
698351: 			* @returns disposer. Disposing the theme backing the active preference
698352: 			* resets the preference to the default so the UI never keeps tokens of an
698353: 			* unregistered theme.
698354: 			*/
698355: 			register(definition) {
698356: 				if (definition.id === "system") throw new Error("\"system\" is a preference, not a registrable theme id");
698357: 				if (this.themes.some((t) => t.id === definition.id)) throw new Error(`theme "${definition.id}" is already registered`);
698358: 				this.themes = [...this.themes, definition];
698359: 				this.publish();
698360: 				return () => {
698361: 					if (!this.themes.some((t) => t.id === definition.id)) return;
698362: 					this.themes = this.themes.filter((t) => t.id !== definition.id);
698363: 					if (this.preference === definition.id) this.preference = DEFAULT_PREFERENCE;
698364: 					this.publish();
698365: 				};
698366: 			}
698367: 			/**
698368: 			* Stack a token override layer on top of the active theme — the token-level
698369: 			* analogue of slot shading: the base theme stays untouched, layers compose
698370: 			* in seq order with later layers winning per-token, and removing a layer
698371: 			* restores whatever it covered. Calling again with the same source replaces
698372: 			* that source's whole layer and restacks it on top (effect re-registration
698373: 			* semantics). Emits `theme/change` with the recomposed snapshot.
698374: 			* @param source - layer identity; one layer per source (dynamic packages
698375: 			* pass their package id — the façade pins it, so it also names the layer's
698376: 			* origin for inspection).
698377: 			* @param tokens - token-name → `{ light, dark }` value pairs. Validated at
698378: 			* runtime (model-authored callers reach this boundary with untyped JS);
698379: 			* a bare string value throws a teaching error.
698380: 			* @returns disposer removing exactly the layer this call created; a no-op
698381: 			* once the source has re-overridden (the newer layer is not torn down).
698382: 			*/
698383: 			overrideTokens(source, tokens) {
698384: 				const layer = {
698385: 					seq: this.overrideSeq++,
698386: 					tokens: validateOverrides(source, tokens)
698387: 				};
698388: 				this.overrides.set(source, layer);
698389: 				this.publish();
698390: 				return () => {
698391: 					if (this.overrides.get(source) !== layer) return;
698392: 					this.overrides.delete(source);
698393: 					this.publish();
698394: 				};
698395: 			}
698396: 			buildSnapshot() {
698397: 				const resolvedId = this.preference === "system" ? this.media?.matches === true ? "dark" : "light" : this.preference;
698398: 				const active = this.themes.find((t) => t.id === resolvedId);
698399: 				/* v8 ignore next 2 -- needs a registry without light/dark, which register()/dispose() cannot produce */
698400: 				if (active === void 0) throw new Error(`theme registry lost "${resolvedId}"`);
698401: 				return Object.freeze({
698402: 					preference: this.preference,
698403: 					fontSize: this.fontSize,
698404: 					active: this.composeActive(active),
698405: 					themes: Object.freeze([...this.themes]),
698406: 					revision: this.revision
698407: 				});
698408: 			}
698409: 			/**
698410: 			* Fold the override layers into the active definition: seq order, later
698411: 			* layers win per-token, each value picked for the active color scheme (the
698412: 			* presenter consumes the composed snapshot and needs no override awareness).
698413: 			* Without layers the registered definition passes through by identity.
698414: 			*/
698415: 			composeActive(active) {
698416: 				if (this.overrides.size === 0) return active;
698417: 				const tokens = { ...active.tokens };
698418: 				for (const layer of [...this.overrides.values()].sort((a, b) => a.seq - b.seq)) for (const [name, modes] of Object.entries(layer.tokens)) tokens[name] = modes[active.colorScheme];
698419: 				return Object.freeze({
698420: 					...active,
698421: 					tokens: Object.freeze(tokens)
698422: 				});
698423: 			}
698424: 			publish() {
698425: 				this.revision += 1;
698426: 				this.snapshot = this.buildSnapshot();
698427: 				this.ctx.emit("theme/change", this.snapshot);
698428: 			}
698429: 		};
698430: 		/**
698431: 		* Read the font size the Host boot script wrote on `body` before any plugin
698432: 		* ran, so the initial snapshot matches first paint and ui-layout's presenter
698433: 		* does not flash the schema default while the settings read is in flight.
698434: 		* Non-browser runs and mounts without the boot script fall back to the
698435: 		* schema default; the durable settings adoption still lands afterwards.
698436: 		*/
698437: 		function bootstrapFontSize() {
698438: 			/* v8 ignore next -- needs a documentless run (node e2e booting the client tree), not constructible under jsdom */
698439: 			if (typeof document === "undefined") return 14;
698440: 			const raw = document.body.style.getPropertyValue("--dsh-content-font-size");
698441: 			const parsed = Number.parseInt(raw, 10);
698442: 			return Number.isInteger(parsed) && parsed >= 10 && parsed <= 22 ? parsed : 14;
698443: 		}
698444: 		/**
698445: 		* Runtime shape check for one override layer (model-authored callers pass
698446: 		* untyped JS through the dynamic-package façade, so the static type cannot
698447: 		* enforce the pair shape there). Returns a defensive per-token copy so later
698448: 		* caller mutation cannot reach the stored layer.
698449: 		*/ function validateOverrides(source, tokens) {
698450: 			const validated = {};
698451: 			for (const [name, value] of Object.entries(tokens)) {
698452: 				if (typeof value === "string") throw new TypeError(`theme override "${name}" from "${source}" is a bare string — pass { light: ${JSON.stringify(value)}, dark: ${JSON.stringify(value)} } (repeat the value when it is the same in both palettes); a single value goes illegible when the user switches color scheme`);
698453: 				if (typeof value !== "object" || value === null || typeof value.light !== "string" || typeof value.dark !== "string") throw new TypeError(`theme override "${name}" from "${source}" must map to a { light, dark } pair of strings — one value per color scheme`);
698454: 				const modes = value;
698455: 				validated[name] = {
698456: 					light: modes.light,
698457: 					dark: modes.dark
698458: 				};
698459: 			}
698460: 			return validated;
698461: 		}
698462: 		function dynamicToken(name) {
698463: 			return {
698464: 				name,
698465: 				description: "Theme token registered by the current Client composition.",
698466: 				valueType: "CSS value",
698467: 				requiresLightAndDark: true,
698468: 				...name.startsWith("--") ? { cssVariable: name } : {}
698469: 			};
698470: 		}
698471: 		/**
698472: 		* Required services: settings transport plus slots/locale for the Appearance
698473: 		* row. `remote` carries the forwarded settings invalidation that
698474: 		* `ctx.configForms.get(entryId)` subscribes to on this context.
698475: 		*/
698476: 		const inject = [
698477: 			"slots",
698478: 			"locale",
698479: 			"remote",
698480: 			"configForms"
698481: 		];
698482: 		/**
698483: 		* Client plugin body: provide the theme service and register the
698484: 		* feature-owned Appearance preference row into the General section's item
698485: 		* slot (a feature owns its settings surface).
698486: 		* @param ctx - client cordis context.
698487: 		*/
698488: 		function apply(ctx) {
698489: 			installThemeStyles(ctx);
698490: 			const theme = new ThemeRuntime(ctx, ctx.configForms.get(THEME_SETTINGS_NAMESPACE));
698491: 			ctx.provide("theme", theme);
698492: 			ctx.effect(() => ctx.locale.register(SETTINGS_NS, {
698493: 				zh,
698494: 				en
698495: 			}), "ui-theme: settings row dictionaries");
698496: 			const store = createAppearanceRowStore();
698497: 			let bound;
698498: 			const fontSizeStore = createFontSizeRowStore();
698499: 			let fontSizeBound;
698500: 			const sync = (snapshot) => {
698501: 				bound?.sync(snapshot.preference, snapshot.revision);
698502: 				fontSizeBound?.sync(snapshot.fontSize, snapshot.revision);
698503: 			};
698504: 			ctx.on("theme/change", sync);
698505: 			const injected = (actions) => {
698506: 				bound = actions;
698507: 				sync(theme.getTheme());
698508: 				return { setTheme: (id) => {
698509: 					theme.setTheme(id);
698510: 				} };
698511: 			};
698512: 			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
698513: 				name: "settings.general.item",
698514: 				id: "appearance",
698515: 				order: 10,
698516: 				store,
698517: 				locale: SETTINGS_NS,
698518: 				inject: injected
698519: 			}, AppearanceRow));
698520: 			const fontSizeInjected = (actions) => {
698521: 				fontSizeBound = actions;
698522: 				sync(theme.getTheme());
698523: 				return { setFontSize: (px) => {
698524: 					theme.setFontSize(px);
698525: 				} };
698526: 			};
698527: 			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
698528: 				name: "settings.general.item",
698529: 				id: "font-size",
698530: 				order: 11,
698531: 				store: fontSizeStore,
698532: 				locale: SETTINGS_NS,
698533: 				inject: fontSizeInjected
698534: 			}, FontSizeRow));
698535: 		}
698536: 		//#endregion
698537: 		exports.SETTINGS_NS = SETTINGS_NS;
698538: 		exports.ThemeRuntime = ThemeRuntime;
698539: 		exports.apply = apply;
698540: 		exports.inject = inject;
698541: 		return module.exports;
698542: 	}
698543: });
698544: 
698545: //# sourceMappingURL=client.js.mapimport z from "@deepseek-ai/schemastery";
698546: //#region lib/types/theme-settings.js
698547: /** Theme preferences stored in the Host user-settings document. */
698548: /** Built-in preferences accepted at the registry and settings boundaries. */
698549: const THEME_PREFERENCES = [
698550: 	"light",
698551: 	"dark",
698552: 	"system"
698553: ];
698554: /** Settings namespace owned by the theme plugin. */
698555: const THEME_SETTINGS_NAMESPACE = "ui-theme";
698556: /** Field carrying the selected built-in theme preference. */
698557: const THEME_PREFERENCE_FIELD = "preference";
698558: /** Field carrying the conversation content font size. */
698559: const FONT_SIZE_FIELD = "fontSize";
698560: /** Default preference when the user-settings document has no override. */

