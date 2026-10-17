<!-- source: F:\App\DSH\resources\app.asar lines 485490-485560 (bundled DSH source) -->
485490: 		/** Services used by the browser companion. */
485491: 		const inject = [
485492: 			"slots",
485493: 			"locale",
485494: 			"configForms"
485495: 		];
485496: 		/**
485497: 		* Register the preference while its Host configuration is available.
485498: 		* @param ctx - browser plugin context.
485499: 		*/
485500: 		function apply(ctx) {
485501: 			const locale = "settings.sessionLog";
485502: 			const namespace = "session-log-deepseek";
485503: 			ctx.effect(() => ctx.locale.register(locale, {
485504: 				en,
485505: 				zh
485506: 			}));
485507: 			const form = ctx.configForms.get(namespace);
485508: 			const preference = new UploadPreference(form);
485509: 			const face = () => ({
485510: 				hooks: {
485511: 					upload: form,
485512: 					mutation: preference.state
485513: 				},
485514: 				setEnabled: (enabled) => preference.setEnabled(enabled),
485515: 				dismiss: () => {
485516: 					preference.dismiss();
485517: 				}
485518: 			});
485519: 			ctx.effect(() => ctx.configForms.whileServed([namespace], () => ctx.slots.inject("settings.general.item", () => ctx.slots.register({
485520: 				name: "settings.general.item",
485521: 				id: namespace,
485522: 				order: 90,
485523: 				locale,
485524: 				inject: face
485525: 			}, UploadRow))));
485526: 			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
485527: 				name: "shell.overlay",
485528: 				id: "session-log-upload-toast",
485529: 				locale,
485530: 				inject: face
485531: 			}, UploadToast));
485532: 		}
485533: 		//#endregion
485534: 		exports.apply = apply;
485535: 		exports.inject = inject;
485536: 		return module.exports;
485537: 	}
485538: });
485539: 
485540: //# sourceMappingURL=client.js.map//#region lib/types/index.js
485541: /** Browser companion for the Session-log upload preference. */
485542: /** Mount the browser entry through the Loader. */
485543: function apply() {}
485544: //#endregion
485545: export { apply };
485546: {
485547:   "name": "@deepseek-ai/dsh-client-ui-settings-session-log",
485548:   "description": "General settings control for Session-log upload with DeepSeek API requests",
485549:   "version": "0.2.0-rc.2",
485550:   "publishConfig": {
485551:     "access": "public"
485552:   },
485553:   "repository": {
485554:     "type": "git",
485555:     "url": "git+https://github.com/deepseek-ai/deepseek-harness.git",
485556:     "directory": "packages/client/ui-settings-session-log"
485557:   },
485558:   "type": "module",
485559:   "main": "lib/index.js",
485560:   "types": "lib/types/index.d.ts",

