
import * as utils from "./utils.js";

import * as Types from "./types.js";
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
        storage.set("PATH", "assets/mods/my-mod/");
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

    const blackList = ["BASE", "PATH", "PC", "INDEX", "VALUE"];

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
    let stepPath = step.path;
    if (typeof step.path === "string") {
        stepPath = [stepPath]
    } 
    
    if (!Array.isArray(stepPath)) {
        // must be an array or string
        return;
    }


    for (const path of stepPath) {
        
        if (typeof path !== "string" ||
            !isFinite(path)) {
            // invalid path
            return;
        }

        if (newValue[path] === undefined) {
            newValue = newValue[path] = {};
        } else if (typeof newValue[path] !== "object") {
            // invalid go into
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
    const dataCopy = JSON.parse(JSON.stringify(step.data));
    const data = utils.recursiveResolve(storage, dataCopy);
    const newData = template.replace(data);

    mergeValue[key] = newData;

}

actions.FOR = function(storage, step) {
    
    let count = step.count;
    if (isFinite(count)) {
        count = Number(count);
        for(let i = 0; i < count; i++) {
            storage.set("VALUE", count);
            dynamicJson(step.body, storage);
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

    if (Array.isArray(obj)) {
        for(let i = 0; i < obj.length; i++) {
            storage.set("INDEX",i);
            storage.set("VALUE",obj[i]);
            dynamicJson(step.body, storage);
        }       
    } else {
        for (const key in obj) {
            storage.set("INDEX",key);
            storage.set("VALUE",obj[key]);
            dynamicJson(step.body, storage);
        }
    }
}