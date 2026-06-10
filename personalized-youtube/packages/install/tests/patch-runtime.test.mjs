import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyDomPatch, scanHostPage } from '../dist/index.js';

// Browser-like element fixture with enough style/dataset behavior for patch tests.
class FixtureElement {
  constructor({ tag = 'div', text = '', attrs = {}, children = [] } = {}) {
    this.tag = tag;
    this.text = text;
    this.attrs = attrs;
    this.children = children;
    this.parentElement = null;
    this.style = {
      display: '',
      fontSize: '',
      background: '',
      values: {},
      setProperty: (key, value) => {
        this.style.values[key] = value;
      },
    };
    this.dataset = {};
    for (const child of children) child.parentElement = this;
  }

  get textContent() {
    return [this.text, ...this.children.map((child) => child.textContent)].join(' ').trim();
  }

  getAttribute(name) {
    return this.attrs[name] ?? null;
  }

  setAttribute(name, value) {
    this.attrs[name] = String(value);
  }

  removeAttribute(name) {
    delete this.attrs[name];
  }

  appendChild(child) {
    this.children = this.children.filter((item) => item !== child);
    this.children.push(child);
    child.parentElement = this;
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
    this.title = 'Patch Fixture';
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

// Builds a repeatable YouTube-like DOM for each patch test.
function fixture() {
  const main = el('main', {}, '', [
    el('section', { 'data-showcase-section': 'shorts' }, 'Shorts'),
    el('section', { 'data-showcase-section': 'video-grid' }, '', [
      el('article', { 'data-showcase-video-card': '', 'data-showcase-tags': 'nba sports' }, '', [
        el('h3', { 'data-showcase-video-title': '' }, 'NBA spacing explained'),
        el('span', { 'data-showcase-video-channel': '' }, 'Film Room'),
      ]),
      el('article', { 'data-showcase-video-card': '', 'data-showcase-tags': 'music' }, '', [
        el('h3', { 'data-showcase-video-title': '' }, 'Soul guitar lesson'),
        el('span', { 'data-showcase-video-channel': '' }, 'Studio Notes'),
      ]),
    ]),
  ]);
  const body = el('body', { 'data-showcase-root': '' }, '', [
    el('header', { 'data-showcase-section': 'topbar' }, 'StaticTube'),
    el('aside', { 'data-showcase-section': 'sidebar' }, '', [el('a', {}, 'Home')]),
    el('nav', { 'data-showcase-section': 'chips' }, '', [el('button', { 'data-showcase-chip': '' }, 'All')]),
    main,
  ]);
  return scanHostPage({}, new FixtureDocument(body));
}

// Confirms theme patches mutate CSS variables on the host root.
test('applyDomPatch applies theme variables to the host root', () => {
  const { bindings } = fixture();
  applyDomPatch({ op: 'update_theme', patch: { mode: 'dark', accent: '#ef4444' } }, bindings);
  assert.equal(bindings.root.getAttribute('data-showcase-theme'), 'dark');
  assert.equal(bindings.root.style.values['--accent'], '#ef4444');
});

// Confirms filter patches hide non-matching video cards.
test('applyDomPatch filters cards by title or tags', () => {
  const { bindings } = fixture();
  bindings.itemCards = bindings.videoCards;
  applyDomPatch({ op: 'set_filter', filter: { requireTitleMatches: ['NBA'] } }, bindings);
  assert.equal(bindings.videoCards[0].style.display, '');
  assert.equal(bindings.videoCards[1].style.display, 'none');
});

// Confirms section visibility and ordering patches touch the right DOM nodes.
test('applyDomPatch hides sections and reorders siblings', () => {
  const { bindings } = fixture();
  applyDomPatch({ op: 'remove_section', sectionId: 'shorts' }, bindings);
  assert.equal(bindings.sections.find((s) => s.getAttribute('data-showcase-section') === 'shorts').style.display, 'none');

  applyDomPatch({ op: 'reorder_sections', order: ['chips', 'sidebar', 'topbar'] }, bindings);
  assert.equal(bindings.sections[0].parentElement.children.at(-1).getAttribute('data-showcase-section'), 'topbar');
});
