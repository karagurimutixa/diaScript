const variables = {};

const syntaxRules = {
    'terminal_print': {
        regex: /^terminal_print\((.*)\);?$/,
        execute: (match, lineNumber) => {
            const content = match[1].trim();
            try {
                const result = eval(content.replace(/\b(\w+)\b/g, (match) => variables[match] !== undefined ? variables[match] : match));
                console.log(result);
            } catch (e) {
                console.error(`Error at line ${lineNumber}: Invalid expression or undefined variable in terminal_print at "${content}"`);
            }
        }
    },
    'variable_assignment': {
        regex: /^(\w+)\s*=\s*([-+]?\d+(\.\d+)?|".*?")\s*;?$/,
        execute: (match, lineNumber) => {
            const [_, varName, value] = match;
            if (/^".*"$/.test(value)) {
                variables[varName] = value.slice(1, -1);
            } else {
                variables[varName] = parseFloat(value);
            }
        }
    },
    'arithmetic_operation': {
        regex: /^(\w+)\s*=\s*(\w+|\d+)\s*([\+\-\*\/])\s*(\w+|\d+)\s*;?$/,
        execute: (match, lineNumber) => {
            const [_, varName, operand1, operator, operand2] = match;
            const value1 = isNaN(operand1) ? variables[operand1] : parseFloat(operand1);
            const value2 = isNaN(operand2) ? variables[operand2] : parseFloat(operand2);

            if (typeof value1 === 'string' || typeof value2 === 'string') {
                console.error(`Error at line ${lineNumber}: Variable is a string and cannot be used in arithmetic operations at "${match[0]}"`);
                return;
            }

            if (value1 !== undefined && value2 !== undefined) {
                switch (operator) {
                    case '+':
                        variables[varName] = value1 + value2;
                        break;
                    case '-':
                        variables[varName] = value1 - value2;
                        break;
                    case '*':
                        variables[varName] = value1 * value2;
                        break;
                    case '/':
                        variables[varName] = value1 / value2;
                        break;
                }
            } else {
                console.error(`Error at line ${lineNumber}: Undefined variable(s) in arithmetic operation at "${match[0]}"`);
            }
        }
    },
    'conditional_statement': {
        regex: /^if\s+(.+?)\s+then\s+(.+?)\s+else\s+(.+)\s*;?$/,
        execute: (match, lineNumber) => {
            const [_, condition, ifBlock, elseBlock] = match;
            try {
                const evaluatedCondition = eval(condition.replace(/\b(\w+)\b/g, (match) => variables[match] !== undefined ? variables[match] : match));
                handleSyntax(evaluatedCondition ? ifBlock : elseBlock, lineNumber);
            } catch (e) {
                console.error(`Error at line ${lineNumber}: Invalid condition in conditional statement at "${match[0]}"`);
            }
        }
    },
    'loop_statement': {
        regex: /^repeat\s+(\d+)\s+times\s+do\s+(.+)\s*;?$/,
        execute: (match, lineNumber) => {
            const [_, times, command] = match;
            for (let i = 0; i < parseInt(times); i++) {
                handleSyntax(command, lineNumber);
            }
        }
    },
    'repeat_until': {
        regex: /^repeat_until\s+(.+?)\s+do\s+(.+)\s*;?$/,
        execute: (match, lineNumber) => {
            const [_, condition, command] = match;
            while (eval(condition.replace(/\b(\w+)\b/g, (match) => variables[match] !== undefined ? variables[match] : match))) {
                handleSyntax(command, lineNumber);
            }
        }
    },
    'function_definition': {
        regex: /^define\s+(\w+)\((.*?)\)\s+as\s+(.+)\s*;?$/,
        execute: (match, lineNumber) => {
            const [_, funcName, params, body] = match;
            variables[funcName] = { params: params.split(/,\s*/), body };
        }
    },
    'function_call': {
        regex: /^call\s+(\w+)\((.*?)\)\s*;?$/,
        execute: (match, lineNumber) => {
            const [_, funcName, args] = match;
            if (variables.hasOwnProperty(funcName)) {
                const func = variables[funcName];
                const argValues = args.split(/,\s*/);
                for (let i = 0; i < func.params.length; i++) {
                    variables[func.params[i]] = argValues[i];
                }
                handleSyntax(func.body, lineNumber);
            } else {
                console.error(`Error at line ${lineNumber}: Undefined function "${funcName}"`);
            }
        }
    },
    'comment': {
        regex: /^\/\/.*$/,
        execute: (match, lineNumber) => {
            // Do nothing for comments
        }
    }
};

function handleSyntax(command, lineNumber) {
    if (command.trim() === '') {
        return; // Ignore empty lines
    }
    for (const rule in syntaxRules) {
        const match = command.match(syntaxRules[rule].regex);
        if (match) {
            syntaxRules[rule].execute(match, lineNumber);
            return;
        }
    }
    console.error(`Error at line ${lineNumber}: Command not recognized at "${command}"`);
}

function interpret(filePath) {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.resolve(filePath);
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    const lines = fileContent.split('\n');
    lines.forEach((line, index) => {
        handleSyntax(line.trim(), index + 1);
    });
    process.exit(0); // Ensure the script exits after execution
}

module.exports = { handleSyntax, variables, interpret };