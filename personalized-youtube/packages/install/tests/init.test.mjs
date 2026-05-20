import assert from 'node:assert/strict';
import { test } from 'node:test';

// Keeps the package test command valid even before behavior-specific tests run.
test('install package test harness is wired', () => {
  assert.equal(1 + 1, 2);
});
