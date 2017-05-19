'use strict';

const EventEmitter = require('events').EventEmitter;
const RunnerEvents = require('../../lib/constants/events');
const Stats = require('../../lib/stats');
const makeTestStub = require('../util').makeTestStub;

describe('Stats', () => {
    let stats;
    let runner;

    beforeEach(() => {
        runner = new EventEmitter();
        stats = new Stats();
        stats.attachRunner(runner);
    });

    it('should count skipped tests', () => {
        runner.emit(RunnerEvents.SKIP_STATE, makeTestStub());

        assert.equal(stats.getResult().skipped, 1);
    });

    it('should count errored tests', () => {
        runner.emit(RunnerEvents.ERROR, makeTestStub());

        assert.equal(stats.getResult().errored, 1);
    });

    it('should count updated tests', () => {
        runner.emit(RunnerEvents.UPDATE_RESULT, makeTestStub({updated: true}));

        assert.equal(stats.getResult().updated, 1);
    });

    it('should count passed tests on "UPDATE_RESULT" event', () => {
        runner.emit(RunnerEvents.UPDATE_RESULT, makeTestStub({updated: false}));

        assert.equal(stats.getResult().passed, 1);
    });

    it('should count failed tests on "TEST_RESULT" event', () => {
        runner.emit(RunnerEvents.TEST_RESULT, makeTestStub({equal: false}));

        assert.equal(stats.getResult().failed, 1);
    });

    it('should count passed tests on "TEST_RESULT" event', () => {
        runner.emit(RunnerEvents.TEST_RESULT, makeTestStub({equal: true}));

        assert.equal(stats.getResult().passed, 1);
    });

    it('should count retried tests on "RETRY" event', () => {
        runner.emit(RunnerEvents.RETRY, makeTestStub({name: 'some-test'}));
        runner.emit(RunnerEvents.TEST_RESULT, makeTestStub({equal: true, name: 'some-test'}));

        assert.equal(stats.getResult().total, 1);
        assert.equal(stats.getResult().retries, 1);
        assert.equal(stats.getResult().passed, 1);
    });

    it('should count total test count', () => {
        runner.emit(RunnerEvents.TEST_RESULT, makeTestStub({equal: false, name: 'first'}));
        runner.emit(RunnerEvents.TEST_RESULT, makeTestStub({equal: true, name: 'second'}));

        assert.equal(stats.getResult().total, 2);
    });

    it('should getResult full stat', () => {
        runner.emit(RunnerEvents.UPDATE_RESULT, makeTestStub({updated: true, name: 'updated'}));
        runner.emit(RunnerEvents.RETRY, makeTestStub({name: 'passed'}));
        runner.emit(RunnerEvents.TEST_RESULT, makeTestStub({equal: true, name: 'passed'}));
        runner.emit(RunnerEvents.TEST_RESULT, makeTestStub({equal: false, name: 'failed'}));
        runner.emit(RunnerEvents.ERROR, makeTestStub({name: 'errored'}));
        runner.emit(RunnerEvents.SKIP_STATE, makeTestStub({name: 'skipped'}));

        assert.deepEqual(stats.getResult(), {
            total: 5,
            updated: 1,
            passed: 1,
            failed: 1,
            errored: 1,
            skipped: 1,
            retries: 1
        });
    });

    it('should handle cases when several events were emitted for the same test', () => {
        runner.emit(RunnerEvents.SKIP_STATE, makeTestStub({name: 'some-state'}));
        runner.emit(RunnerEvents.ERROR, makeTestStub({name: 'some-state'}));

        assert.equal(stats.getResult().skipped, 0);
        assert.equal(stats.getResult().errored, 1);
    });

    it('should not count test result twice for same suite and browser', () => {
        const test = makeTestStub({
            browserId: 'test_browser',
            state: 'test_state'
        });

        runner.emit(RunnerEvents.ERROR, test);
        runner.emit(RunnerEvents.ERROR, test);

        assert.equal(stats.getResult().total, 1);
        assert.equal(stats.getResult().errored, 1);
    });
});
