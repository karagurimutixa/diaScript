export default class Tokenizer {
    constructor(source) {
        this.source = source;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
    }

    tokenize() {
        while (this.position < this.source.length) {
            const char = this.source[this.position];
            
            if (this.isWhitespace(char)) {
                this.skipWhitespace();
            } else if (this.isDigit(char)) {
                this.readNumber();
            } else if (this.isLetter(char)) {
                this.readIdentifier();
            } else if (char === '"' || char === "'") {
                this.readString(char);
            } else if (char === ';') {
                this.addToken('SEMICOLON', ';');
                this.advance();
            } else if (char === '(') {
                this.addToken('LPAREN', '(');
                this.advance();
            } else if (char === ')') {
                this.addToken('RPAREN', ')');
                this.advance();
            } else if (char === '>') {
                this.addToken('GT', '>');
                this.advance();
            } else if (char === '<') {
                this.addToken('LT', '<');
                this.advance();
            } else if (char === '=') {
                this.advance();
                if (this.peek() === '=') {
                    this.addToken('EQ', '==');
                    this.advance();
                } else {
                    this.addToken('ASSIGN', '=');
                }
            } else if (char === '+') {
                this.addToken('PLUS', '+');
                this.advance();
            } else {
                // Bilinmeyen karakter
                this.advance();
            }
        }
        
        this.addToken('EOF', '');
        return this.tokens;
    }

    readIdentifier() {
        let identifier = '';
        const startColumn = this.column;
        
        while (this.position < this.source.length && 
               (this.isLetter(this.peek()) || this.isDigit(this.peek()) || this.peek() === '_')) {
            identifier += this.advance();
        }
        
        // Anahtar kelimeleri kontrol et
        const keywords = [
            'set', 'to', 'add', 'and', 'into', 'if', 'then', 'else',
            'repeat', 'times', 'do', 'define', 'as', 'call', 'terminal_print'
        ];
        
        const type = keywords.includes(identifier) ? 'KEYWORD' : 'IDENTIFIER';
        this.addToken(type, identifier, startColumn);
    }

    readNumber() {
        let number = '';
        const startColumn = this.column;
        
        while (this.position < this.source.length && this.isDigit(this.peek())) {
            number += this.advance();
        }
        
        this.addToken('NUMBER', number, startColumn);
    }

    readString(quoteChar) {
        let str = '';
        this.advance(); // Opening quote
        
        while (this.position < this.source.length && this.peek() !== quoteChar) {
            if (this.peek() === '\\') {
                this.advance(); // Skip backslash
                // Escape karakterlerini işle
                if (this.peek() === 'n') str += '\n';
                else if (this.peek() === 't') str += '\t';
                else str += this.peek();
                this.advance();
            } else {
                str += this.advance();
            }
        }
        
        if (this.peek() === quoteChar) {
            this.advance(); // Closing quote
            this.addToken('STRING', str);
        } else {
            throw new Error(`Unterminated string at line ${this.line}`);
        }
    }

    addToken(type, value, startColumn = this.column) {
        this.tokens.push({
            type,
            value,
            line: this.line,
            column: startColumn,
            endColumn: this.column
        });
    }

    advance() {
        const char = this.source[this.position];
        this.position++;
        
        if (char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        
        return char;
    }

    peek(offset = 0) {
        const pos = this.position + offset;
        return pos < this.source.length ? this.source[pos] : null;
    }

    skipWhitespace() {
        while (this.position < this.source.length && this.isWhitespace(this.peek())) {
            this.advance();
        }
    }

    isWhitespace(char) {
        return char === ' ' || char === '\t' || char === '\n' || char === '\r';
    }

    isDigit(char) {
        return char >= '0' && char <= '9';
    }

    isLetter(char) {
        return (char >= 'a' && char <= 'z') || 
               (char >= 'A' && char <= 'Z') ||
               char === '_';
    }
}