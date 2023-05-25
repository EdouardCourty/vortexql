import path from "path";
import fs from "fs";

import Configuration from "./Configuration.js";
import Migration from "../lib/Migration.js";

export default class {
    static getMigrationFolderPath() {
        return process.cwd() + '/' + Configuration.getConfiguration().migrationsLocation;
    }

    static initMigrationsFolder() {
        const mainFolderLocation = Configuration.getMainFolderLocation();
        const wantedMigrationsLocation = Configuration.getConfiguration().migrationsLocation;

        const migrationsPath = path.join(mainFolderLocation, wantedMigrationsLocation);

        if (fs.existsSync(migrationsPath) === false) {
            fs.mkdirSync(migrationsPath);
        }
    }

    getHistoryStorageFolderPath() {
        return path.join(Configuration.getMainFolderLocation(), './.vortex');
    }

    getHistoryStorageFilePath() {
        return this.getHistoryStorageFolderPath() + '/history.json';
    }

    initStorage() {
        const migrationsHistoryPath = this.getHistoryStorageFolderPath();

        if (fs.existsSync(migrationsHistoryPath) === false) {
            fs.mkdirSync(migrationsHistoryPath);
        }

        const historyFilePath = this.getHistoryStorageFilePath();

        if (fs.existsSync(historyFilePath) === false) {
            fs.writeFileSync(historyFilePath, JSON.stringify([], null, 4));
        }
    }

    /**
     * @returns {Promise<Migration[]>}
     */
    static async getMigrations() {
        const folderPath = this.getMigrationFolderPath();

        const migrationsPaths = fs.readdirSync(folderPath)
            .filter((file) => file.endsWith('.js'))
            .map((file) => {
                const versionId = file.split('.')[0];

                return {
                    version: versionId,
                    path: folderPath + '/' + file
                }
            });

        const migrations = [];

        for (let { version, path } of migrationsPaths) {
            const instance = new (await import(path)).default(version);

            migrations.push(instance);
        }

        return migrations;
    }

    getExecutedMigrations() {
        return this.getHistory();
    }

    getHistory() {
        return JSON.parse(fs.readFileSync(this.getHistoryStorageFilePath()).toString());
    }

    rewriteHistory(content) {
        fs.writeFileSync(this.getHistoryStorageFilePath(), JSON.stringify(content, null, 4));
    }

    /**
     * @param { Migration } migration
     */
    storeMigration(migration) {
        const historyItem = {
            version: migration.getVersion(),
            migrated_at: Math.round(Date.now() / 1000),
        }

        const currentHistory = this.getHistory();
        currentHistory.push(historyItem);

        this.rewriteHistory(currentHistory);
    }
}
