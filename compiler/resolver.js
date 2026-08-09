// @classcade/compiler/resolver.js

// ast -> css rules. the core semantic of classcade lives here: one token is
// a single property whose value can change per state. so
//
//   bg[red]:hover[blue]
//
// resolves to TWO css rules that SHARE ONE class selector (the whole escaped
// token string), differing only in the trailing variant selector:
//
//   .bg\[red\]\:hover\[blue\]        { background-color: red }
//   .bg\[red\]\:hover\[blue\]:hover  { background-color: blue }
//
// a state without its own value (bg[red]:hover) contributes no new value —
// it is skipped with a console.warn, not an error.

import { arrayfied } from './utils.js';

// characters that are legal in a classcade token but must be escaped to sit
// inside a css class selector.
function escapeSelector (raw) {
  return raw.replace(/[\[\]():,.!#%/\s+*]/g, ch => `\\${ch}`);
}

export class Resolver {

  constructor (registry) {
    this.registry = registry;
  }

  resolve (ast) {
    return arrayfied(ast).flatMap(node => this.resolveNode(node));
  }

  resolveNode (node) {
    if (node.type === 'rule') return this.resolveRule(node);
    throw new Error(`[classcade] Unknown node type "${node.type}".`);
  }

  // returns an array of css rules: one base rule plus one per valued state.
  resolveRule (node) {
    const selectorBase = `.${escapeSelector(node.raw)}`;
    const rules = [];

    // base rule — a property with a value, or a value-less shorthand.
    const baseDeclarations = this.declarationsFor(node.prop, node.base, node.important);
    rules.push(this.makeRule(node.raw, selectorBase, baseDeclarations, null));

    // one rule per state that carries its own value.
    for (const state of node.states) {
      if (state.value === null) {
        // a variant without a value cannot override anything — ignore it, but
        // tell the developer, since it is almost certainly a mistake.
        console.warn(`[classcade] Variant ":${state.variant}" in "${node.raw}" has no value and was ignored.`);
        continue;
      }

      const declarations = this.declarationsFor(node.prop, state.value, node.important);
      const wrapped      = this.applyVariant(state.variant, selectorBase, declarations);
      rules.push(this.makeRule(node.raw, wrapped.selector, wrapped.declarations, wrapped.media));
    }

    return rules;
  }

  // resolves { prop, value } into a flat css declaration object, applying
  // prop-aliases, fn-aliases, shorthands, and !important.
  declarationsFor (prop, value, important) {
    let declarations;

    if (value === null) {
      // no value -> must be a registered shorthand.
      const def = this.registry.get(prop);
      if (!def || def.kind !== 'shorthand') {
        throw new Error(`[classcade] "${prop}" has no value and is not a registered shorthand.`);
      }
      declarations = { ...def.declarations };
    } else {
      const alias   = this.registry.get(prop);
      const cssProp = alias?.kind === 'alias-prop' ? alias.ref : prop;
      declarations  = { [cssProp]: this.resolveValue(value) };
    }

    return important ? withImportant(declarations) : declarations;
  }

  // rewrites registered fn-aliases inside a raw value:
  //   "ld(white black)" -> "light-dark(white black)"
  // only the function NAME is touched; the arguments stay opaque css.
  resolveValue (raw) {
    return raw.replace(/([a-zA-Z_-][a-zA-Z0-9_-]*)\(/g, (match, name) => {
      const def = this.registry.get(name);
      return def?.kind === 'alias-fn' ? `${def.ref}(` : match;
    });
  }

  // applies a variant onto a selector + declarations. three kinds:
  //   suffix -> ".sel:hover"          (pseudo-class / -element)
  //   prefix -> "[data-theme=dark] .sel"
  //   media  -> declarations wrapped under an @media query
  // an unknown variant falls back to a naive pseudo-class suffix.
  applyVariant (name, selector, declarations) {
    const def = this.registry.get(name);

    if (def?.kind === 'variant-media')  return { selector, declarations, media: def.query };
    if (def?.kind === 'variant-prefix') return { selector: `${def.selector}${selector}`, declarations, media: null };
    if (def?.kind === 'variant-suffix') return { selector: `${selector}${def.selector}`, declarations, media: null };

    return { selector: `${selector}:${name}`, declarations, media: null };
  }

  makeRule (id, selector, declarations, media) {
    return { id, selector, declarations, media, layer: null, supports: null };
  }

}

function withImportant (declarations) {
  return Object.fromEntries(
    Object.entries(declarations).map(([k, v]) => [k, `${v} !important`]),
  );
}

export default Resolver;
