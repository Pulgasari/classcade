// @classcade/presets/variants.js

// state, theme and breakpoint variants. registered through the compiler's
// define* api so every entry carries the correct kind.

import { breakpoints } from './tokens.js';

export default function variantsPreset (cc) {

  // :::::: State (suffix) variants

  cc.defineSuffixVariant('hover',        ':hover');
  cc.defineSuffixVariant('focus',        ':focus');
  cc.defineSuffixVariant('focus-within', ':focus-within');
  cc.defineSuffixVariant('active',       ':active');
  cc.defineSuffixVariant('disabled',     ':disabled');
  cc.defineSuffixVariant('visited',      ':visited');
  cc.defineSuffixVariant('checked',      ':checked');
  cc.defineSuffixVariant('first',        ':first-child');
  cc.defineSuffixVariant('last',         ':last-child');
  cc.defineSuffixVariant('odd',          ':nth-child(odd)');
  cc.defineSuffixVariant('even',         ':nth-child(even)');

  // :::::: Theme (prefix) variant

  cc.definePrefixVariant('dark', '[data-theme="dark"] ');

  // :::::: Breakpoint (media) variants

  for (const [name, query] of Object.entries(breakpoints)) {
    cc.defineMediaVariant(name, query);
  }
}

/*
// presets/variants.js
import { breakpoints } from './tokens.js';

export default function variantsPreset (cc) {
  cc.add({ id: 'hover',         suffix: ':hover' });
  cc.add({ id: 'focus',         suffix: ':focus' });
  cc.add({ id: 'focus-within',  suffix: ':focus-within' });
  cc.add({ id: 'active',        suffix: ':active' });
  cc.add({ id: 'disabled',      suffix: ':disabled' });
  cc.add({ id: 'visited',       suffix: ':visited' });
  cc.add({ id: 'checked',       suffix: ':checked' });
  cc.add({ id: 'first',         suffix: ':first-child' });
  cc.add({ id: 'last',          suffix: ':last-child' });
  cc.add({ id: 'odd',           suffix: ':nth-child(odd)' });
  cc.add({ id: 'even',          suffix: ':nth-child(even)' });

  cc.add({ id: 'dark', prefix: '[data-theme="dark"] ' });

  for (const [name, query] of Object.entries(breakpoints)) {
    cc.add({ id: name, media: query });
  }
}
*/
