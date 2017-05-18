'use strict';

const RunnerEvents = require('./constants/events');
const TestCounter = require('./test-counter');

module.exports = class Stats {
    static create() {
        return new Stats();
    }

    constructor() {
        this._counter = new TestCounter();
    }

    attachRunner(runner) {
        runner
            .on(RunnerEvents.SKIP_STATE, (test) => this._counter.onSkipped(test))
            .on(RunnerEvents.ERROR, (test) => this._counter.onErrored(test))
            .on(RunnerEvents.UPDATE_RESULT, (test) => {
                return test.updated ? this._counter.onUpdated(test) : this._counter.onPassed(test);
            })
            .on(RunnerEvents.TEST_RESULT, (test) => {
                return test.equal ? this._counter.onPassed(test) : this._counter.onFailed(test);
            })
            .on(RunnerEvents.RETRY, (test) => this._counter.onRetry(test));
    }

    get() {
        return this._counter.getResult();
    }
};
