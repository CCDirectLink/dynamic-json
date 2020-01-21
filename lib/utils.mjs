import * as Types from "./types.mjs";
const {CustomArray, CustomNumber, Template, Base } = Types;

/**
 * 
 * @param {Map} storage 
 * @param {string} str 
 */


export {resolveVariables, recursiveResolve};

function resolveVariables(storage, str) {

    const forceResolveType = str.trim().match(/^{{!(\w+)}}$/);
    if (forceResolveType !== null) {
        const varName = forceResolveType[1];
        if (storage.has(varName)) {
            const variable = storage.get(varName);
           
            if (variable.getValue) {
                return variable.getValue();
            }
            return variable;
            
        }    
    }

    return str.replace(/{{(\w+)}}/g, function(match, variable) {
        if (storage.has(variable)) {
            return storage.get(variable).toString();
        }
        return match;
    });
}

function recursiveResolve(storage, data) {
    if (Array.isArray(data)) {
        for (let index = 0; index < data.length; index++) {
            data[index] = recursiveResolve(storage, data[index]);
        }
    } else if (typeof data === "object") {
        for (const prop in data) {
            data[prop] = recursiveResolve(storage, data[prop]);
        }
    } else if (typeof data === "string") {
        return resolveVariables(storage, data);
    }
    return data;
}

export function TypeFactory(typeName, value) {
    switch (typeName) {
        case "array":
            return new CustomArray(value);
        case "number":
            return new CustomNumber(value);
        case "template":
            return new Template(value);
    }
    return new Base(value);
}