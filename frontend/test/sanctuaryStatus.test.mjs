import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshotLifetime, formatSanctuaryTime } from '../src/lib/sanctuaryStatus.js';

const fresh = { status: 'open', scheduleConfigured: true, timeZone: 'Asia/Kolkata', checkedAt: '2026-11-05T04:00:00Z', validUntil: '2026-11-05T04:00:15Z' };
test('unverified, malformed or old status formats never produce an open snapshot', () => {
  for (const data of [null, {}, { ...fresh, scheduleConfigured: false }, { ...fresh, status: 'openingSoon' }, { ...fresh, timeZone: 'UTC' }, { ...fresh, checkedAt: 'invalid' }]) assert.equal(snapshotLifetime(data), 0);
});
test('status lifetime accounts for network delay and rejects expiry or unbounded caching', () => {
  assert.equal(snapshotLifetime(fresh, 500), 14500);
  assert.equal(snapshotLifetime(fresh, 16000), 0);
  assert.equal(snapshotLifetime({ ...fresh, validUntil: '2026-11-05T04:00:00Z' }), 0);
  assert.equal(snapshotLifetime({ ...fresh, validUntil: '2026-11-05T05:00:00Z' }), 0);
});
test('IST display formatting never invents missing times', () => {
  assert.equal(formatSanctuaryTime('09:15'), '9:15 AM');
  assert.equal(formatSanctuaryTime('17:30'), '5:30 PM');
  assert.equal(formatSanctuaryTime('00:00'), '12:00 AM');
  assert.equal(formatSanctuaryTime('12:00'), '12:00 PM');
  assert.equal(formatSanctuaryTime(null), 'Not confirmed');
});
