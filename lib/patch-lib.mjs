
import * as utils from "./utils.mjs";

import * as Types from "./types.mjs";
const {Template} = Types;


export {dynamicJson};

function dynamicJson(steps, storage = null) {
    
    if (storage === null) {
        storage = new Map();
        const value = {};
        storage.set("BASE", value);
        storage.set("PC", [{
            parent: null,
            value
        }]);
        storage.set("PATH", "/");
    }


    for (const step of steps) {
        const type = step.type;
        if (actions[type]) {
            actions[type](storage, step);
        }
    }
    return storage.get("BASE");
}


const actions = {};

actions.BASE = function(storage, step) {
    storage.set("BASE", step.data);
}

actions.TEMPLATE = function(storage, step) {
    const copy = JSON.parse(JSON.stringify(step.data));
    const newCopy = utils.recursiveResolve(storage, copy);
    actions.VAR(storage, {
        name: step.name,
        op: "s",
        varType: "template",
        value: newCopy
    });
}

actions.VAR = function(storage, step) {
    const name = step.name;
    const op = step.op || "s";

    const blackList = ["BASE", "PATH", "PC", "INDEX"];

    if (blackList.some(bad => bad === name.trim())) {
        // error forbidden
        console.error('Forbidden variable used!');
        return;
    }

    switch (op) {
        case "set", "s": {
            const newVar = utils.TypeFactory(step.varType, step.value);
            storage.set(name, newVar);
            break;
        }
        default: {
            if (!storage.has(name)) {
                console.log(`${name} is not a variable.`);
                return;
            }
            const variable = storage.get(name);

            variable.do(op, step.value);
            break;
        }
    }
}

actions.GO = function(storage, step) {
    // broken down into parent and value
    const pc = storage.get("PC");

    const baseValue = pc[pc.length - 1].value;
    
    let newValue = baseValue;
    for (const path of step.path) {
        
        if (newValue[path] === undefined) {
            newValue = newValue[path] = {};
        } else if (typeof newValue[path] !== "object") {
            return; 
        } else {
            newValue = newValue[path];
        }
    }

    pc.push({
        parent: baseValue,
        value: newValue
    });
}

actions.RETURN = function(storage) {
    const pc = storage.get("PC");
    if (pc.length === 1) {
        // not supported
        return;
    }
    pc.pop();
}

actions.USE = function(storage, step) {
    const pc = storage.get("PC");
    const mergeValue = pc[pc.length - 1].value;

    const templateName = step.template;

    const template = storage.get(templateName);


    if (!template instanceof Template) {
        // throw error invalid template
        return;
    }

    let key = step.in; 
    if (typeof key === "string") {
        key = utils.recursiveResolve(storage, key);
    } 

    if (typeof key !== "string" && typeof key !== "number") {
        // throw error key not supported
        return;
    }
    const data = utils.recursiveResolve(storage, step.data);
    const newData = template.replace(data);

    mergeValue[key] = newData;

}

actions.FOR = function(storage, step) {
    
    let count = step.count;
    if (isFinite(count)) {
        count = Number(count);
        while (count > 0) {
            dynamicJson(step.body, storage);
            count--;
        }
        return;
    }


    const _in = step.in;

    let obj = null;
    if (typeof _in === "string") {
        obj = utils.resolveVariables(storage, `{{!${_in}}}`);
        if (typeof obj === "string") {
            // throw error not a valid variable
            return;
        }
    } else {
        obj = _in;
    }

    if (!obj || !obj[Symbol.iterator]) {
        // throw error not iterable
        return;
    }

    for (const key in obj) {
        storage.set("INDEX",obj[key]);
        dynamicJson(step.body, storage);
    }



}