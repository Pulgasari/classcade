// @classcade/compiler/observer.js

// watches the document for added nodes and attribute changes, handing each
// change back to the runtime to (re)process. browser-only.

export class Observer {

  constructor (runtime) {
    this.runtime  = runtime;
    this.observer = null;
  }

  start () {
    if (this.observer) return;

    this.observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) this.runtime.process(node);
        });
        if (mutation.type === 'attributes') this.runtime.process(mutation.target);
      }
    });

    this.observer.observe(document.documentElement, {
      attributes : true,
      childList  : true,
      subtree    : true,
    });
  }

  stop () {
    this.observer?.disconnect();
    this.observer = null;
  }

}

export default Observer;
