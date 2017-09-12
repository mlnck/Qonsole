#!/usr/bin/env node

import program = require('commander');
// import { WalkDirs } from './walk-dirs';

// let wD:WalkDirs = new WalkDirs();

program
  .arguments('<path>')
  // .option('-u, --username <username>', 'The user to authenticate as')
  // .option('-p, --password <password>', 'The user\'s password')
  .action((file: string) => {
    //  console.log('user: %s pass: %s file: %s', program.username, program.password, file);
    console.log('compiling path: %s', file);
    // const wD: WalkDirs = new WalkDirs(file);
    // wD.walk();
  })
  .parse(process.argv);

// export * from './walk-dirs';
// export * from './add-readme';
