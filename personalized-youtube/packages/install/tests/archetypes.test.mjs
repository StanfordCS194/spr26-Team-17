import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scanHostPage } from '../dist/index.js';

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

class FixtureDocument extends FixtureElement {
  constructor(body) {
    super({ tag: 'document', children: [body] });
    this.body = body;
    this.documentElement = body;
    this.title = 'Amazon Fixture';
  }
}

function matches(node, selector) {
  if (selector === 'a,button') return node.tag === 'a' || node.tag === 'button';
  const attrMatch = selector.match(/^\[([^=\]]+)(?:='([^']+)')?\]$/);
  if (!attrMatch) return false;
  const [, attr, value] = attrMatch;
  if (!(attr in node.attrs)) return false;
  return value === undefined || node.attrs[attr] === value;
}

function el(tag, attrs, text, children = []) {
  return new FixtureElement({ tag, attrs, text, children });
}

test('amazon archetype preset scans product cards', () => {
  const body = el('body', { 'data-showcase-root': '' }, '', [
    el('header', { 'data-showcase-section': 'topbar' }, 'Amazon'),
    el('section', { 'data-showcase-section': 'video-grid' }, '', [
      el('article', { 'data-showcase-item-card': '', 'data-showcase-item-id': 'asin-B08XYZ0001', 'data-showcase-tags': 'tech accessories' }, '', [
        el('img', { 'data-showcase-item-image': '', src: 'https://example.com/a.jpg' }),
        el('h3', { 'data-showcase-item-title': '' }, 'Wireless Mouse'),
        el('span', { 'data-showcase-item-subtitle': '' }, 'Logi Store'),
        el('span', { 'data-showcase-item-price': '' }, '$19.99'),
        el('span', { 'data-showcase-item-meta': '' }, 'In stock'),
      ]),
      el('article', { 'data-showcase-item-card': '', 'data-showcase-item-id': 'asin-B08XYZ0002', 'data-showcase-tags': 'office essentials' }, '', [
        el('img', { 'data-showcase-item-image': '', src: 'https://example.com/b.jpg' }),
        el('h3', { 'data-showcase-item-title': '' }, 'Mechanical Keyboard'),
        el('span', { 'data-showcase-item-subtitle': '' }, 'Acme Office'),
        el('span', { 'data-showcase-item-price': '' }, '$79.00'),
      ]),
    ]),
  ]);

  const result = scanHostPage({}, new FixtureDocument(body), 'amazon');
  const videos = result.config.sections[3].props.videos;

  assert.equal(result.bindings.itemCards.length, 2);
  assert.equal(result.bindings.videoCards.length, 2);
  assert.equal(videos[0].id, 'asin-B08XYZ0001');
  assert.equal(videos[0].channel.name, 'Logi Store');
  assert.equal(videos[0].description, '$19.99 | In stock');
  assert.equal(videos[1].title, 'Mechanical Keyboard');
  assert.equal(videos[1].description, '$79.00');
});
