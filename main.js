import DynamicJson from './dynamic-json.js';
const djson = new DynamicJson;
export default class Main {
	constructor(mod) {
		this.mod = mod;
	}

	async preload() {
		window.DynamicJson = djson;
        for (const [name, mod] of modloader.loadedMods) {
            try {
                await mod.executeStage('registerDynamicJsonGenerators');
            } catch (e) {
                console.log('Mod', e, 'failed');
                console.log(e.toString());
            }
		}
		window.DynamicJson = undefined;
	}

	async postload() {
		const oldBeforeSend = $.ajaxSettings.beforeSend || (() => { });
		$.ajaxSetup({
			beforeSend: function (jqXHR, settings) {
				if (settings.dataType !== 'json' || settings.type !== 'GET') {
					return true;
				}

				settings.success = settings.success || (() => { });
				settings.error = settings.error || (() => { });

				const onSuccess = (data) => {
					settings.success.apply(settings.context, [data]);
				};

				const onError = (error) => {
					settings.error.apply(settings.context, [error]);
				};

				if (djson.handleRequest(settings.url, onSuccess, onError)) {
					return false;
				}

				return oldBeforeSend.apply(this, arguments);
			}
		});

	}

}
