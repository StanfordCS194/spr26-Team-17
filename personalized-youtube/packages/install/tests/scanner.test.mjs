import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scanHostPage } from '../dist/index.js';

// Tiny DOM fixture so scanner tests can run in Node without a browser.
class FixtureElement {
  constructor({ tag = 'div', text = '', attrs = {}, children = [] } = {}) {
    this.tag = tag;
    this.text = text;
    this.attrs = attrs;
    this.children = children;
  }

  get textContent() {
    return [this.text, ...this.children.map((child) => child.textContent)].join(' ').trim();
  }

  getAttribute(name) {
    return this.attrs[name] ?? null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector) {
    const out = [];
    const visit = (node) => {
      if (matches(node, selector)) out.push(node);
      for (const child of node.children) visit(child);
    };
    for (const child of this.children) visit(child);
    return out;
  }
}

// Minimal document wrapper that provides the fields scanHostPage reads.
class FixtureDocument extends FixtureElement {
  constructor(body) {
    super({ tag: 'document', children: [body] });
    this.body = body;
    this.documentElement = body;
    this.title = 'Fixture Tube';
  }
}

// Supports just the selectors used by the install scanner.
function matches(node, selector) {
  if (selector === 'a,button') return node.tag === 'a' || node.tag === 'button';
  const attrMatch = selector.match(/^\[([^=\]]+)(?:='([^']+)')?\]$/);
  if (!attrMatch) return false;
  const [, attr, value] = attrMatch;
  if (!(attr in node.attrs)) return false;
  return value === undefined || node.attrs[attr] === value;
}

// Convenience helper for building fixture nodes.
function el(tag, attrs, text, children = []) {
  return new FixtureElement({ tag, attrs, text, children });
}

// Verifies static host markup becomes the shared PageConfig shape.
test('scanHostPage converts a static YouTube-like DOM into PageConfig', () => {
  const body = el('body', { 'data-showcase-root': '' }, '', [
    el('header', { 'data-showcase-section': 'topbar' }, 'StaticTube'),
    el('aside', { 'data-showcase-section': 'sidebar' }, '', [
      el('a', {}, 'Home'),
      el('a', {}, 'Subscriptions'),
    ]),
    el('nav', { 'data-showcase-section': 'chips' }, '', [
      el('button', { 'data-showcase-chip': '' }, 'All'),
      el('button', { 'data-showcase-chip': '' }, 'NBA'),
    ]),
    el('section', { 'data-showcase-section': 'video-grid' }, '', [
      el('article', { 'data-showcase-video-card': '', 'data-showcase-tags': 'nba analysis' }, '', [
        el('img', { 'data-showcase-video-thumbnail': '', src: 'https://example.com/thumb.jpg' }),
        el('h3', { 'data-showcase-video-title': '' }, 'NBA spacing explained'),
        el('span', { 'data-showcase-video-channel': '' }, 'Film Room'),
      ]),
    ]),
  ]);
  const result = scanHostPage({}, new FixtureDocument(body));

  assert.equal(result.config.meta.title, 'Fixture Tube');
  assert.equal(result.config.sections[0].type, 'TopBar');
  assert.deepEqual(result.config.sections[1].props.pinnedItems, ['Home', 'Subscriptions']);
  assert.deepEqual(result.config.sections[2].props.chips, ['All', 'NBA']);
  assert.equal(result.config.sections[3].props.videos[0].title, 'NBA spacing explained');
  assert.equal(result.config.sections[3].props.videos[0].channel.name, 'Film Room');
  assert.equal(result.bindings.videoCards.length, 1);
});
