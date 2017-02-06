import magnus from '@potatosalad/magnus';

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

export default vue;
//# sourceMappingURL=vue.mjs.map
