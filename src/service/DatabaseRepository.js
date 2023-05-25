import Database from "./Database.js";
import Migration from "../lib/Migration.js";

export default class {
    initStorage() {
        Database.executeQuery('CREATE TABLE IF NOT EXISTS migrations_history (id INT PRIMARY KEY AUTO_INCREMENT, version VARCHAR(255) NOT NULL, migrated_at BIGINT(12) NOT NULL)');
    }

    getExecutedMigrations() {
        return Database.executeQuery('SELECT * FROM migrations_history');
    }

    /**
     * @param { Migration } migration
     */
    storeMigration(migration) {
        const query = `INSERT INTO migrations_history (version, migrated_at) VALUES (${migration.getVersion()}, ${Math.round(Date.now() / 1000)})`;

        Database.executeQuery(query);
    }
}
