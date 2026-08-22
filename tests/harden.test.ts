import assert from 'node:assert/strict';
import test from 'node:test';
import { hardenRawHtml, type MdxJsxNode } from '../lib/harden.ts';

// Minimal stand-ins for the mdast nodes remark hands the plugin.
const el = (
  name: string,
  attributes: MdxJsxNode['attributes'] = [],
  children: MdxJsxNode[] = [],
): MdxJsxNode => ({ type: 'mdxJsxFlowElement', name, attributes, children });

const attr = (name: string) => ({ type: 'mdxJsxAttribute', name });
// Unannotated: MdxJsxNode has no `value`, so a typed literal would be rejected.
const text = (value: string) => ({ type: 'text', value });

/** Runs the plugin over a synthetic root and returns the mutated tree. */
function harden(children: MdxJsxNode[]): MdxJsxNode {
  const tree: MdxJsxNode = { type: 'root', children };
  hardenRawHtml()(tree);
  return tree;
}

/** Child tag names, falling back to `type` for non-element nodes. */
const names = (node: MdxJsxNode | undefined) =>
  (node?.children ?? []).map((c) => c.name ?? c.type);

const attrNames = (node: MdxJsxNode | undefined) =>
  (node?.attributes ?? []).map((a) => a.name);

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
  assert.deepEqual(names(tree.children?.[0]), ['span']);
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
  assert.deepEqual(attrNames(tree.children?.[0]), ['href']);
  assert.deepEqual(attrNames(tree.children?.[1]), ['src']);
});

void test('strips owned attributes regardless of casing', () => {
  const tree = harden([el('a', [attr('href'), attr('REL'), attr('TaRgEt')])]);
  assert.deepEqual(attrNames(tree.children?.[0]), ['href']);
});

// The regression this file exists for: filtering used to run only on a/img.
void test('strips inline event handlers on any tag', () => {
  const tree = harden([
    el('div', [attr('onclick'), attr('id')]),
    el('svg', [attr('onload')]),
    el('video', [attr('src'), attr('onerror')]),
    el('a', [attr('href'), attr('onmouseover')]),
    el('p', [attr('onClick')]), // React-style casing
    el('span', [attr('ONFOCUS')]),
  ]);
  assert.deepEqual(attrNames(tree.children?.[0]), ['id']);
  assert.deepEqual(attrNames(tree.children?.[1]), []);
  assert.deepEqual(attrNames(tree.children?.[2]), ['src']);
  assert.deepEqual(attrNames(tree.children?.[3]), ['href']);
  assert.deepEqual(attrNames(tree.children?.[4]), []);
  assert.deepEqual(attrNames(tree.children?.[5]), []);
});

void test('keeps ordinary attributes and tags untouched', () => {
  const tree = harden([
    el('div', [attr('id'), attr('class'), attr('data-x'), attr('title')]),
  ]);
  assert.deepEqual(names(tree), ['div']);
  assert.deepEqual(attrNames(tree.children?.[0]), [
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
  const tree: MdxJsxNode = {
    type: 'root',
    children: [{ type: 'mdxJsxFlowElement', name: 'p' }],
  };
  assert.doesNotThrow(() => {
    hardenRawHtml()(tree);
  });
});

// GFM task lists need <input> back in the components map, so this is the layer
// that has to keep dropping an authored one.
void test('drops authored input HTML even though the components map allows it', () => {
  const tree = harden([
    el('input', [attr('type'), attr('onchange')]),
    el('p', [], [el('input', [attr('type')]), text('kept')]),
  ]);
  assert.deepEqual(names(tree), ['p']);
  assert.deepEqual(names(tree.children?.[0]), ['text']);
});
