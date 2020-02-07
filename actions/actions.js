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
    constructor(id) {
        this.id = id;
    } 
    set(value) {
        this.value = value;
    }

    get() {
        return this.value;
    }
}

class Literal {
    constructor(value) {
        this.value = value;
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
        
        return new Identifier(name);
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
    NonemptyListOf: function(a, _, c) {
        return [a.interpret(), ...c.interpret()];
    }
};