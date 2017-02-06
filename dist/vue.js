(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@potatosalad/magnus')) :
	typeof define === 'function' && define.amd ? define(['@potatosalad/magnus'], factory) :
	(global.VueMagnus = factory(global.magnus));
}(this, (function (magnus) { 'use strict';

magnus = 'default' in magnus ? magnus['default'] : magnus;

var vue = {
  install: function install(Vue) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var clientConfig = (options || {}).client || {};
    Object.assign(magnus.client.config, clientConfig);
    magnus.loadSession().catch(function () {
      return null;
    });
    Object.defineProperties(Vue.prototype, {
      $magnus: {
        get: function get() {
          return magnus;
        }
      }
    });
  }
};

return vue;

})));
//# sourceMappingURL=vue.js.map
