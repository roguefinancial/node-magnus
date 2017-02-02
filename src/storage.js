import client from './client'
import localStorage from './localStorage'

const MagnusStorage = {

  get key () {
    return `magnus.${client.config.clientId}/session`
  },

  get local () {
    return localStorage
  },

  load () {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      let value = null
      try {
        value = JSON.parse(localStorage.getItem(MagnusStorage.key))
      } catch (e) {
        return null
      }
      return value
    }
    return null
  },

  dump (value) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(MagnusStorage.key, JSON.stringify(value))
    }
    return value
  }

}

export default MagnusStorage
