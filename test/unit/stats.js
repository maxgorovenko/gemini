'use strict';

const EventEmitter = require('events').EventEmitter;
const RunnerEvents = require('../../lib/constants/events');
const Stats = require('../../lib/stats');

describe('Stats', () => {
    it('should get full stat', () => {
        const runner = new EventEmitter();
        const stats = new Stats(runner);
        const testsStat = {
            total: 6,
            updated: 1,
            passed: 1,
            failed: 1,
            errored: 1,
            skipped: 1,
            warned: 1,
            retries: 1
        };
        runner.emit(RunnerEvents.END, testsStat);

        assert.deepEqual(stats.get(), testsStat);
    });
});
