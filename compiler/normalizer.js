// @classcade/compiler/normalizer.js

// maps the many human-friendly spellings of a registry "kind" onto the one
// canonical form the resolver checks against.

const KIND_ALIASES = {
  // alias-fn
  'alias-fn' : 'alias-fn', 'aliasFn' : 'alias-fn', 'fn' : 'alias-fn',
  // alias-prop
  'alias-prop' : 'alias-prop', 'aliasProp' : 'alias-prop', 'prop' : 'alias-prop',
  // variant-media
  'variant-media' : 'variant-media', 'variantMedia' : 'variant-media', 'media' : 'variant-media',
  // variant-prefix
  'variant-prefix' : 'variant-prefix', 'variantPrefix' : 'variant-prefix', 'prefix' : 'variant-prefix',
  // variant-suffix
  'variant-suffix' : 'variant-suffix', 'variantSuffix' : 'variant-suffix', 'suffix' : 'variant-suffix',
};

export class Normalizer {
  static kind (kind) {
    return KIND_ALIASES[kind] ?? null;
  }
}

export function normalizeKind (kind) {
  return Normalizer.kind(kind);
}

export default Normalizer;
