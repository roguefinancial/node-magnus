import actions from './actions'
import client from './client'
import session from './session'
import storage from './storage'
import store from './store'
import util from './util'

class Magnus {
  constructor () {
    this.subscription = this.store.subscribe(() => {
      this.storage.dump(this.state.session)
    })
  }

  get client () {
    return client
  }

  get expiresAfter () {
    return session.getIdTokenExpiresAfter(this.state)
  }

  get session () {
    const state = this.state
    return (state.session) ? state.session : null
  }

  get storage () {
    return storage
  }

  get state () {
    return this.store.getState().magnus
  }

  get store () {
    return store
  }

  get util () {
    return util
  }

  authenticate (force = false) {
    return store.dispatch(actions.authenticate(force))
  }

  loadSession () {
    return store.dispatch(actions.loadSession())
  }

  signin (options) {
    return store.dispatch(actions.signin(options))
  }

  signout () {
    return store.dispatch(actions.signout())
  }

  // subscribe only to changes to authentication state
  subscribe (listener) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function')
    }
    let isAuthenticated = (() => {
      const state = this.state
      if (state.isAuthenticated && state.requests === 0) {
        listener()
        return state.isAuthenticated
      }
      return null
    })()
    return this.store.subscribe(() => {
      const state = this.state
      if (state.requests === 0 && state.isAuthenticated !== isAuthenticated) {
        isAuthenticated = state.isAuthenticated
        listener()
      }
    })
  }
}

const magnus = new Magnus()

export default magnus
