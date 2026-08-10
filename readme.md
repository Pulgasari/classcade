# classcade

classcade is a css compiler. it reads class strings written in a small,
explicit syntax and emits plain css. the class *is* the css: `bg[red]` means
`background-color: red`, not a lookup into a predefined palette.

this differs from utility frameworks like tailwind. tailwind is a token layer
over css — every class name maps to a value from a curated design system, and
arbitrary values are the escape hatch. classcade is a syntax layer over css —
arbitrary values are the normal case, and the only indirection is aliasing and
shorthands you register yourself. there is no built-in spacing scale and no
color palette.

## syntax

```
prop[value]:variant[value]:variant[value]!
```

a token is one property whose value can change per state:

```
bg[red]:hover[blue]
```

compiles to two rules that share one class selector:

```css
.bg\[red\]\:hover\[blue\]        { background-color: red }
.bg\[red\]\:hover\[blue\]:hover  { background-color: blue }
```

- `prop[value]` — a property and its value. the value is opaque css and is
  passed through untouched (`w[calc(100% - 2rem)]`).
- `:variant[value]` — a state with its own value. a variant without a value is
  ignored with a warning, since it cannot override anything.
- `!` — marks every value in the token `!important`.
- a bare identifier (`block`) is a registered shorthand.

## packages

each package is published to jsr under the `@classcade` scope.

| package | purpose | depends on |
| --- | --- | --- |
| [`@classcade/compiler`](../compiler/readme.md) | the language pipeline: parse, resolve, generate. pure, no dom. | `@cosmonaut/compiler`, `@cosmonaut/parsers` |
| [`@classcade/presets`](../presets/readme.md) | ready-made aliases and variants. | nothing |
| [`@classcade/runtime`](../runtime/readme.md) | the browser layer: scan the dom, inject css, observe changes. | `@classcade/compiler` |

use `@classcade/compiler` alone to turn strings into css. add
`@classcade/runtime` to drive it from a live document.

## quick start

browser:

```javascript
import { create } from '@classcade/runtime';
import { css, variants } from '@classcade/presets';

const cc = create();
cc.use(css).use(variants);
cc.start();
```

headless (string to css):

```javascript
import { Compiler } from '@classcade/compiler';
import { css } from '@classcade/presets';

const cc = new Compiler();
cc.use(css);

cc.compile('bg[red]:hover[blue]');
```


##

### node

```javascript
const html = await fs.readFile("index.html", "utf8");
const css  = classcade.compile(html);

await fs.writeFile("classcade.css", css);
```

### deno

```javascript
const html = await Deno.readTextFile("index.html");
const css  = classcade.compile(html);

await Deno.writeTextFile("classcade.css", css);
```

### browser

```javascript
const html = document.documentElement.outerHTML;
const css  = classcade.compile(html);
```

### vite

```javascript
transform (html) {
  return classcade.compile(html);
}
```

### rollup

```javascript
transform (html) {
  return classcade.compile(html);
}
```
