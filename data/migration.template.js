import Migration from "vortexql/src/lib/Migration.js";

export default class extends Migration {
    /**
     * Explains what the migration is doing (creating a new table, adding a new column...)
     * @returns {string}
     */
    getDescription() {
        return 'Describe the migration here';
    }

    /**
     * Will be executed when playing the migration
     */
    up() {
        this.addSql('');
    }

    /**
     * Will be executed when reverting the migration
     */
    down() {
        this.addSql('');
    }
}
