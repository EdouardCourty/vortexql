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
            })
            .sort((elem1, elem2) => {
                return parseInt(elem1.version) < parseInt(elem2.version) ? 1 : -1;
            });

        const migrations = [];

        for (let { version, path } of migrationsPaths) {
            const instance = new (await import(path)).default(version);

            if (!instance['up'] || !instance['down']) {
                throw new Error(`Migration ${version} is invalid, up() and down() methods need to exist in the exported class.`);
            }

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
            migrated_at: Date.now(),
        }

        const currentHistory = this.getHistory();
        currentHistory.push(historyItem);

        this.rewriteHistory(currentHistory);
    }

    /**
     * @param { Migration } migration
     */
    removeMigration(migration) {
        const currentHistory = this.getHistory();

        this.rewriteHistory(currentHistory.filter((historyEntry) => {
            return historyEntry.version !== migration.getVersion();
        }));
    }
}
