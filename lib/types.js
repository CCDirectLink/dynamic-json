
export const ErrorType = {
    SUCCESS: 0,
    FAIL: 1,
    NOT_SUPPORTED: 2
};

export class Base {
    constructor(value) {
        this.value = value;
    }

    do(op, value) {
        switch (op) {
            case "add": {
                return this.add(value);
            }
            case "remove": {
                return this.remove(value);
            }
            case "mult": {
                return this.multiply(value);
            }
            case "div": {
                return this.divide(value);
            }
            default:
                break;
        }
        return ErrorType.NOT_SUPPORTED;
    }

    add() {
        return ErrorType.NOT_SUPPORTED;
    }

    remove() {
        return ErrorType.NOT_SUPPORTED;
    }

    multiply() {
        return ErrorType.NOT_SUPPORTED;
    }

    divide() {
        return ErrorType.NOT_SUPPORTED;
    }

    

    eval(op, value) {
        switch(op) {
            case ">": {
                return this.greaterThan(value);
            }
            case ">=": {
                return this.greaterThan(value) || this.equals(value);
            }
            case "==": {
                return this.equals(value);
            }
            case "<=": {
                return this.lessThan(value) || this.equals(value);
            }
            case "<": {
                return this.lessThan(value);
            }
            default:
                break;
        }
        return ErrorType.NOT_SUPPORTED;
    }


    equals() {
        return ErrorType.NOT_SUPPORTED;
    }

    
    greaterThan() {
        return ErrorType.NOT_SUPPORTED;
    }

    lessThan() {
        return ErrorType.NOT_SUPPORTED;
    }
        
    getValue() {
        return this.value;
    }

    toString() {
        return this.value.toString();
    }
}

export class CustomArray extends Base {

    constructor(value = []) {
        super(value);
    }

    add(value) {
        this.value.push(value);
        return ErrorType.SUCCESS;
    }

    remove(value) {
        if (value <= 0 || this.value.length <= value) {
            return ErrorType.FAIL;
        }
        this.value.splice(value, 1);
        return ErrorType.SUCCESS;
    }

}


export class CustomNumber extends Base {
    
    constructor(value) {
        super(value);

        if (!isFinite(value)) {
            this.value = 0;
        } else if (typeof this.value === "string") {
            this.value = Number(this.value);
        }
    }

    add(value) {
        if (!isFinite(value)) {
            return ErrorType.FAIL; 
        }

        this.value += value;

        return ErrorType.SUCCESS;
    }

    remove(value) {
        if (!isFinite(value)) {
            return ErrorType.FAIL; 
        }
        this.value -= value;
        return ErrorType.SUCCESS;
    }

    multiply(value) {
        if (!isFinite(value)) {
            return ErrorType.FAIL; 
        }
        this.value *= value;
        return ErrorType.SUCCESS;
    }

    divide(value) {
        if (!isFinite(value)) {
            return ErrorType.FAIL; 
        }
        this.value /= value;
        return ErrorType.SUCCESS;
    }

    greaterThan(value) {
        return this.value > value;
    }

    lessThan(value) {
        return this.value < value;
    }

    equals(value) {
        return this.value === value;
    }

}

export class Template extends Base {
    replace(obj) {
        const copy = JSON.parse(JSON.stringify(this.value));
        return this._recursiveReplace(copy, obj);
    }

    _recursiveReplace(copy, obj) {
        if (typeof copy === typeof obj) {
            if (typeof copy === "object") {
                if (Array.isArray(copy) && Array.isArray(obj)) {
                    copy.splice(0);
                    copy.push(...obj);
                } else {
                    for (const prop in obj) {
                        copy[prop] = this._recursiveReplace(copy[prop], obj[prop]);
                    }
                }
            } else {
                return obj;   
            }   
        }
        return copy;       
    }
}
