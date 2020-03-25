import RequestInterceptor from "./request-interceptor.js";

export default class DynamicJson extends Plugin {
	constructor(mod) {
		super();
		this.mod = mod;

	}

	async preload() {
		window.requestInterceptor  = new RequestInterceptor;
		requestInterceptor.registerIntercept("a.json", function() {
			return {
				a: parseInt(Math.random() * 3) + 1
			};
		});
	}

	async postload() {

	}

	async prestart() {

	}
}
