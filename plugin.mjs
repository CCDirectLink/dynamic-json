import * as patchLib from "./lib/patch-lib.mjs";

const steps = [{
    "type": "TEMPLATE",
    "name": "sheet",
    "data": {
        "src": "{{PATH}}patches/media/effects/pentafist-punch.png",
        "xCount": 5,
        "offX": 0,
        "offY": 0,
        "width": 40,
        "height": 32
    }
}, {
    "type": "VAR",
    "varType": "number",
    "name": "offX"
},{
    "type": "VAR",
    "name": "namedSheets",
    "value": ["a", "b"]
},{
    "type": "GO",
    "path": ["FACEANIMS", "namedSheets"]
}, {
    "type": "FOR",
    "in": "namedSheets",
    "body": [{
        "type": "USE",
        "in": "{{!INDEX}}",
        "template": "sheet",
        "data" : {
            "offX": "{{!offX}}"
        }
    }, {
        "type": "VAR",
        "op": "add",
        "name": "offX",
        "value": 200
    }]
}, {
    "type": "RETURN"
}];


console.log(patchLib.dynamicJson(steps));

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