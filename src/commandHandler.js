#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { handleSyntax, interpret } = require('./syntaxHandler');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createProject(auto = false) {
    const projectName = auto ? path.basename(process.cwd()) : await askQuestion('Project name: ') || path.basename(process.cwd());
    const description = auto ? '' : await askQuestion('Description: ');
    const version = auto ? '1.0.0' : await askQuestion('Version: ') || '1.0.0';
    const githubRepo = auto ? '' : await askQuestion('GitHub repository: ');
    const author = auto ? '' : await askQuestion('Author: ');
    const license = auto ? 'MIT' : await askQuestion('License: ') || 'MIT';

    const projectJson = {
        name: projectName,
        version: version,
        description: description,
        repository: githubRepo,
        author: author,
        license: license
    };

    fs.writeFileSync('project.json', JSON.stringify(projectJson, null, 2));
    fs.writeFileSync('LICENSE.md', `${license} License\n\nCopyright (c) ${new Date().getFullYear()} ${author}`);
    fs.writeFileSync('README.md', `# ${projectName}\n\n${description}`);

    console.log('Project created successfully!');
    rl.close();
    process.exit(0);
}

async function updateVersion(version) {
    const projectJsonPath = path.resolve('project.json');
    if (fs.existsSync(projectJsonPath)) {
        const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));
        projectJson.version = version;
        fs.writeFileSync(projectJsonPath, JSON.stringify(projectJson, null, 2));
        console.log(`Version updated to ${version}`);
    } else {
        console.error('Error: project.json not found.');
    }
    process.exit(0);
}

async function main() {
    const [,, subCommand, ...args] = process.argv;

    switch (subCommand) {
        case 'st':
            if (args[0]) {
                interpret(args[0]);
            } else {
                console.error('Usage: dia st <filePath>');
            }
            process.exit(0);
            break;
        case 'project-create':
            if (args[0] === '-y') {
                await createProject(true);
            } else {
                await createProject();
            }
            process.exit(0);
            break;
        case 'project-update-vs':
            if (args[0]) {
                await updateVersion(args[0]);
            } else {
                console.error('Usage: dia project-update-vs <version>');
            }
            process.exit(0);
            break;
        default:
            console.error('Unknown command.');
            process.exit(0);
            break;
    }
}

main();