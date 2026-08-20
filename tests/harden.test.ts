import assert from 'node:assert/strict';
import test from 'node:test';
import { hardenRawHtml } from '../lib/harden.ts';

// Minimal stand-ins for the mdast nodes remark hands the plugin.
const el = (
  name: string,
  attributes: Array<{ type?: string; name?: string }> = [],
  children: unknown[] = [],
) => ({ type: 'mdxJsxFlowElement', name, attributes, children });

const attr = (name: string) => ({ type: 'mdxJsxAttribute', name });
const text = (value: string) => ({ type: 'text', value });

/** Runs the plugin over a synthetic root and returns the mutated tree. */
function harden(children: unknown[]) {
  const tree = { type: 'root', children };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hardenRawHtml()(tree as any);
  return tree;
}

const names = (tree: { children: unknown[] }) =>
  tree.children.map(
    (c) =>
      (c as { name?: string; type?: string }).name ??
      (c as { type?: string }).type,
  );

const attrNames = (node: unknown) =>
  ((node as { attributes: Array<{ name?: string }> }).attributes ?? []).map(
    (a) => a.name,
  );

void test('drops blocked tags with their subtree', () => {
  const tree = harden([
    el('script', [], [text('alert(1)')]),
    el('iframe'),
    el('p', [], [text('kept')]),
  ]);
  assert.deepEqual(names(tree), ['p']);
});

void test('drops blocked tags nested inside allowed ones', () => {
  const tree = harden([el('div', [], [el('script'), el('span')])]);
  const div = tree.children[0] as { children: unknown[] };
  assert.deepEqual(
    div.children.map((c) => (c as { name?: string }).name),
    ['span'],
  );
});

void test('renames raw a/img to the capitalised aliases', () => {
  const tree = harden([el('a'), el('img'), el('p')]);
  assert.deepEqual(names(tree), ['MdxRawLink', 'MdxRawImage', 'p']);
});

void test('strips attributes the hardened components own', () => {
  const tree = harden([
    el('a', [attr('href'), attr('rel'), attr('target')]),
    el('img', [
      attr('src'),
      attr('referrerpolicy'),
      attr('loading'),
      attr('decoding'),
    ]),
  ]);
  assert.deepEqual(attrNames(tree.children[0]), ['href']);
  assert.deepEqual(attrNames(tree.children[1]), ['src']);
});

void test('strips owned attributes regardless of casing', () => {
  const tree = harden([el('a', [attr('href'), attr('REL'), attr('TaRgEt')])]);
  assert.deepEqual(attrNames(tree.children[0]), ['href']);
});

// The gap this file was written for: attribute filtering used to run only for
// `a` and `img`, so an inline handler on any other tag reached the browser.
void test('strips inline event handlers on any tag', () => {
  const tree = harden([
    el('div', [attr('onclick'), attr('id')]),
    el('svg', [attr('onload')]),
    el('video', [attr('src'), attr('onerror')]),
    el('a', [attr('href'), attr('onmouseover')]),
    el('p', [attr('onClick')]), // React-style casing
    el('span', [attr('ONFOCUS')]),
  ]);
  assert.deepEqual(attrNames(tree.children[0]), ['id']);
  assert.deepEqual(attrNames(tree.children[1]), []);
  assert.deepEqual(attrNames(tree.children[2]), ['src']);
  assert.deepEqual(attrNames(tree.children[3]), ['href']);
  assert.deepEqual(attrNames(tree.children[4]), []);
  assert.deepEqual(attrNames(tree.children[5]), []);
});

void test('keeps ordinary attributes and tags untouched', () => {
  const tree = harden([
    el('div', [attr('id'), attr('class'), attr('data-x'), attr('title')]),
  ]);
  assert.deepEqual(names(tree), ['div']);
  assert.deepEqual(attrNames(tree.children[0]), [
    'id',
    'class',
    'data-x',
    'title',
  ]);
});

void test('leaves non-element nodes alone', () => {
  const tree = harden([text('plain'), el('p')]);
  assert.deepEqual(names(tree), ['text', 'p']);
});

void test('tolerates nodes with no children or attributes', () => {
  const tree = {
    type: 'root',
    children: [{ type: 'mdxJsxFlowElement', name: 'p' }],
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assert.doesNotThrow(() => hardenRawHtml()(tree as any));
});
