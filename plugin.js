import * as patchLib from "./lib/patch-lib.js";
import * as utils from "./lib/utils.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const path = require('path');
const fs = require('fs');


const storage = new Map;

storage.set("INDEX", 1);

console.log(utils.resolveVariables(storage, "{{? (INDEX == 2) 1 2}}"));
// const steps = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'tests/a.djson'), 'utf8'));

// const savePath = path.join(process.cwd(), 'test.json');

/*const output = patchLib.dynamicJson(steps);

const steps = [{
    "type": "VAR",
    "name": "test",
    "value": 2
}];*/


// fs.writeFileSync(savePath,JSON.stringify(output, null, 4) , 'utf8');

/*export default class DynamicJson extends Plugin {

    preload() {
        window.dynamicJson = patchLib.dynamicJson;
    }

    postload() {
        /*$.ajaxSettin

        $.ajaxSetup({
            beforeSend: function() {

            }
        });
    }

    _hookAjax() {
        const _ = $.ajaxSettings.beforeSend;


    }
}**/