# @classcade/compiler

the classcade language pipeline. takes a class string, produces css. no dom, no
side effects — given the same registry and input it always returns the same
output.

```
import { Compiler } from '@classcade/compiler';

const cc = new Compiler();
cc.definePropAlias('bg', 'background-color');

cc.compile('bg[red]:hover[blue]');
```

## pipeline

`compile` runs three stages, each available on its own:

```
parse    source string -> ast
resolve  ast           -> css rule objects
generate rule object   -> css text
```

```javascript
const ast   = cc.parse('bg[red]');           // [{ type: 'rule', prop: 'bg', base: 'red', ... }]
const rules = cc.resolve(ast);               // [{ selector, declarations, media, ... }]
const css   = rules.map(r => cc.generate(r)); // ['.bg\\[red\\] { background-color: red }']
```

`compile(source)` is the three chained together and joined into one string.

## grammar

```
item    := prop value? segment* "!"?
segment := ":" variant value?
value   := "[" opaque "]"
```

the value between brackets is opaque css. the lexer scans a whole balanced
`[...]` as a single token and never looks inside it, so any css expression is
legal there — `calc()`, commas, function calls, hex colors, whitespace.

## registry

every registered entry is keyed by id and carries a `kind`:

| kind | example | effect |
| --- | --- | --- |
| `alias-prop` | `bg` -> `background-color` | property shorthand |
| `alias-fn` | `ld` -> `light-dark` | function-name shorthand inside a value |
| `shorthand` | `block` -> `{ display: block }` | a named bundle of declarations |
| `variant-media` | `md` -> `(min-width: 48rem)` | wraps the rule in `@media` |
| `variant-prefix` | `dark` -> `[data-theme="dark"] ` | prepends to the selector |
| `variant-suffix` | `hover` -> `:hover` | appends to the selector |

fn-aliases rewrite only the function *name* in a value. the arguments stay
opaque:

```
bg[ld(white black)]  ->  background-color: light-dark(white black)
```

## authoring api

```javascript
cc.definePropAlias('bg', 'background-color');
cc.defineFnAlias('ld', 'light-dark');

cc.defineMediaVariant('md', '(min-width: 48rem)');
cc.definePrefixVariant('dark', '[data-theme="dark"] ');
cc.defineSuffixVariant('hover', ':hover');
```

each returns the compiler, so calls chain.

### shorthands

`defineShorthand(id, spec)` accepts several spec forms:

```javascript
cc.defineShorthand('block',      { prop: 'display', value: 'block' });   // prop/value pair
cc.defineShorthand('sticky',     { position: 'sticky', top: '0' });      // flat object
cc.defineShorthand('centered',   'display: flex; align-items: center;'); // raw css string
cc.defineShorthand('ghost',      'bg[transparent]');                     // classcade string
cc.defineShorthand('stack',      [{ display: 'flex' }, 'gap[1rem]']);    // array of any of the above
```

classcade-string specs resolve recursively, so `ghost` above expands through the
`bg` alias to `background-color: transparent`.

### presets

a preset is a function that receives the compiler. group related registrations
and apply them with `use`:

```javascript
function myPreset (cc) {
  cc.definePropAlias('bg', 'background-color');
  cc.defineSuffixVariant('hover', ':hover');
}

cc.use(myPreset);
```

## semantics

- a token with per-state values produces one rule per valued state, all sharing
  the token's escaped string as their class selector.
- a variant segment without a value is skipped with a `console.warn` — it is not
  an error.
- `!` applies `!important` to every value in the token, base and states alike.
- a bare identifier with no value must resolve to a registered shorthand,
  otherwise resolution throws.

## dependencies

- `@cosmonaut/compiler` — lexer, token stream, token-type helpers.
- `@cosmonaut/parsers` — parser combinators.
