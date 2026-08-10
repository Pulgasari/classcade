# @classcade/runtime

the browser layer for classcade. wraps `@classcade/compiler` with dom scanning,
deduplicated css injection, and live observation of the document.

```javascript
import { create } from '@classcade/runtime';
import { css, variants } from '@classcade/presets';

const cc = create();
cc.use(css).use(variants);
cc.start();
```

## what it does

`start()` scans the document once, compiles every class token it finds, injects
the resulting css into a single `<style>` element, then attaches a
`MutationObserver` so nodes and attributes added later are processed too. each
rule is injected at most once, keyed by its class string.

## api

`create(options)` returns a `Classcade` instance. `new Classcade(options)` works
too.

### options

- `attributes` — which attributes to read class tokens from. defaults to
  `['cc', 'class', 'classcade', 'className', 'data-classcade']`.
- `styleId` — the id of the injected `<style>` element. defaults to `classcade`.

### methods

- `use(preset)` — apply a preset. delegates to the compiler.
- `definePropAlias`, `defineFnAlias`, `defineShorthand`, `defineMediaVariant`,
  `definePrefixVariant`, `defineSuffixVariant` — delegate to the compiler's
  authoring api.
- `compile(source)` — compile a string to css without touching the dom.
- `process(root)` — scan a subtree, compile, and inject any unseen rules.
  called internally by `start` and the observer; call it directly to process a
  specific element.
- `start()` — process the whole document, then begin observing.
- `stop()` — disconnect the observer.

all authoring methods return the instance, so calls chain.

## relation to the compiler

the runtime holds a `Compiler` internally and forwards authoring calls to it.
for static builds or non-browser environments, use `@classcade/compiler`
directly — this package adds nothing but the dom plumbing.

## dependencies

- `@classcade/compiler`
