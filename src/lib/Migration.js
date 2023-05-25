export default class {
    #queries = [];
    #version = null;

    constructor(version) {
        this.#version = version;
    }

    /**
     * @param {string} query
     */
    addSql(query) {
        this.#queries.push(query);
    }

    /**
     * @returns {string[]}
     */
    getQueries() {
        return this.#queries;
    }

    getVersion() {
        return this.#version;
    }
}
