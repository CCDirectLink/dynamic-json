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

				const onSuccess = settings.success || (() => { });
				const onError = settings.error || (() => { });
				const originalUrl = settings.url;
				const generators = getGenerators(settings.url);
				if (generators.length) {

					settings.success = (data) => {
						if (settings.url !== originalUrl) {
							console.warn(`"${settings.url}" is acting as "${originalUrl}". Things may break.`);
						}

						djson.handleRequest(data).then(newValue => {
							onSuccess.apply(settings.context, newValue);
						});
					};
	
					settings.error = (error) => {
						// generators have the ability to make
						// new json files without touching the file system
						// should try patching anyway
						djson.handleRequest(null).then(newValue => {
							if (newValue == null) {
								onError.apply(settings.context, [error]);
								return;
							}
							onSuccess.apply(settings.context, [newValue]);
						});
					};
				}
				

				return oldBeforeSend.apply(this, arguments);
			}
		});

	}

}
