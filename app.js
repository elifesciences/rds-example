(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('substance'), require('substance-texture'), require('stencila')) :
  typeof define === 'function' && define.amd ? define(['substance', 'substance-texture', 'stencila'], factory) :
  (factory(global.window.substance,global.window.texture,global.window.stencila));
}(this, (function (substance,substanceTexture,stencila) { 'use strict';

  window.addEventListener('load', () => {
    substance.substanceGlobals.DEBUG_RENDERING = substance.platform.devtools;
    DevWebApp.mount({
      archiveId: substance.getQueryStringParam('archive') || 'kitchen-sink',
      storageType: substance.getQueryStringParam('storage') || 'vfs',
      storageUrl: substance.getQueryStringParam('storageUrl') || '/archives'
    }, window.document.body);
  });

  // This uses a monkey-patched VfsStorageClient that checks immediately
  // if the stored data could be loaded again, or if there is a bug in
  // Textures exporter
  class DevWebApp extends stencila.StencilaWebApp {

    _getStorage(storageType) {
      let storage = super._getStorage(storageType);
      if (storageType === 'vfs') {
        substanceTexture.vfsSaveHook(storage, stencila.StencilaArchive);
      }
      return storage
    }
  }

})));

//# sourceMappingURL=./app.js.map