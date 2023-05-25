#!/usr/bin/env node

import { Argument, Option, program } from 'commander';

import Vortex from '../src/Vortex.js';

program
    .name('vortex')
    .description('An SQL migration tool for Node.JS')
    .version('1.0.0');

program
    .command('migrate')
    .description('Migrates the database to the newest migration.')
    .action(async () => {
        Vortex.init();

        await Vortex.migrate();
        Vortex.finish();
    });

program
    .command('create')
    .description('Creates a new migration')
    .action(() => {
        Vortex.init();

        Vortex.createNew();
        Vortex.finish();
    });

program
    .command('revert')
    .addArgument(new Argument('version', 'The version of the migration to revert to.'))
    .addOption(new Option('--no-interaction', 'Will automatically reply to any prompt by the default value (yes).'))
    .description('Reverts the database to the given migration ID\'s state')
    .action(async (version, { interaction }) => {
        Vortex.init();
        Vortex.setInteraction(interaction);

        await Vortex.revertTo(version);
        Vortex.finish();
    });

program
    .command('list')
    .description('Shows a list of the migrations (played or not) and their description.')
    .action(async () => {
        Vortex.init();

        await Vortex.summary();
        Vortex.finish();
    });

program
    .command('init')
    .description('Creates a default configuration file.')
    .action(async () => {
        await Vortex.createConfigFile();
    });

program.parse(process.argv);
