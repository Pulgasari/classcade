// @classcade

export { default as Compiler }  from './compiler/index.js';
export { default as Classcade } from './runtime.js';

import Classcade from './runtime.js';

export function create (options = {}) {
  return new Classcade(options);
}

export default create;
