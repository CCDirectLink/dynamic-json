import * as Types from "./types.js";
const {CustomArray, CustomNumber, Template, Base } = Types;

/**
 * 
 * @param {Map} storage 
 * @param {string} str 
 */


export {resolveVariables, recursiveResolve};

function getVariableValue(storage, varName) {
    if (storage.has(varName)) {
        const variable = storage.get(varName);
        if (variable.getValue) {
            return variable.getValue();
        }
        return variable;
    }
    return varName;
}


function evalCondition(storage, condition) {
    // a == b
    const isCondition = /(\d+|\w+)\s*(>|>=|==|<=|<)\s*(\d+|\w+)/;
    const result = isCondition.exec(condition);
    if (result !== null) {
        const [leftHand, sign, rightHand] = result;

        if (!sign) {
            // must have sign
            return false;
        }

        if (!storage.has(leftHand)) {
            return false;
        }

        const lVar = storage.get(leftHand);
        const rightValue = getVariableValue(storage, rightHand);
        return lVar.eval(sign, rightValue);
    }

    return true;
}

function resolveVariables(storage, str) {
    
    const regexp = /\s*{{\s*([^\{\}]+)\s*}}\s*/;
    const forceConversion = /\s*!\s*([\w]+)\s*/;
    const valueRegExp = /\s*([\w]+)\s*/;
    const conditionalExp = /\s*?\s*\(([^\)\(]+)\)\s*([\w]+)\s*([\w]+)\s*/;
    let currentStr = "";
    let match;
    while ((match = regexp.exec(str)) !== null) {
        const templateBody = match[1];

        let matchBody = forceConversion.exec(templateBody);
        
        let value = "";

        if (matchBody !== null) {
            console.log("A!");
            value = getVariableValue(storage, matchBody[1]);
            if (match.index === 0) {
                return value;
            }
         } else if ((matchBody = conditionalExp.exec(templateBody)) !== null) {
            const [_, condition, ifTrue, ifFalse] = matchBody;
            if (evalCondition(condition)) {
                value = getVariableValue(storage, ifTrue);
            } else {
                value = getVariableValue(storage, ifFalse);
            }            
        } else if ((matchBody = valueRegExp.exec(templateBody)) !== null) {
            console.log("C!");
            value = getVariableValue(storage, matchBody[1]);
        }  else {
            console.log("D!");
            currentStr += match[0];
            str = str.substring(match[0].length);
            continue;
        }

        console.log("Uh..");
        currentStr += match[0].replace(`{{${match[1]}}}`, value);
        str = str.substring(match[0].length);
    }

    return currentStr;
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

    if (typeName === undefined) {
        typeName = typeof value;
    }

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