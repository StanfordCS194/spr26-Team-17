import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyArchetypeTheme, ARCHETYPE_THEMES } from '../dist/index.js';

class FakeRoot {
  constructor() {
    this.attrs = {};
    this.props = {};
  }

  setAttribute(name, value) {
    this.attrs[name] = value;
  }

  get style() {
    return {
      setProperty: (key, value) => {
        this.props[key] = value;
      },
    };
  }
}

test('applyArchetypeTheme sets accent and archetype marker', () => {
  const root = new FakeRoot();
  applyArchetypeTheme(root, 'amazon');
  assert.equal(root.attrs['data-showcase-archetype'], 'amazon');
  assert.equal(root.props['--accent'], ARCHETYPE_THEMES.amazon.accent);
  assert.equal(root.props['--bg'], ARCHETYPE_THEMES.amazon.bg);
});

test('slack theme sets sidebar variables', () => {
  const root = new FakeRoot();
  applyArchetypeTheme(root, 'slack');
  assert.equal(root.props['--showcase-sidebar-bg'], '#3F0E40');
});
