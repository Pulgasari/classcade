// @classcade/runtime.js

// the browser-facing runtime. the Compiler is pure (source -> css); this
// wraps it with dom scanning, deduped injection, and live observation.
//
//   const cc = new Classcade();
//   cc.use(css).use(variants);
//   cc.start();   // scan once, then observe

import Compiler from './compiler/index.js';
import Injector from './compiler/injector.js';
import Observer from './compiler/observer.js';
import Scanner  from './compiler/scanner.js';

const DEFAULT_ATTRIBUTES = ['cc', 'class', 'classcade', 'className', 'data-classcade'];

export class Classcade {

  constructor (options = {}) {
    this.compiler = new Compiler();
    this.injector = new Injector({ styleId: options.styleId });
    this.observer = new Observer(this);
    this.scanner  = new Scanner({ attributes: options.attributes ?? DEFAULT_ATTRIBUTES });
  }

  // :::::: Authoring — delegate to the compiler

  use (preset) { this.compiler.use(preset); return this; }

  definePropAlias   (...a) { this.compiler.definePropAlias(...a);   return this; }
  defineFnAlias     (...a) { this.compiler.defineFnAlias(...a);     return this; }
  defineShorthand   (...a) { this.compiler.defineShorthand(...a);   return this; }
  defineMediaVariant  (...a) { this.compiler.defineMediaVariant(...a);  return this; }
  definePrefixVariant (...a) { this.compiler.definePrefixVariant(...a); return this; }
  defineSuffixVariant (...a) { this.compiler.defineSuffixVariant(...a); return this; }

  // :::::: Static compilation — no dom

  compile (source) { return this.compiler.compile(source); }

  // :::::: Live processing

  // scan a subtree, compile every attribute value, inject unseen rules.
  process (root) {
    for (const { value } of this.scanner.scan(root)) {
      const rules = this.compiler.resolve(this.compiler.parse(value));
      for (const rule of rules) {
        if (this.injector.has(rule.id)) continue;
        this.injector.inject(rule.id, this.compiler.generate(rule));
      }
    }
  }

  start () { this.process(); this.observer.start(); return this; }
  stop  () { this.observer.stop(); return this; }

}

export default Classcade;
