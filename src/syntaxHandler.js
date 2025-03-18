const variables = {};

const syntaxRules = {
    'terminal_print': {
        regex: /^terminal_print\("([^"]*)"\);$/,
        execute: (match) => {
            console.log(match[1]);
        }
    },
    'variable_assignment': {
        regex: /^set\s+(\w+)\s+to\s+([-+]?\d+(\.\d+)?|".*?")\s*;?$/,
        execute: (match) => {
            const [_, varName, value] = match;
            if (/^".*"$/.test(value)) {
                variables[varName] = value.slice(1, -1);
            } else {
                variables[varName] = parseFloat(value);
            }
        }
    },
    'arithmetic_operation': {
        regex: /^(combine|subtract|multiply|divide)\s+(\w+)\s+(with|from|by|over)\s+(\w+)\s+into\s+(\w+)\s*;?$/,
        execute: (match) => {
            const [_, operation, operand1, placeholder, operand2, varName] = match;

            if (variables.hasOwnProperty(operand1) && variables.hasOwnProperty(operand2)) {
                switch (operation) {
                    case "combine": variables[varName] = variables[operand1] + variables[operand2]; break;
                    case "subtract": variables[varName] = variables[operand1] - variables[operand2]; break;
                    case "multiply": variables[varName] = variables[operand1] * variables[operand2]; break;
                    case "divide": variables[varName] = variables[operand1] / variables[operand2]; break;
                }
            } else {
                console.error(`Syntax error: Undefined variable(s) in arithmetic operation at "${match[0]}"`);
            }
        }
    },
    'conditional_statement': {
        regex: /^if\s+(.+?)\s+then\s+(.+?)\s+else\s+(.+)\s*;?$/,
        execute: (match) => {
            const [_, condition, ifBlock, elseBlock] = match;
            try {
                const evaluatedCondition = eval(condition.replace(/\b(\w+)\b/g, (match) => variables[match] !== undefined ? variables[match] : match));
                handleSyntax(evaluatedCondition ? ifBlock : elseBlock);
            } catch (e) {
                console.error(`Syntax error: Invalid condition in conditional statement at "${match[0]}"`);
            }
        }
    },
    'loop_statement': {
        regex: /^repeat\s+(\d+)\s+times\s+do\s+(.+)\s*;?$/,
        execute: (match) => {
            const [_, times, command] = match;
            for (let i = 0; i < parseInt(times); i++) {
                handleSyntax(command);
            }
        }
    },
    'repeat_until': {
        regex: /^repeat_until\s+(.+?)\s+do\s+(.+)\s*;?$/,
        execute: (match) => {
            const [_, condition, command] = match;
            while (eval(condition.replace(/\b(\w+)\b/g, (match) => variables[match] !== undefined ? variables[match] : match))) {
                handleSyntax(command);
            }
        }
    },
    'function_definition': {
        regex: /^define\s+(\w+)\((.*?)\)\s+as\s+(.+)\s*;?$/,
        execute: (match) => {
            const [_, funcName, params, body] = match;
            variables[funcName] = { params: params.split(/,\s*/), body };
        }
    },
    'function_call': {
        regex: /^call\s+(\w+)\((.*?)\)\s*;?$/,
        execute: (match) => {
            const [_, funcName, args] = match;
            if (variables.hasOwnProperty(funcName)) {
                const func = variables[funcName];
                const argValues = args.split(/,\s*/);
                for (let i = 0; i < func.params.length; i++) {
                    variables[func.params[i]] = argValues[i];
                }
                handleSyntax(func.body);
            } else {
                console.error(`Syntax error: Undefined function "${funcName}"`);
            }
        }
    }
};

function handleSyntax(command) {
    for (const rule in syntaxRules) {
        const match = command.match(syntaxRules[rule].regex);
        if (match) {
            syntaxRules[rule].execute(match);
            return;
        }
    }
    console.error(`Syntax error: Command not recognized at "${command}"`);
}

module.exports = { handleSyntax, variables };