// @classcade/presets/css.js

// common property and function aliases. a preset is just a function that
// receives the compiler and registers onto it.

export default function cssPreset (cc) {

  // :::::: Property aliases

  cc.definePropAlias('bg', 'background-color');
  cc.definePropAlias('fg', 'color');
  cc.definePropAlias('w',  'width');
  cc.definePropAlias('h',  'height');
  cc.definePropAlias('m',  'margin');
  cc.definePropAlias('p',  'padding');
  cc.definePropAlias('d',  'display');
  cc.definePropAlias('pos', 'position');

  // :::::: Function aliases

  cc.defineFnAlias('ld',  'light-dark');
  cc.defineFnAlias('mix', 'color-mix');
  cc.defineFnAlias('var', 'var');
  cc.defineFnAlias('clamp', 'clamp');
}

/*
this.add({ id, kind: 'alias-prop', ref }); // definePropAlias
this.add({ id, kind: 'alias-fn',   ref }); // defineFnAlias
this.add({ id, kind: 'variant-media',  query    : def.media  });
this.add({ id, kind: 'variant-prefix', selector : def.prefix });
this.add({ id, kind: 'variant-suffix', selector : def.suffix });
*/
