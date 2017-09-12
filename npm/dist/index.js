#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
program
    .arguments('<path>')
    .action((file) => {
    console.log('compiling path: %s', file);
})
    .parse(process.argv);
