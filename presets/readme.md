# @classcade/presets

ready-made registrations for classcade. each preset is a function that receives
a compiler and registers aliases, shorthands, or variants onto it. this package
has no dependencies — it only calls the compiler's authoring api.

```javascript
import { Compiler } from '@classcade/compiler';
import { css, variants } from '@classcade/presets';

const cc = new Compiler();
cc.use(css).use(variants);
```

## exports

### `css`

common property and function aliases.

- property aliases: `bg`, `fg`, `w`, `h`, `m`, `p`, `d`, `pos`.
- function aliases: `ld` (light-dark), `mix` (color-mix), `var`, `clamp`.

```
bg[red]                       ->  background-color: red
bg[mix(in oklch, red, blue)]  ->  background-color: color-mix(in oklch, red, blue)
```

### `variants`

state, theme, and breakpoint variants.

- suffix variants: `hover`, `focus`, `focus-within`, `active`, `disabled`,
  `visited`, `checked`, `first`, `last`, `odd`, `even`.
- prefix variant: `dark` (`[data-theme="dark"]`).
- media variants from `breakpoints`: `sm`, `md`, `lg`, `xl`.

### `breakpoints`

the breakpoint token map the `variants` preset draws from. exported separately
so you can register your own media variants without the rest of the preset.

```javascript
import { breakpoints } from '@classcade/presets';

for (const [name, query] of Object.entries(breakpoints)) {
  cc.defineMediaVariant(name, query);
}
```

## writing your own

a preset is just a function. nothing here is special — copy the pattern:

```javascript
export default function myPreset (cc) {
  cc.definePropAlias('bd', 'border');
  cc.defineShorthand('row', { display: 'flex', 'flex-direction': 'row' });
}
```
