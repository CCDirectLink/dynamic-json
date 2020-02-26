class Obj {
    constructor() {
        this.pairs = new Map;
    }

    set(pair) {
        console.log(pair);
        this.pairs.set(pair.getId(), pair);
    }

    get(name) {
        let id;
        if (name instanceof Literal) {
            id = name.get();
        } else {
            id = name.id;
        }
       
        const value = this.pairs.get(id);
        if (value) {
            return value.value;
        }

        return undefined;
    }
}

class ObjKeyPair {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }

    getId() {
        console.log('getId', this.key);
        return this.key.getId();
    }

    set(value) {
        this.value = value;
    }

    get() {
        this.value = value;
    }
}

class Scope {
    constructor(name, parent = null) {
        this.name = name;
        this.vars = new Map;
        this.parent = parent;
    }

    setVar(id) {
        this.vars.set(id.id, id);
    }

    getVar(id) {
        if (id instanceof Identifier) {
            id = id.getId();
        }
        if (!this.vars.has(id)) {
            if (this.parent === null) {
                throw Error(`${id} is not.`);
            }
            return this.parent.getVar(id);
        }
        return this.vars.get(id);
    }

    hasVar(id) {
        return this.vars.has(id);
    }
}

class Identifier {
    constructor(id, value) {
        this.id = id;
        this.value = value;
    }

    set(value) {
        this.value = value;
    }


    getId() {
        return this.id;
    }

    get() {
        return this.value;
    }
}

class Literal {
    constructor(value) {
        this.value = value;
    }

    set(value) {
        this.value = value;
    }

    clone() {
        return new Literal(this.value);
    }

    get() {
        return this.value;
    }
}

class Arr {
    constructor(values) {
        this.values = values;
    }
    get(index) {
        return this.values[index];
    }
}


class Tuple {
    constructor(id, value) {
        this.id = id;
        this.value = value;
    }

    get() {
        return this;
    }

}

function getSourceString(...types) {
    let str = "";
    for (const type of types) {
        const source = type.source;
        str += source.sourceString.substring(source.startIdx, source.endIdx);
    }
    return str;
}

const globalScope = new Scope;
const TRUE = new Literal(true);
const FALSE = new Literal(false);

module.exports = {
    Program: function(statements) {
        const ranStatements = statements.interpret();
        return ranStatements[ranStatements.length - 1];
    },
    Statement: function(statement, _) {
        return statement.interpret();
    },
    Exp: function(value) {
        const expValue = value.interpret();

        if (expValue instanceof Identifier) {
            return expValue.get();
        }
        return expValue;
    },

    Assignment: function(lhs,_, rhs) {
        const id = lhs.interpret();
        let value = rhs.interpret();
        console.log(id);
        id.set(value);
        
        globalScope.setVar(id);

        return value;
    },
    Lhs: function(lhs) {
        return lhs.interpret();
    },
    identifier: function(id) {
        const name = getSourceString(id);
        if (globalScope.hasVar(name)) {
            return globalScope.getVar(name); 
        }
        
        return new Identifier(name, 0);
    },
    literal: function(a) {        
        return a.interpret();
    },
    number: function(a, _ ,b) {
        const num = getSourceString(a, _, b);
        return new Literal(Number(num));
    },

    string: function(_, str, _) {
        const value = getSourceString(str);
        return new Literal(value);
    },
    tuple: function (_, id, _, value, _) {
        const lVal = id.interpret();
        const rVal = value.interpret();
        return new Tuple(lVal, rVal);
    },
    boolean: function(boolVal) {
        const value = getSourceString(boolVal);
        if (value === "true") {
            return TRUE;
        }
        return FALSE;
    },
    Arr: function(_, b, _) {
        return new Arr(b.interpret());
    },
    Obj: function(_, b, _) {
        const object = new Obj;
        for (const pair of b.interpret()) {
            object.set(pair);
        }

        return object;
    },
    ObjectPair: function(key, value) {
        const keyId = key.interpret();
        const val = value.interpret();
        return new Identifier(keyId.value, val);
    },
    NonemptyListOf: function(a, _, c) {
        return [a.interpret(), ...c.interpret()];
    },
    Accessor: function(id, _, b, _) {
        const objId = id.interpret();

        let identifier = globalScope.getVar(objId);
        let obj = identifier.get();
        const keys = b.interpret();
        let value = null;
        if (obj) {
            for (const key of keys) {
                
                value = obj.get(key);
                console.log(key, obj);
                if  (value instanceof Obj || value instanceof Arr) {
                    obj = value;
                }
            }
        }
        console.log('In accessor');
        return value;
    },
};