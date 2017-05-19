'use strict';

const _ = require('lodash');
const RunnerEvents = require('./constants/events');

const STATS = {
    total: 'total',
    updated: 'updated',
    passed: 'passed',
    failed: 'failed',
    errored: 'errored',
    skipped: 'skipped',
    retries: 'retries'
};

module.exports = class Stats {
    static create() {
        return new Stats();
    }

    constructor() {
        this._stats = {};
    }

    attachRunner(runner) {
        runner
            .on(RunnerEvents.SKIP_STATE, (test) => this._onSkipped(test))
            .on(RunnerEvents.ERROR, (test) => this._onErrored(test))
            .on(RunnerEvents.UPDATE_RESULT, (test) => {
                return test.updated ? this._onUpdated(test) : this._onPassed(test);
            })
            .on(RunnerEvents.TEST_RESULT, (test) => {
                return test.equal ? this._onPassed(test) : this._onFailed(test);
            })
            .on(RunnerEvents.RETRY, (test) => this._onRetry(test));
    }

    _onUpdated(updated) {
        this._addStat(STATS.updated, updated);
    }

    _onPassed(passed) {
        this._addStat(STATS.passed, passed);
    }

    _onFailed(failed) {
        this._addStat(STATS.failed, failed);
    }

    _onErrored(errored) {
        this._addStat(STATS.errored, errored);
    }

    _onSkipped(skipped) {
        this._addStat(STATS.skipped, skipped);
    }

    _onRetry(retried) {
        const suiteStats = this._getSuiteStats(retried);

        suiteStats.retries++;
    }

    _addStat(stat, test) {
        const suiteStats = this._getSuiteStats(test);

        suiteStats.states[test.state.name] = stat;
    }

    _getSuiteStats(test) {
        const key = this._buildSuiteKey(test);

        if (!this._stats[key]) {
            this._stats[key] = {
                retries: 0,
                states: {}
            };
        }

        return this._stats[key];
    }

    _buildSuiteKey(test) {
        return test.suite.fullName + test.browserId;
    }

    getResult() {
        const statNames = _.keys(STATS);
        const result = _.zipObject(statNames, _.fill(Array(statNames.length), 0));

        _.forEach(this._stats, (suiteStats) => {
            result.retries += suiteStats.retries;
            _.forEach(suiteStats.states, (stateStatus) => {
                result.total++;
                result[stateStatus]++;
            });
        });

        return result;
    }
};
