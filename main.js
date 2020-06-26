import DynamicJson from './dynamic-json.js';

export default class Main {
	constructor(mod) {
		this.mod = mod;
		this.djson = new DynamicJson;
	}

	async preload() {
		window.DynamicJson = this.djson;
	}

	async postload() {
		const djson = this.djson;
		const oldBeforeSend = $.ajaxSettings.beforeSend || () => { };
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
