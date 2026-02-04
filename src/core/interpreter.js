export default class Interpreter {
    constructor(options = {}) {
        this.environment = new Map();
        this.functions = new Map();
        this.output = [];
        this.callStack = [];
        this.maxCallStackSize = 1000;
        
        this.strictMode = options.strictMode || false;
        this.debugMode = options.debugMode || false;
        
        this.registerBuiltins();
    }

    registerBuiltins() {
        this.functions.set('sqrt', {
            params: ['x'],
            body: { type: 'Builtin', func: (args) => Math.sqrt(args[0]) },
            isBuiltin: true
        });
        
        this.functions.set('abs', {
            params: ['x'],
            body: { type: 'Builtin', func: (args) => Math.abs(args[0]) },
            isBuiltin: true
        });
        
        this.functions.set('round', {
            params: ['x'],
            body: { type: 'Builtin', func: (args) => Math.round(args[0]) },
            isBuiltin: true
        });
        
        this.functions.set('length', {
            params: ['str'],
            body: { type: 'Builtin', func: (args) => args[0].length },
            isBuiltin: true
        });
        
        this.functions.set('uppercase', {
            params: ['str'],
            body: { type: 'Builtin', func: (args) => args[0].toUpperCase() },
            isBuiltin: true
        });
        
        this.functions.set('lowercase', {
            params: ['str'],
            body: { type: 'Builtin', func: (args) => args[0].toLowerCase() },
            isBuiltin: true
        });
        
        this.functions.set('to_string', {
            params: ['value'],
            body: { type: 'Builtin', func: (args) => String(args[0]) },
            isBuiltin: true
        });
        
        this.functions.set('to_number', {
            params: ['value'],
            body: { type: 'Builtin', func: (args) => {
                const num = Number(args[0]);
                if (isNaN(num)) {
                    throw new Error(`Cannot convert "${args[0]}" to number`);
                }
                return num;
            }},
            isBuiltin: true
        });
    }

    execute(ast) {
        if (!ast || ast.type !== 'Program') {
            throw new Error('Invalid AST: Expected Program node');
        }

        if (this.debugMode) {
            console.log('=== Starting Execution ===');
        }

        try {
            for (let i = 0; i < ast.statements.length; i++) {
                const statement = ast.statements[i];
                
                if (this.debugMode) {
                    console.log(`Executing statement ${i + 1}:`, statement.type);
                }
                
                if (statement) {
                    const result = this.executeStatement(statement);
                    
                    if (this.debugMode && result !== undefined && result !== null) {
                        console.log(`  Result:`, result);
                    }
                }
            }
        } catch (error) {
            const errorMsg = `Runtime error at line ${error.line || 'unknown'}: ${error.message}`;
            console.error(errorMsg);
            
            if (this.debugMode) {
                console.error('Call stack:', this.callStack);
                console.error('Environment:', this.getEnvironment());
            }
            
            throw new Error(errorMsg);
        } finally {
            if (this.debugMode) {
                console.log('=== Execution Complete ===');
                console.log('Final environment:', this.getEnvironment());
                console.log('Total output lines:', this.output.length);
            }
        }

        return {
            success: true,
            environment: this.getEnvironment(),
            functions: Array.from(this.functions.keys()).filter(name => !this.functions.get(name).isBuiltin),
            output: this.output,
            exitCode: 0
        };
    }

    executeStatement(statement) {
        if (this.callStack.length > this.maxCallStackSize) {
            throw new Error(`Call stack size exceeded maximum of ${this.maxCallStackSize}`);
        }

        this.callStack.push({
            type: statement.type,
            line: statement.line
        });

        let result;
        try {
            switch (statement.type) {
                case 'SetStatement':
                    result = this.executeSetStatement(statement);
                    break;
                case 'AddStatement':
                    result = this.executeAddStatement(statement);
                    break;
                case 'SubtractStatement':
                    result = this.executeSubtractStatement(statement);
                    break;
                case 'MultiplyStatement':
                    result = this.executeMultiplyStatement(statement);
                    break;
                case 'DivideStatement':
                    result = this.executeDivideStatement(statement);
                    break;
                case 'IfStatement':
                    result = this.executeIfStatement(statement);
                    break;
                case 'RepeatStatement':
                    result = this.executeRepeatStatement(statement);
                    break;
                case 'WhileStatement':
                    result = this.executeWhileStatement(statement);
                    break;
                case 'FunctionDefinition':
                    result = this.executeFunctionDefinition(statement);
                    break;
                case 'FunctionCall':
                    result = this.executeFunctionCall(statement);
                    break;
                case 'TerminalPrint':
                    result = this.executeTerminalPrint(statement);
                    break;
                case 'ReturnStatement':
                    result = this.executeReturnStatement(statement);
                    break;
                case 'ExpressionStatement':
                    result = this.evaluate(statement.expression);
                    break;
                case 'BlockStatement':
                    result = this.executeBlockStatement(statement);
                    break;
                default:
                    throw new Error(`Unknown statement type: ${statement.type}`);
            }
        } finally {
            this.callStack.pop();
        }

        return result;
    }

    executeSetStatement(node) {
        const value = this.evaluate(node.value);
        
        if (this.debugMode) {
            console.log(`  Setting ${node.variable} =`, value);
        }
        
        this.environment.set(node.variable, value);
        return value;
    }

    executeAddStatement(node) {
        const leftValue = this.evaluate(node.left);
        const rightValue = this.evaluate(node.right);
        
        if (typeof leftValue === 'number' && typeof rightValue === 'number') {
            const result = leftValue + rightValue;
            this.environment.set(node.result, result);
            return result;
        } else if (typeof leftValue === 'string' || typeof rightValue === 'string') {
            const result = String(leftValue) + String(rightValue);
            this.environment.set(node.result, result);
            return result;
        } else {
            throw new Error(`Cannot add values of types ${typeof leftValue} and ${typeof rightValue} at line ${node.line}`);
        }
    }

    executeSubtractStatement(node) {
        const leftValue = this.evaluate(node.left);
        const rightValue = this.evaluate(node.right);
        
        if (typeof leftValue !== 'number' || typeof rightValue !== 'number') {
            throw new Error(`Cannot subtract non-numeric values at line ${node.line}`);
        }
        
        const result = leftValue - rightValue;
        this.environment.set(node.result, result);
        return result;
    }

    executeMultiplyStatement(node) {
        const leftValue = this.evaluate(node.left);
        const rightValue = this.evaluate(node.right);
        
        if (typeof leftValue !== 'number' || typeof rightValue !== 'number') {
            throw new Error(`Cannot multiply non-numeric values at line ${node.line}`);
        }
        
        const result = leftValue * rightValue;
        this.environment.set(node.result, result);
        return result;
    }

    executeDivideStatement(node) {
        const leftValue = this.evaluate(node.left);
        const rightValue = this.evaluate(node.right);
        
        if (typeof leftValue !== 'number' || typeof rightValue !== 'number') {
            throw new Error(`Cannot divide non-numeric values at line ${node.line}`);
        }
        
        if (rightValue === 0) {
            throw new Error(`Division by zero at line ${node.line}`);
        }
        
        const result = leftValue / rightValue;
        this.environment.set(node.result, result);
        return result;
    }

    executeIfStatement(node) {
        const conditionResult = this.evaluateCondition(node.condition);
        
        if (this.debugMode) {
            console.log(`  If condition:`, conditionResult);
        }
        
        if (conditionResult) {
            return this.executeStatement(node.then);
        } else if (node.else) {
            return this.executeStatement(node.else);
        }
        
        return null;
    }

    executeRepeatStatement(node) {
        const count = this.evaluate(node.count);
        
        if (typeof count !== 'number') {
            throw new Error(`Repeat count must be a number at line ${node.line}`);
        }
        
        if (count < 0) {
            throw new Error(`Repeat count cannot be negative at line ${node.line}`);
        }
        
        if (this.debugMode) {
            console.log(`  Repeating ${count} times`);
        }
        
        let lastResult = null;
        for (let i = 0; i < count; i++) {
            if (this.debugMode) {
                console.log(`  Iteration ${i + 1}/${count}`);
            }
            
            const previousEnv = new Map(this.environment);
            
            try {
                lastResult = this.executeStatement(node.body);
            } finally {
            }
        }
        
        return lastResult;
    }

    executeWhileStatement(node) {
        let iterations = 0;
        const maxIterations = 100000; 
        
        while (this.evaluateCondition(node.condition)) {
            if (iterations++ > maxIterations) {
                throw new Error(`While loop exceeded maximum iterations (${maxIterations}) at line ${node.line}`);
            }
            
            if (this.debugMode && iterations % 1000 === 0) {
                console.log(`  While loop iteration ${iterations}`);
            }
            
            this.executeStatement(node.body);
        }
        
        return iterations;
    }

    executeFunctionDefinition(node) {
        if (this.functions.has(node.name) && this.functions.get(node.name).isBuiltin) {
            throw new Error(`Cannot redefine built-in function "${node.name}" at line ${node.line}`);
        }
        
        this.functions.set(node.name, {
            params: node.params,
            body: node.body,
            closure: new Map(this.environment), 
            isBuiltin: false,
            line: node.line
        });
        
        if (this.debugMode) {
            console.log(`  Defined function: ${node.name}(${node.params.join(', ')})`);
        }
        
        return null;
    }

    executeFunctionCall(node) {
        const func = this.functions.get(node.name);
        
        if (!func) {
            throw new Error(`Function "${node.name}" is not defined at line ${node.line}`);
        }
        
        if (this.debugMode) {
            console.log(`  Calling function: ${node.name}`);
        }
        
        const args = node.arguments.map(arg => this.evaluate(arg));
        
        if (args.length !== func.params.length) {
            throw new Error(`Function "${node.name}" expects ${func.params.length} arguments, got ${args.length} at line ${node.line}`);
        }
        
        if (func.isBuiltin) {
            try {
                return func.body.func(args);
            } catch (error) {
                throw new Error(`Built-in function error in ${node.name}: ${error.message} at line ${node.line}`);
            }
        }
        
        const previousEnv = new Map(this.environment);
        
        this.environment = new Map(func.closure);
        
        for (let i = 0; i < func.params.length; i++) {
            this.environment.set(func.params[i], args[i]);
        }
        
        let result = null;
        try {
            result = this.executeStatement(func.body);
        } catch (returnValue) {
            if (returnValue && returnValue.type === 'RETURN') {
                result = returnValue.value;
                
                if (this.debugMode) {
                    console.log(`  Function ${node.name} returned:`, result);
                }
            } else {
                throw returnValue;
            }
        } finally {
            this.environment = previousEnv;
        }
        
        return result;
    }

    executeReturnStatement(node) {
        const value = node.expression ? this.evaluate(node.expression) : null;
        
        throw {
            type: 'RETURN',
            value: value,
            line: node.line
        };
    }

    executeTerminalPrint(node) {
        const value = this.evaluate(node.expression);
        const output = String(value);
        
        this.output.push({
            value: output,
            line: node.line,
            timestamp: new Date().toISOString()
        });
        
        console.log(output);
        
        return output;
    }

    executeBlockStatement(node) {
        const previousEnv = new Map(this.environment);
        let lastResult = null;
        
        try {
            for (const statement of node.statements) {
                lastResult = this.executeStatement(statement);
            }
        } finally {
        }
        
        return lastResult;
    }

    evaluateCondition(condition) {
        if (condition.type !== 'Condition') {
            throw new Error(`Expected condition, got ${condition.type} at line ${condition.line}`);
        }
        
        const left = this.evaluate(condition.left);
        const right = this.evaluate(condition.right);
        
        switch (condition.operator) {
            case '>':
                return left > right;
            case '<':
                return left < right;
            case '>=':
                return left >= right;
            case '<=':
                return left <= right;
            case '==':
                return this.isEqual(left, right);
            case '!=':
                return !this.isEqual(left, right);
            default:
                throw new Error(`Unknown operator: ${condition.operator} at line ${condition.line}`);
        }
    }

    isEqual(a, b) {
        if (this.strictMode) {
            return a === b;
        }
        return a == b;
    }

    evaluate(node) {
        if (!node) {
            throw new Error('Cannot evaluate null node');
        }

        switch (node.type) {
            case 'NumberLiteral':
                return node.value;
            case 'StringLiteral':
                return node.value;
            case 'BooleanLiteral':
                return node.value;
            case 'Identifier':
                return this.resolveIdentifier(node);
            case 'UnaryExpression':
                return this.evaluateUnaryExpression(node);
            case 'BinaryExpression':
                return this.evaluateBinaryExpression(node);
            case 'Condition':
                return this.evaluateCondition(node);
            case 'FunctionCall':
                return this.executeFunctionCall(node);
            case 'ArrayLiteral':
                return node.elements.map(element => this.evaluate(element));
            case 'ObjectLiteral':
                const obj = {};
                for (const prop of node.properties) {
                    obj[prop.key] = this.evaluate(prop.value);
                }
                return obj;
            case 'MemberExpression':
                return this.evaluateMemberExpression(node);
            case 'AssignmentExpression':
                return this.evaluateAssignmentExpression(node);
            default:
                throw new Error(`Cannot evaluate node type: ${node.type} at line ${node.line || 'unknown'}`);
        }
    }

    evaluateBinaryExpression(node) {
        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);
        
        switch (node.operator) {
            case '+':
                if (typeof left === 'number' && typeof right === 'number') {
                    return left + right;
                }
                return String(left) + String(right);
            case '-':
                this.ensureNumbers(left, right, node.operator, node.line);
                return left - right;
            case '*':
                this.ensureNumbers(left, right, node.operator, node.line);
                return left * right;
            case '/':
                this.ensureNumbers(left, right, node.operator, node.line);
                if (right === 0) throw new Error(`Division by zero at line ${node.line}`);
                return left / right;
            case '%':
                this.ensureNumbers(left, right, node.operator, node.line);
                return left % right;
            case '&&':
                return left && right;
            case '||':
                return left || right;
            default:
                throw new Error(`Unknown binary operator: ${node.operator} at line ${node.line}`);
        }
    }

    evaluateUnaryExpression(node) {
        const argument = this.evaluate(node.argument);
        
        switch (node.operator) {
            case '+':
                const num = Number(argument);
                if (isNaN(num)) throw new Error(`Cannot convert to number at line ${node.line}`);
                return num;
            case '-':
                if (typeof argument !== 'number') {
                    throw new Error(`Unary minus requires a number at line ${node.line}`);
                }
                return -argument;
            case '!':
                return !argument;
            default:
                throw new Error(`Unknown unary operator: ${node.operator} at line ${node.line}`);
        }
    }

    evaluateMemberExpression(node) {
        const object = this.evaluate(node.object);
        const property = node.computed 
            ? this.evaluate(node.property)
            : node.property.name;
        
        if (object === null || object === undefined) {
            throw new Error(`Cannot access property of null/undefined at line ${node.line}`);
        }
        
        return object[property];
    }

    evaluateAssignmentExpression(node) {
        if (node.left.type !== 'Identifier') {
            throw new Error(`Can only assign to identifiers at line ${node.line}`);
        }
        
        const value = this.evaluate(node.right);
        this.environment.set(node.left.name, value);
        return value;
    }

    resolveIdentifier(node) {
        if (this.environment.has(node.name)) {
            return this.environment.get(node.name);
        }
        
        if (this.functions.has(node.name)) {
            return { 
                type: 'function', 
                name: node.name,
                params: this.functions.get(node.name).params
            };
        }
        
        throw new Error(`Identifier "${node.name}" is not defined at line ${node.line}`);
    }

    ensureNumbers(left, right, operator, line) {
        if (typeof left !== 'number' || typeof right !== 'number') {
            throw new Error(`Operator "${operator}" requires numbers at line ${line}`);
        }
    }

    getVariable(name) {
        return this.environment.get(name);
    }

    setVariable(name, value) {
        this.environment.set(name, value);
    }

    hasVariable(name) {
        return this.environment.has(name);
    }

    getEnvironment() {
        return Object.fromEntries(this.environment);
    }

    getFunctions() {
        return Array.from(this.functions.keys()).filter(name => !this.functions.get(name).isBuiltin);
    }

    getOutput() {
        return this.output;
    }

    clear() {
        this.environment.clear();
        this.output = [];
        this.callStack = [];
    }

    inspect() {
        return {
            environment: this.getEnvironment(),
            functions: this.getFunctions(),
            callStack: [...this.callStack],
            outputCount: this.output.length
        };
    }

    trace(message) {
        if (this.debugMode) {
            console.log(`[TRACE] ${message}`);
        }
    }
}