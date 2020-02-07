/*import * as patchLib from "./js/patch-lib.js";
import * as utils from "./js/utils.js";*/

const {grammar} = require('ohm-js');

const actions = require('./actions/actions.js');
const fs = require('fs');
const path = require('path');

const lang = fs.readFileSync(path.join(__dirname, 'grammar', 'djson.ohm'), 'utf8')

const myGrammar = grammar(lang);
const myInterpreter = myGrammar.createSemantics().addOperation('interpret', actions)
const code = `
["abcd" true];
[[A 3], [A 3]];
`;
const match = myGrammar.match(code);

if (match.succeeded()) {
    console.log(myInterpreter(match).interpret())

} else {
    console.error(match.message);
}