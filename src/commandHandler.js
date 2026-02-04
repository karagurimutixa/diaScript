#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class CommandHandler {
    constructor() {
        this.commands = new Map();
        this.loadCommands();
    }

    async loadCommands() {
        const commandsDir = path.join(__dirname, 'commands');
        
        if (!fs.existsSync(commandsDir)) {
            console.error('Commands directory not found:', commandsDir);
            return;
        }

        const commandFiles = fs.readdirSync(commandsDir)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            try {
                const commandPath = `./commands/${file}`;
                const module = await import(commandPath);
                const commandName = file.replace('.js', '');
                
                if (module.default && typeof module.default === 'function') {
                    this.commands.set(commandName, module.default);
                } else if (typeof module === 'function') {
                    this.commands.set(commandName, module);
                }
                console.log(`Loaded command: ${commandName}`);
            } catch (error) {
                console.error(`Failed to load command ${file}:`, error);
            }
        }
    }

    async handle(args) {
        const commandName = args[0];
        
        if (!commandName || commandName === 'help' || !this.commands.has(commandName)) {
            return this.showHelp();
        }

        const command = this.commands.get(commandName);
        const commandArgs = args.slice(1);
        
        try {
            await command(commandArgs);
        } catch (error) {
            console.error(`Error executing command "${commandName}":`, error);
            process.exit(1);
        }
    }

    showHelp() {
        console.log('diaScript - Custom Scripting Language');
        console.log('Usage: dia <command> [arguments]\n');
        console.log('Available commands:');
        
        for (const [cmd] of this.commands) {
            console.log(`  ${cmd}`);
        }
        
        console.log('\nExamples:');
        console.log('  dia st myscript.ds      # Run a script');
        console.log('  dia help               # Show this help');
    }
}

// Ana çalıştırma
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const handler = new CommandHandler();
    
    // Komutları yüklemek için biraz zaman ver
    setTimeout(() => {
        handler.handle(process.argv.slice(2));
    }, 100);
}

export default CommandHandler;