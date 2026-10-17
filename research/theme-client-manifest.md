<!-- source: F:\App\DSH\resources\app.asar lines 734030-734060 (bundled DSH source) -->
734030: 		/**
734031: 		* Page-side run orchestration for model approvals and direct panel gestures.
734032: 		* Host activation always precedes Client loading. The same Plugin-keyed state
734033: 		* drives every surface, so remounting a panel never loses an open approval or
734034: 		* an in-flight transition.
734035: 		*/
734036: 		/** Drives Host → Client activation and publishes Plugin-keyed activity. */
734037: 		var CordisRunOrchestrator = class {
734038: 			env;
734039: 			requests = /* @__PURE__ */ new Map();
734040: 			activity = /* @__PURE__ */ new Map();
734041: 			failures = /* @__PURE__ */ new Map();
734042: 			inFlight = /* @__PURE__ */ new Map();
734043: 			listeners = /* @__PURE__ */ new Set();
734044: 			activityCache;
734045: 			failureCache;
734046: 			/** @param env - Client loader and folded Host operations. */
734047: 			constructor(env) {
734048: 				this.env = env;
734049: 			}
734050: 			/** Open approvals and current activation attempts, keyed by stable Plugin ID. */
734051: 			activeRuns = {
734052: 				getSnapshot: () => this.activityCache ??= new Map(this.activity),
734053: 				subscribe: (fn) => this.observe(fn)
734054: 			};
734055: 			/** Latest page-side activation failure for each Plugin. */
734056: 			lastRunError = {
734057: 				getSnapshot: () => this.failureCache ??= new Map(this.failures),
734058: 				subscribe: (fn) => this.observe(fn)
734059: 			};
734060: 			/**

