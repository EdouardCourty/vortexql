import Configuration from "./service/Configuration.js";
import DatabaseRepository from "./service/DatabaseRepository.js";
import FileSystemRepository from "./service/FileSystemRepository.js";
import Database from "./service/Database.js";

import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";

export default class {
    /**
     * @type { FileSystemRepository|DatabaseRepository }
     */
    static persistor = null;

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
        const migrations = await FileSystemRepository.getMigrations();
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

    static createNew() {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));

        const template = path.join(__dirname + '/../data/migration.template.js');
        const content = fs.readFileSync(template).toString();

        const newMigrationFileName = Math.round((new Date()).getTime() / 1000) + '.js';
        const migrationFilePath = path.join(FileSystemRepository.getMigrationFolderPath(), '/' + newMigrationFileName);

        fs.writeFileSync(migrationFilePath, content);

        console.log('Created a new migration: ' + newMigrationFileName);
    }

    static finish() {
        Database.end();
    }
}
