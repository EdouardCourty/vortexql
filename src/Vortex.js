import Configuration from "./service/Configuration.js";
import DatabaseRepository from "./service/DatabaseRepository.js";
import FileSystemRepository from "./service/FileSystemRepository.js";
import Database from "./service/Database.js";

import inquirer from "inquirer";

import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";

export default class {
    /**
     * @type { FileSystemRepository|DatabaseRepository }
     */
    static persistor = null;

    static #askInteraction = true;

    static setInteraction(bool) {
        this.#askInteraction = bool;
    }

    static async createConfigFile() {
        const filePath = process.cwd() + '/vortexconfig.json';

        if (fs.existsSync(filePath)) {
            const { override } = await inquirer.prompt({
                type: 'confirm',
                message: 'A configuration file already exists, do you want to override it?',
                name: 'override'
            }, null);

            if (!override) {
                process.exit();
            }
        }

        fs.writeFileSync(filePath, JSON.stringify(Configuration.getDefaultConfig(), null, 4));

        console.log('Config file created: vortexconfig.json. Modify it to your needs!');
    }

    static async summary() {
        const existingMigrations = (await FileSystemRepository.getMigrations()).reverse();
        const currentlyPlayedMigrations = await this.persistor.getExecutedMigrations();

        const existingPlayedVersions = currentlyPlayedMigrations.map((mig) => mig.version);

        const summary = [];

        existingMigrations.forEach((migration) => {
            if (existingPlayedVersions.includes(migration.getVersion())) {
                summary.push({
                    version: parseInt(migration.getVersion()),
                    description: migration.getDescription(),
                    played: 'YES'
                });
            } else {
                summary.push({
                    version: parseInt(migration.getVersion()),
                    description: migration.getDescription(),
                    played: 'NO'
                });
            }
        });

        console.table(summary);
    }

    static init() {
        const { migrationsHistorySavingStrategy } = Configuration.getConfiguration();

        switch (migrationsHistorySavingStrategy) {
            case 'filesystem':
                this.persistor = new FileSystemRepository();
                break;

            case 'database':
                this.persistor = new DatabaseRepository();
                break;
        }

        FileSystemRepository.initMigrationsFolder();

        this.persistor.initStorage();
    }

    static getExecutedMigrations() {
        return this.persistor.getExecutedMigrations();
    }

    static async migrate() {
        const migrations = (await FileSystemRepository.getMigrations()).reverse();
        const currentMigrations = await this.getExecutedMigrations();

        const executedMigrationVersions = currentMigrations.map((migrationObject) => migrationObject.version);

        const missingMigrations = migrations.filter((migration) => {
            return !executedMigrationVersions.includes(migration.getVersion())
        });

        if (missingMigrations.length === 0) {
            console.log('No migrations to execute.');
        }

        for (let migration of missingMigrations) {
            await Database.executeMigrationUp(migration);
            this.persistor.storeMigration(migration);
        }
    }

    static async revertTo(version) {
        const migrations = await FileSystemRepository.getMigrations();

        const found = migrations.filter((mig) => mig.getVersion() === version)[0];
        const currentMigrations = await this.persistor.getExecutedMigrations();

        const toRevert = currentMigrations.filter((mig) => mig.version === version)[0];

        if (!toRevert) {
            console.log(`Migration ${version} has not been played yet.`);

            process.exit();
        }

        if (!found) {
            console.log(`Migration version ${version} not found.`);

            process.exit();
        }

        const currentMigrationsVersions = currentMigrations.map((mig) => mig.version);

        const migrationsToRevert = migrations.filter((migration) => {
            return migration.getVersion() >= version && currentMigrationsVersions.includes(migration.getVersion());
        });

        const migrationVersions = migrationsToRevert.map((mig) => mig.getVersion());

        if (this.#askInteraction) {
            const confirmMessage = `Reverting to this migration will revert the following ones:
 > ${migrationVersions.join('\n > ')}

Are you sure?`;

            const { confirmRevert } = await inquirer.prompt({
                type: 'confirm',
                message: confirmMessage,
                name: 'confirmRevert'
            }, null);

            if (!confirmRevert) {
                process.exit();
            }
        }

        for (let migration of migrationsToRevert) {
            await Database.executeMigrationDown(migration);
            this.persistor.removeMigration(migration);
        }
    }

    static createNew(isMjs = false) {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));

        const template = path.join(__dirname + '/../data/migration.template.js');
        const content = fs.readFileSync(template).toString();
        const fileExt = isMjs ? '.mjs' : '.js';

        const newMigrationFileName = Date.now() + fileExt;
        const migrationFilePath = path.join(FileSystemRepository.getMigrationFolderPath(), '/' + newMigrationFileName);

        fs.writeFileSync(migrationFilePath, content);

        console.log('Created a new migration: ' + newMigrationFileName);
    }

    static finish() {
        Database.end();
    }
}
