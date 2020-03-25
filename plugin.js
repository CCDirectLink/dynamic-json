export default class DynamicJson extends Plugin {
	constructor(mod) {
		super();
		this.mod = mod;
		this.intercept = {};
	}

	async preload() {
		window.registerIntercept = function(url, cb) {
			this.intercept[url] = cb;
		}
		this.intercept["a.json"] = function() {
			return {
				a: 2
			};
		}
	}

	async postload() {

	}

	async prestart() {

	}
}
