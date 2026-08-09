// @classcade/runtime/injector.js

// owns the generated stylesheet. keeps a set of already-injected rule ids so
// the same class is never emitted twice, and appends new css to a single
// <style> element in the document head.

export class Injector {

  constructor (options = {}) {
    this.styleId  = options.styleId ?? 'classcade';
    this.injected = new Set();
    this.element  = null;
  }

  has (id) { return this.injected.has(id); }

  inject (id, css) {
    if (this.injected.has(id)) return false;
    this.injected.add(id);
    this.sheet().appendChild(document.createTextNode(`${css}\n`));
    return true;
  }

  // lazily creates (or reuses) the target <style> element.
  sheet () {
    if (this.element) return this.element;

    this.element = document.getElementById(this.styleId);
    if (!this.element) {
      this.element = document.createElement('style');
      this.element.id = this.styleId;
      document.head.appendChild(this.element);
    }
    return this.element;
  }

}

export default Injector;
