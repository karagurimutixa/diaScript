import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Tokenizer from '../core/tokenizer.js';
import Parser from '../core/parser.js';
import Interpreter from '../core/interpreter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function runScript(args) {
    if (args.length === 0) {
        console.error('Usage: dia st <script-file.ds>');
        process.exit(1);
    }

    const scriptPath = args[0];
    
    if (!fs.existsSync(scriptPath)) {
        console.error(`File not found: ${scriptPath}`);
        process.exit(1);
    }

    try {
        const source = fs.readFileSync(scriptPath, 'utf-8');
        
        // Tokenize
        const tokenizer = new Tokenizer(source);
        const tokens = tokenizer.tokenize();
        
        // Parse
        const parser = new Parser(tokens);
        const ast = parser.parse();
        
        // Execute
        const interpreter = new Interpreter();
        interpreter.execute(ast);
        
    } catch (error) {
        console.error('Script execution error:', error.message);
        process.exit(1);
    }
}