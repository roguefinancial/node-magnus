import magnus from './index.js'

export default {
  install (Vue, options = {}) {
    const clientConfig = ((options || {}).client) || {}
    Object.assign(magnus.client.config, clientConfig)
    magnus.loadSession().catch(() => null)
    Object.defineProperties(Vue.prototype, {
      $magnus: {
        get: function () {
          return magnus
        }
      }
    })
  }
}
