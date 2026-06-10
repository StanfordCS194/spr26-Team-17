import assert from 'node:assert/strict';
import { test } from 'node:test';
import { auditInstallSetup } from '../dist/index.js';

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
    this.title = 'Fixture';
  }
}

function matches(node, selector) {
  const attrMatch = selector.match(/^\[([^=\]]+)(?:='([^']+)')?\]$/);
  if (!attrMatch) return false;
  const [, attr, value] = attrMatch;
  if (!(attr in node.attrs)) return false;
  return value === undefined || node.attrs[attr] === value;
}

function el(tag, attrs, text, children = []) {
  return new FixtureElement({ tag, attrs, text, children });
}

test('auditInstallSetup passes a complete amazon-style page', () => {
  const body = el('body', { 'data-showcase-root': '' }, '', [
    el('header', { 'data-showcase-section': 'topbar' }, 'Store'),
    el('section', { 'data-showcase-section': 'product-grid' }, '', [
      el('article', { 'data-showcase-item-card': '', 'data-showcase-tags': 'electronics' }, '', [
        el('h3', { 'data-showcase-item-title': '' }, 'Headphones'),
        el('p', { 'data-showcase-item-subtitle': '' }, 'Sony'),
        el('img', { 'data-showcase-item-image': '', src: 'https://example.com/a.jpg' }),
      ]),
      el('article', { 'data-showcase-item-card': '', 'data-showcase-tags': 'kitchen' }, '', [
        el('h3', { 'data-showcase-item-title': '' }, 'Blender'),
        el('p', { 'data-showcase-item-subtitle': '' }, 'Vitamix'),
        el('img', { 'data-showcase-item-image': '', src: 'https://example.com/b.jpg' }),
      ]),
    ]),
  ]);

  const report = auditInstallSetup(
    { videoGrid: "[data-showcase-section='product-grid']" },
    new FixtureDocument(body),
    'amazon',
  );

  assert.equal(report.ready, true);
  assert.equal(report.cardCount, 2);
  assert.equal(report.issues.filter((issue) => issue.level === 'error').length, 0);
});

test('auditInstallSetup flags missing root and cards', () => {
  const body = el('body', {}, '', []);
  const report = auditInstallSetup({}, new FixtureDocument(body), 'youtube');
  assert.equal(report.ready, false);
  assert.ok(report.issues.some((issue) => issue.code === 'missing_root'));
  assert.ok(report.issues.some((issue) => issue.code === 'no_cards'));
});
