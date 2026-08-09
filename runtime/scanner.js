// @classcade/runtime/scanner.js

// walks a dom subtree and collects the raw values of the configured class
// attributes. each entry is { node, attribute, value }.

function getRuntimeContext () {
  return typeof document !== 'undefined' ? 'browser' : 'unknown';
}

export class Scanner {

  constructor (options = {}) {
    this.attributes = options.attributes ?? [];
  }

  scan (root) {
    switch (getRuntimeContext()) {
      case 'browser' : return this.scanDOM(root ?? document);
      default        : return [];
    }
  }

  scanDOM (root = document) {
    const entries = [];

    // an element node is scanned directly; then all descendants carrying any
    // of the target attributes.
    if (root.nodeType === 1) this.scanNode(root, entries);

    const selector = this.attributes.map(attr => `[${attr}]`).join(', ');
    if (selector) root.querySelectorAll(selector).forEach(node => this.scanNode(node, entries));

    return entries;
  }

  scanNode (node, entries) {
    for (const attribute of this.attributes) {
      if (!node.hasAttribute(attribute)) continue;
      entries.push({ node, attribute, value: node.getAttribute(attribute) });
    }
  }

}

export default Scanner;
