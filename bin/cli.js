import { program } from 'commander';

import Vortex from '../src/Vortex.js';

program
    .name('Vortex SQL')
    .description('An SQL migration tool for Node.JS')
    .version('1.0.0');

Vortex.init();

program
    .command('migrate')
    .description('Migrates the database to the newest migration.')
    .action(async () => {
        await Vortex.migrate()
        Vortex.finish();
    });

program
    .command('create')
    .description('Creates a new migration')
    .action(() => {
        Vortex.createNew();
        Vortex.finish();
    });

program.parse(process.argv);
