import DynamicJson from './dynamic-json.js';
const djson = new DynamicJson;



function loadStage(url, isModule) {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.onload = () => resolve();
		script.onerror = () => reject();
		script.type = isModule ? 'module' : 'text/javascript';
		script.src = url;
		document.head.appendChild(script);
	});
}

async function getMods() {
	if (typeof modloader === 'object' && typeof modloader.loadedMods === 'object') {
		return modloader.loadedMods;
	}

	const mods = new Map;
	// This is ccloader
	if (window.activeMods) {
		for (const activeMod of window.activeMods) {
			// if they do not have a valid ccmod.json then skip them
			let manifest;
			try {
				manifest = await fetch('/' + activeMod.baseDirectory + 'ccmod.json').then(e => e.json());
			} catch (e) {
				continue;
			}

			activeMod.executeStage = async (name) => {
				const stageValue = manifest[name];
				if (typeof stageValue  === 'string') {
					await loadStage('/' + activeMod.baseDirectory + stageValue, activeMod.module);
				}
			};

			mods.set(activeMod.name, activeMod);
		}
	}

	return mods;
}


export default class Main {
	constructor(mod) {
		this.mod = mod;
	}

	async preload() {
		window.DynamicJson = djson;
		const mods = await getMods();
		for (const [name, mod] of mods) {
			try {
				await mod.executeStage('registerDynamicJsonGenerators');
			} catch (e) {
				console.log(`[${name}] An error occured:\n${e.toString()}`);
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
				const generators = djson.getGenerators(settings.url);
				if (generators.length) {

					settings.success = (data) => {
						if (settings.url !== originalUrl) {
							console.warn(`"${settings.url}" is acting as "${originalUrl}". Things may break.`);
						}

						djson.handleRequest(generators, data, settings).then(newValue => {
							onSuccess.apply(settings.context, [newValue]);
						});
					};
	
					settings.error = (error) => {
						// generators have the ability to make
						// new json files without touching the file system
						// should try patching anyway
						djson.handleRequest(generators, null, settings).then(newValue => {
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
