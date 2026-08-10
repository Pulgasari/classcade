// @classcade/runtime

// the browser-facing runtime. @classcade/compiler is pure (source -> css);
// this wraps it with dom scanning, deduped injection, and live observation.
//
//   import { create } from '@classcade/runtime';
//   import { css, variants } from '@classcade/presets';
//
//   const cc = create();
//   cc.use(css).use(variants);
//   cc.start();   // scan once, then observe

import { Compiler } from '@classcade/compiler';
import Injector from './injector.js';
import Observer from './observer.js';
import Scanner  from './scanner.js';

const DEFAULT_ATTRIBUTES = ['classcade', 'cc'];

export class Classcade {

  constructor (options = {}) {
    this.compiler = new Compiler();
    this.injector = new Injector({ styleId: options.styleId });
    this.observer = new Observer(this);
    this.scanner  = new Scanner({ attributes: options.attributes ?? DEFAULT_ATTRIBUTES });
  }

  // :::::: Authoring — delegate to the compiler

  use (preset) { this.compiler.use(preset); return this; }

  definePropAlias     (...a) { this.compiler.definePropAlias(...a);     return this; }
  defineFnAlias       (...a) { this.compiler.defineFnAlias(...a);       return this; }
  defineShorthand     (...a) { this.compiler.defineShorthand(...a);     return this; }
  defineMediaVariant  (...a) { this.compiler.defineMediaVariant(...a);  return this; }
  definePrefixVariant (...a) { this.compiler.definePrefixVariant(...a); return this; }
  defineSuffixVariant (...a) { this.compiler.defineSuffixVariant(...a); return this; }

  // :::::: Static compilation — no dom

  compile (source) { return this.compiler.compile(source); }

  // :::::: Live processing

  // scan a subtree, compile every attribute value, inject unseen rules.
  // parsing is strict per attribute: a single malformed token fails the whole
  // attribute (nothing from it is injected). the failure is isolated to that
  // attribute so the rest of the batch still processes.
  process (root) {
    for (const { attribute, value } of this.scanner.scan(root)) {
      try {
        const rules = this.compiler.resolve(this.compiler.parse(value));
        for (const rule of rules) {
          if (this.injector.has(rule.id)) continue;
          this.injector.inject(rule.id, this.compiler.generate(rule));
        }
      } catch (error) {
        console.error(`[classcade] Failed to compile ${attribute}="${value}":`, error.message);
      }
    }
  }

  start () { this.process(); this.observer.start(); return this; }
  stop  () { this.observer.stop(); return this; }

}

export default Classcade;

export function create (options = {}) {
  return new Classcade(options);
}
