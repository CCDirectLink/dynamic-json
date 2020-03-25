export default class RequestInterceptor {
    constructor() {
        this.intercept = {};
    }

    registerIntercept(url, cb) {
        this.intercept[url] = cb;
    }

    async onRequest(url) {
        if (url.endsWith("a.json")) {
            return this.intercept["a.json"]();
        }
    }
}