// @classcade/compiler/parser.js

// source string -> ast. one class-attribute value like
// "bg[red]:hover[blue] block flex[1]!" becomes a flat list of item nodes.
//
// grammar (per item):
//
//   item    := prop value? segment* "!"?
//   segment := ":" variant value?
//   value   := "[" opaque "]"
//   prop    := IDENTIFIER
//   variant := IDENTIFIER
//
// the value between brackets is OPAQUE css and is never tokenized further —
// it may contain calc(), commas, spaces, functions, hex colors, anything.
// the lexer scans a whole balanced "[...]" as one BRACKET token whose value
// is the inner text without the brackets.

import { Lexer, TokenStream, buildTokenTypes, resolveRules } from '@cosmonaut/compiler';
import { many, many1, map, optional, seq, token }            from '@cosmonaut/parsers';

// :::::: Token types

const tokenTypes = buildTokenTypes(['BRACKET']);

// :::::: Lexer

// a balanced bracket group, depth-counted so nested "[...]" inside a value
// (rare, but legal in css like attr selectors) does not close early. emits
// the INNER text as the token value.
const bracketValue = {
  id   : 'bracket',
  type : tokenTypes.BRACKET,
  match (input, pos) {
    if (input[pos] !== '[') return null;

    let depth = 0;
    for (let i = pos; i < input.length; i++) {
      if      (input[i] === '[') depth++;
      else if (input[i] === ']') { depth--; if (depth === 0) return i - pos + 1; }
    }
    throw new SyntaxError(`[classcade] Unclosed bracket at position ${pos}.`);
  },
};

const identifier = {
  id    : 'identifier',
  type  : tokenTypes.IDENTIFIER,
  regex : /[a-zA-Z_][a-zA-Z0-9_-]*/,
};

function createLexer (source) {
  return new Lexer(source, {
    tokenTypes,
    puncts         : [':', '!'],
    rules          : resolveRules([bracketValue, identifier]),
    skipWhitespace : true,
  });
}

// :::::: Combinators

// a BRACKET token's value still carries its outer "[" "]" — strip them here
// so downstream sees only the opaque inner css.
const inner = raw => raw.slice(1, -1);

const value = map(token(tokenTypes.BRACKET), tok => inner(tok.value));

// ":" variant value?  ->  { variant, value }
const segment = map(
  seq(token(':'), token(tokenTypes.IDENTIFIER), optional(value)),
  ([, id, val]) => ({ variant: id.value, value: val }),
);

// prop value? segment* "!"?
const item = map(
  seq(token(tokenTypes.IDENTIFIER), optional(value), many(segment), optional(token('!'))),
  ([prop, base, segments, bang]) => ({
    type      : 'rule',
    prop      : prop.value,
    base      : base,             // string | null
    states    : segments,         // [{ variant, value }]
    important : bang !== null,
    raw       : rebuild(prop.value, base, segments, bang !== null),
  }),
);

const classList = many1(item);

// canonical string form, reused verbatim as the css class selector so the
// generated selector always round-trips back to what stood in the markup.
function rebuild (prop, base, segments, important) {
  let out = prop;
  if (base !== null) out += `[${base}]`;
  for (const s of segments) out += `:${s.variant}${s.value !== null ? `[${s.value}]` : ''}`;
  if (important) out += '!';
  return out;
}

// :::::: Parser

export class Parser {

  parse (source) {
    const tokens = createLexer(source).tokenize();
    const stream = new TokenStream(tokens);
    const result = classList(stream);

    if (result === undefined || !stream.eof()) {
      throw new SyntaxError(`[classcade] Failed to parse "${source}" at token ${stream.index}.`);
    }
    return result;
  }

}

export default Parser;
