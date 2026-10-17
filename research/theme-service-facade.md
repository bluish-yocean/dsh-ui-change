<!-- source: F:\App\DSH\resources\app.asar lines 732895-732945 (bundled DSH source) -->
732895: export { ConfigEditor, ConfigEditor as default };
732896: {
732897:   "name": "@deepseek-ai/dsh-config-editor",
732898:   "description": "Persist plugin configuration through profile patches and Loader reconciliation",
732899:   "version": "0.2.0-rc.2",
732900:   "publishConfig": {
732901:     "access": "public"
732902:   },
732903:   "repository": {
732904:     "type": "git",
732905:     "url": "git+https://github.com/deepseek-ai/deepseek-harness.git",
732906:     "directory": "packages/boot/config-editor"
732907:   },
732908:   "type": "module",
732909:   "main": "lib/index.js",
732910:   "types": "lib/types/index.d.ts",
732911:   "exports": {
732912:     ".": {
732913:       "types": "./lib/types/index.d.ts",
732914:       "default": "./lib/index.js"
732915:     },
732916:     "./src/*": "./src/*",
732917:     "./package.json": "./package.json"
732918:   },
732919:   "files": [
732920:     "lib/index.js",
732921:     "lib/types/**/*.d.ts"
732922:   ],
732923:   "license": "MIT",
732924:   "peerDependencies": {
732925:     "@deepseek-ai/cordis": "~4.0.4",
732926:     "@deepseek-ai/dsh-hmr": "0.2.0-rc.2",
732927:     "@deepseek-ai/cordis-plugin-loader": "~1.0.5",
732928:     "@deepseek-ai/cordis-plugin-include": "~1.0.9",
732929:     "@deepseek-ai/dsh-app-boot": "0.2.0-rc.2"
732930:   },
732931:   "dependencies": {
732932:     "yaml": "^2.8.1",
732933:     "js-yaml": "^4.1.0",
732934:     "@deepseek-ai/dsh-atomic-write": "0.2.0-rc.2"
732935:   },
732936:   "devDependencies": {
732937:     "@types/js-yaml": "^4.0.9",
732938:     "@deepseek-ai/cordis": "~4.0.4",
732939:     "@deepseek-ai/dsh-app-boot": "0.2.0-rc.2",
732940:     "@deepseek-ai/cordis-plugin-include": "~1.0.9",
732941:     "@deepseek-ai/cordis-plugin-loader": "~1.0.5",
732942:     "@deepseek-ai/dsh-hmr": "0.2.0-rc.2"
732943:   },
732944:   "peerDependenciesMeta": {
732945:     "@deepseek-ai/dsh-hmr": {

