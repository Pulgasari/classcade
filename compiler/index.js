// @classcade/compiler/index.js

// the compiler owns the registry and wires the pipeline. two levels:
//
//   AUTHORING   define*/use   build up the registry (aliases, shorthands, variants)
//   PROCESSING  parse/resolve/generate/process   turn markup into css
//
// the registry is a flat Map keyed by id. every entry has a `kind`:
//   alias-prop | alias-fn | shorthand | variant-media | variant-prefix | variant-suffix

import Generator          from './generator.js';
import Parser             from './parser.js';
import Resolver           from './resolver.js';
import { normalizeKind }  from './normalizer.js';

export class Compiler {

  constructor () {
    this.registry  = new Map;
    this.parser    = new Parser;
    this.resolver  = new Resolver(this.registry);
    this.generator = new Generator;
  }

  // :::::: Registry

  add (entry) { this.registry.set(entry.id, entry); return this; }
  get (id)    { return this.registry.get(id); }
  has (id)    { return this.registry.has(id); }

  // :::::: Authoring api

  // bg -> background-color
  definePropAlias (alias, ref) {
    return this.add({ id: alias, kind: 'alias-prop', ref });
  }

  // ld -> light-dark
  defineFnAlias (alias, ref) {
    return this.add({ id: alias, kind: 'alias-fn', ref });
  }

  // block -> { display: block }
  // spec may be a classcade string, a raw css string, a { prop, value } pair,
  // a flat { prop: value } object, or an array of any of these.
  defineShorthand (id, spec) {
    const declarations = normalizeSpec(spec, str => this.resolveDeclarations(str));
    return this.add({ id, kind: 'shorthand', declarations });
  }

  // md -> @media (min-width: 48rem)
  defineMediaVariant (id, query) {
    return this.add({ id, kind: 'variant-media', query });
  }

  // dark -> [data-theme="dark"] &
  definePrefixVariant (id, selector) {
    return this.add({ id, kind: 'variant-prefix', selector });
  }

  // hover -> &:hover
  defineSuffixVariant (id, selector) {
    return this.add({ id, kind: 'variant-suffix', selector });
  }

  // generic entry point used by presets that carry an explicit kind.
  define (kind, id, payload) {
    const canonical = normalizeKind(kind);
    switch (canonical) {
      case 'alias-prop'     : return this.definePropAlias(id, payload);
      case 'alias-fn'       : return this.defineFnAlias(id, payload);
      case 'variant-media'  : return this.defineMediaVariant(id, payload);
      case 'variant-prefix' : return this.definePrefixVariant(id, payload);
      case 'variant-suffix' : return this.defineSuffixVariant(id, payload);
      default: throw new Error(`[classcade] Unknown kind "${kind}".`);
    }
  }

  use (preset) { preset(this); return this; }

  // :::::: Pipeline

  parse    (source) { return this.parser.parse(source); }
  resolve  (ast)    { return this.resolver.resolve(ast); }
  generate (rule)   { return this.generator.generate(rule); }

  // full source string -> css text (all rules, joined).
  compile (source) {
    const rules = this.resolve(this.parse(source));
    return rules.map(rule => this.generate(rule)).join('\n\n');
  }

  // turns a classcade string into a flat { prop: value } object, without any
  // selector or media wrapping. used by defineShorthand for recursive
  // references like defineShorthand('ghost', 'bg[transparent]').
  resolveDeclarations (source) {
    const rules = this.resolve(this.parse(source));
    return rules.reduce((acc, rule) => Object.assign(acc, rule.declarations), {});
  }

}

export default Compiler;

// :::::: Spec normalization

// recognizes raw css ("prop: value; ...") vs a classcade string ("bg[red]").
// heuristic: a string with no "[" that matches "ident:" is raw css.
function looksLikeCss (str) {
  return !str.includes('[') && /^[a-zA-Z-]+\s*:/.test(str);
}

function fromCssString (str) {
  return str.split(';').map(s => s.trim()).filter(Boolean).reduce((acc, decl) => {
    const i = decl.indexOf(':');
    if (i === -1) return acc;
    acc[decl.slice(0, i).trim()] = decl.slice(i + 1).trim();
    return acc;
  }, {});
}

export function normalizeSpec (spec, resolveClasscadeString) {
  if (spec == null) return {};

  if (Array.isArray(spec)) {
    return spec.reduce((acc, s) => Object.assign(acc, normalizeSpec(s, resolveClasscadeString)), {});
  }

  if (typeof spec === 'object') {
    if ('prop' in spec && 'value' in spec) return { [spec.prop]: spec.value };
    return { ...spec }; // already a flat { prop: value }
  }

  if (typeof spec === 'string') {
    const trimmed = spec.trim();
    return looksLikeCss(trimmed) ? fromCssString(trimmed) : resolveClasscadeString(trimmed);
  }

  throw new Error(`[classcade] Cannot normalize spec: ${JSON.stringify(spec)}`);
}
