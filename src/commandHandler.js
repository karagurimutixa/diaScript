#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { handleSyntax } = require('./syntaxHandler');

// Simple interpreter function
function interpret(filePath) {
  const fullPath = path.resolve(filePath);
  const fileContent = fs.readFileSync(fullPath, 'utf-8');
  const commands = fileContent.split('\n');
  commands.forEach(command => {
    handleSyntax(command.trim());
  });
}

// Get command-line arguments
const [,, subCommand, filePath] = process.argv;

if (subCommand === 'st' && filePath) {
  interpret(filePath);
} else {
  console.error('Usage: dia st <filePath>');
}