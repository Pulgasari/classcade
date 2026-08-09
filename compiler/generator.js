// @classcade/compiler/generator.js

// css rule object -> css text. a rule is
//   { selector, declarations, media, layer, supports }
// media/layer/supports wrap the rule block when present.

export class Generator {

  generate (rule) {
    const body = this.block(rule.selector, rule.declarations);
    return rule.media ? this.wrap(`@media ${rule.media}`, body) : body;
  }

  block (selector, declarations) {
    const lines = Object.entries(declarations).map(([prop, value]) => `  ${prop}: ${value};`);
    return `${selector} {\n${lines.join('\n')}\n}`;
  }

  // indents an inner block one level under an at-rule wrapper.
  wrap (atRule, body) {
    const indented = body.split('\n').map(line => `  ${line}`).join('\n');
    return `${atRule} {\n${indented}\n}`;
  }

}

export default Generator;
