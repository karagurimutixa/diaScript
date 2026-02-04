export default class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
        this.currentToken = this.tokens[0] || { type: 'EOF', value: '' };
    }

    parse() {
        const statements = [];
        
        while (!this.isAtEnd() && this.currentToken.type !== 'EOF') {
            const statement = this.parseStatement();
            if (statement) {
                statements.push(statement);
            }
            
            if (this.currentToken.type === 'SEMICOLON') {
                this.advance();
            } else if (!this.isAtEnd()) {
                throw new Error(`Expected semicolon at line ${this.currentToken.line}`);
            }
        }
        
        return {
            type: 'Program',
            statements: statements
        };
    }

    parseStatement() {
        try {
            if (this.match('KEYWORD', 'set')) {
                return this.parseSetStatement();
            } else if (this.match('KEYWORD', 'add')) {
                return this.parseAddStatement();
            } else if (this.match('KEYWORD', 'if')) {
                return this.parseIfStatement();
            } else if (this.match('KEYWORD', 'repeat')) {
                return this.parseRepeatStatement();
            } else if (this.match('KEYWORD', 'define')) {
                return this.parseFunctionDefinition();
            } else if (this.match('KEYWORD', 'call')) {
                return this.parseFunctionCall();
            } else if (this.match('KEYWORD', 'terminal_print')) {
                return this.parseTerminalPrint();
            } else {
                throw new Error(`Unexpected token: ${this.currentToken.type} "${this.currentToken.value}" at line ${this.currentToken.line}`);
            }
        } catch (error) {
            console.error(`Parse error: ${error.message}`);
            this.synchronize();
            return null;
        }
    }

    parseSetStatement() {
        this.consume('KEYWORD', 'set', 'Expected "set"');
        
        const variableName = this.consume('IDENTIFIER', null, 'Expected variable name after "set"');
        
        this.consume('KEYWORD', 'to', 'Expected "to" after variable name');
        
        const value = this.parseExpression();
        
        return {
            type: 'SetStatement',
            variable: variableName.value,
            value: value,
            line: variableName.line
        };
    }

    parseAddStatement() {
        this.consume('KEYWORD', 'add', 'Expected "add"');
        
        const left = this.parseExpression();
        
        this.consume('KEYWORD', 'and', 'Expected "and" after first operand');
        
        const right = this.parseExpression();
        
        this.consume('KEYWORD', 'into', 'Expected "into" after second operand');
        
        const resultVar = this.consume('IDENTIFIER', null, 'Expected variable name after "into"');
        
        return {
            type: 'AddStatement',
            left: left,
            right: right,
            result: resultVar.value,
            line: this.currentToken.line
        };
    }

    parseIfStatement() {
        this.consume('KEYWORD', 'if', 'Expected "if"');
        
        const condition = this.parseCondition();
        
        this.consume('KEYWORD', 'then', 'Expected "then" after condition');
        
        const thenBranch = this.parseStatement();
        
        let elseBranch = null;
        if (this.match('KEYWORD', 'else')) {
            this.advance();
            elseBranch = this.parseStatement();
        }
        
        return {
            type: 'IfStatement',
            condition: condition,
            then: thenBranch,
            else: elseBranch,
            line: this.currentToken.line
        };
    }


    parseRepeatStatement() {
        this.consume('KEYWORD', 'repeat', 'Expected "repeat"');
        
        const count = this.parseExpression();
        
        this.consume('KEYWORD', 'times', 'Expected "times" after count');
        this.consume('KEYWORD', 'do', 'Expected "do" after "times"');
        
        const body = this.parseStatement();
        
        return {
            type: 'RepeatStatement',
            count: count,
            body: body,
            line: this.currentToken.line
        };
    }

    parseFunctionDefinition() {
        this.consume('KEYWORD', 'define', 'Expected "define"');
        
        const funcName = this.consume('IDENTIFIER', null, 'Expected function name after "define"');
        
        this.consume('LPAREN', null, 'Expected "(" after function name');
        
        const params = [];
        if (this.currentToken.type !== 'RPAREN') {
            do {
                const param = this.consume('IDENTIFIER', null, 'Expected parameter name');
                params.push(param.value);
                
                if (this.currentToken.type === 'RPAREN') break;
                
                if (this.currentToken.type === 'IDENTIFIER') {
                }
            } while (this.currentToken.type !== 'RPAREN' && !this.isAtEnd());
        }
        
        this.consume('RPAREN', null, 'Expected ")" after parameters');
        this.consume('KEYWORD', 'as', 'Expected "as" after function definition');
        
        const body = this.parseStatement();
        
        return {
            type: 'FunctionDefinition',
            name: funcName.value,
            params: params,
            body: body,
            line: funcName.line
        };
    }

    parseFunctionCall() {
        this.consume('KEYWORD', 'call', 'Expected "call"');
        
        const funcName = this.consume('IDENTIFIER', null, 'Expected function name after "call"');
        
        this.consume('LPAREN', null, 'Expected "(" after function name');
        
        const args = [];
        if (this.currentToken.type !== 'RPAREN') {
            do {
                const arg = this.parseExpression();
                args.push(arg);
                
                if (this.currentToken.type === 'RPAREN') break;
                
                if (this.match('IDENTIFIER') || this.match('STRING') || this.match('NUMBER')) {
                }
            } while (this.currentToken.type !== 'RPAREN' && !this.isAtEnd());
        }
        
        this.consume('RPAREN', null, 'Expected ")" after arguments');
        
        return {
            type: 'FunctionCall',
            name: funcName.value,
            arguments: args,
            line: funcName.line
        };
    }

    parseTerminalPrint() {
        const token = this.consume('KEYWORD', 'terminal_print', 'Expected "terminal_print"');
        
        this.consume('LPAREN', null, 'Expected "(" after terminal_print');
        
        const expression = this.parseExpression();
        
        this.consume('RPAREN', null, 'Expected ")" after expression');
        
        return {
            type: 'TerminalPrint',
            expression: expression,
            line: token.line
        };
    }

    parseCondition() {
        const left = this.parseExpression();
        
        let operator = null;
        if (this.match('GT')) {
            operator = '>';
            this.advance();
        } else if (this.match('LT')) {
            operator = '<';
            this.advance();
        } else if (this.match('EQ')) {
            operator = '==';
            this.advance();
        } else {
            throw new Error(`Expected comparison operator at line ${this.currentToken.line}`);
        }
        
        const right = this.parseExpression();
        
        return {
            type: 'Condition',
            left: left,
            operator: operator,
            right: right,
            line: this.currentToken.line
        };
    }

    parseExpression() {
        return this.parsePrimary();
    }

    parsePrimary() {
        if (this.match('NUMBER')) {
            const token = this.advance();
            return {
                type: 'NumberLiteral',
                value: parseFloat(token.value),
                line: token.line
            };
        } else if (this.match('STRING')) {
            const token = this.advance();
            return {
                type: 'StringLiteral',
                value: token.value,
                line: token.line
            };
        } else if (this.match('IDENTIFIER')) {
            const token = this.advance();
            return {
                type: 'Identifier',
                name: token.value,
                line: token.line
            };
        } else if (this.match('LPAREN')) {
            this.advance();
            const expr = this.parseExpression();
            this.consume('RPAREN', null, 'Expected ")" after expression');
            return expr;
        } else if (this.match('PLUS')) {
            const token = this.advance();
            const right = this.parsePrimary();
            return {
                type: 'UnaryExpression',
                operator: '+',
                argument: right,
                line: token.line
            };
        } else {
            throw new Error(`Expected expression at line ${this.currentToken.line}, got ${this.currentToken.type}`);
        }
    }

    match(type, value = null) {
        if (this.isAtEnd()) return false;
        if (this.currentToken.type !== type) return false;
        if (value !== null && this.currentToken.value !== value) return false;
        return true;
    }

    consume(type, value = null, errorMessage) {
        if (this.match(type, value)) {
            return this.advance();
        }
        
        const got = this.currentToken.value ? `"${this.currentToken.value}"` : this.currentToken.type;
        const expected = value ? `"${value}"` : type;
        throw new Error(`${errorMessage}. Expected ${expected}, got ${got} at line ${this.currentToken.line}`);
    }

    advance() {
        if (!this.isAtEnd()) {
            const token = this.currentToken;
            this.position++;
            this.currentToken = this.tokens[this.position] || { type: 'EOF', value: '' };
            return token;
        }
        return this.currentToken;
    }

    isAtEnd() {
        return this.position >= this.tokens.length || this.currentToken.type === 'EOF';
    }

    synchronize() {
        while (!this.isAtEnd()) {
            if (this.previousToken() && this.previousToken().type === 'SEMICOLON') {
                return;
            }
            
            if (this.match('KEYWORD', 'set') ||
                this.match('KEYWORD', 'add') ||
                this.match('KEYWORD', 'if') ||
                this.match('KEYWORD', 'repeat') ||
                this.match('KEYWORD', 'define') ||
                this.match('KEYWORD', 'call') ||
                this.match('KEYWORD', 'terminal_print')) {
                return;
            }
            
            this.advance();
        }
    }

    previousToken() {
        return this.position > 0 ? this.tokens[this.position - 1] : null;
    }

    peekToken(offset = 1) {
        const pos = this.position + offset;
        return pos < this.tokens.length ? this.tokens[pos] : { type: 'EOF', value: '' };
    }
}