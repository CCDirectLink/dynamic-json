function convertFunctionToPromise(callback) {
    let isFunction = false;
    if (callback) {
        if (callback[Symbol.toStringTag] === 'AsyncFunction') {
            isFunction = true;
        } else if (callback.constructor === Function) {
            return async function () {
                return callback.apply(this, arguments);
            };
        }
    }
    if (!isFunction) {
        throw TypeError('callback must be a function type.');
    }

    return callback;
}


function replaceTemplateStringWithValue(str, values) {
    let finishedStr = '';
    let count = 0;
    while (true) {
        let index = str.indexOf("*");
        if (index > -1) {
            finishedStr += str.substring(0, index);
            if (values[count] !== undefined) {
                finishedStr += values[count];
            }
            count++;
            str = str.substring(index + 1);
        } else {
            finishedStr += str;
            break;
        }
    }
    return finishedStr;
}

export default class DynamicJson {


    constructor() {
        this.exact = new Map;
        this.regex = new Map;
    }

    forExactUrl(url, callback) {
        if (!url || url.constructor !== String) {
            throw TypeError('url must be a String type.');
        }
        this.exact.set(url, convertFunctionToPromise(callback));
    }

    forTemplateUrl(template, replacements, callback) {
        for (const replacement of replacements) {
            const exactUrl = replaceTemplateStringWithValue(template, replacement);
            this.forExactUrl(exactUrl, async function() {
                return callback.apply(this, replacement);
            });
        }
    }

    forRegExpUrl(url, callback) {
        if (!url || url.constructor !== RegExp) {
            throw TypeError('url must be a RegExp type.');
        }
        if (!url.global) {
            url = new RegExp(url.source, url.flags + 'g');
        }

        for (const [regex, _] of this.regex) {
            if (url.source === regex.source) {
                url = regex;
                break;
            }
        }

        this.regex.set(url, convertFunctionToPromise(callback));
    }


    /**
     * 
     * @param {string} url to check against
     * @param {function} onSuccess 
     * @param {function} onError 
     * @returns {boolean} true if successfully handled request, false otherwise
     */

    handleRequest(url, onSuccess, onError) {
        if (this.exact.has(url)) {
            const generator = this.exact.get(url);
            generator().then(onSuccess, onError);
            return true;
        }

        for (const [regexUrl, generator] of this.regex) {
            const matchResults = Array.from(url.matchAll(regexUrl));
            if (matchResults.length) {
                generator(...matchResults[0].splice(1)).then(onSuccess, onError);
                return true;
            }
        }

        return false;
    }

}