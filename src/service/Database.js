import mysql from 'mysql2';

import Configuration from './Configuration.js';
import Migration from "../lib/Migration.js";

let instance = null

export default class {
    static getInstance() {
        if (instance === null) {
            const databaseConfig = Configuration.getConfiguration().database;

            instance = mysql.createConnection(databaseConfig);
        }

        return instance;
    }

    static executeQuery(query) {
        return new Promise((resolve, reject) => {
            this.getInstance().query(query, (err, results) => {
                if (err) {
                    return reject(err);
                }

                return resolve(results);
            })
        })
    }

    static end() {
        if (instance !== null) {
            this.getInstance().end();
        }
    }

    /**
     * @param { Migration } migration
     */
    static async executeMigrationUp(migration) {
        migration.up();

        await this.#executeMigration(migration);
    }

    /**
     * @param { Migration } migration
     */
    static async executeMigrationDown(migration) {
        migration.down();

        await this.#executeMigration(migration);
    }

    /**
     * @param { Migration } migration
     */
    static async #executeMigration(migration) {
        const queryCount = migration.getQueries().length;

        console.log(`Executing migration ${migration.getVersion()} - ${queryCount} ${queryCount > 1 ? 'queries' : 'query'}.`);
        const start = Date.now();

        for (let query of migration.getQueries()) {
            await this.executeQuery(query);
        }

        const end = Date.now();
        const milliseconds = end - start;

        console.log(`Migrated in ${milliseconds} ms.\n`);
    }
}
