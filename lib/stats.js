'use strict';

const RunnerEvents = require('./constants/events');

module.exports = class Stats {
    constructor(runner) {
        runner.on(RunnerEvents.END, (result) => this._stats = result);
    }

    get(type) {
        return type === undefined ? this._stats : this._stats[type];
    }
};
