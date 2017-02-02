import jwtDecode from 'jwt-decode'

const MagnusSession = {

  getAccessToken (state) {
    if (state && state.session && state.session.accessToken) {
      return state.session.accessToken
    }
    return null
  },

  getIdToken (state) {
    if (state && state.session && state.session.idToken) {
      return state.session.idToken
    }
    return null
  },

  getIdTokenExpirationDate (state) {
    const idToken = MagnusSession.getIdToken(state)
    if (idToken) {
      try {
        const decoded = jwtDecode(idToken)
        if (typeof decoded.exp === 'undefined') {
          return null
        }
        const d = new Date(0)
        d.setUTCSeconds(decoded.exp)
        return d
      } catch (e) {
        return null
      }
    }
    return null
  },

  getIdTokenExpiresAfter (state) {
    const d = MagnusSession.getIdTokenExpirationDate(state)
    if (d === null) {
      return 0
    }
    return (d.valueOf() - (new Date().valueOf())) / 1000
  },

  getRefreshToken (state) {
    if (state && state.session && state.session.refreshToken) {
      return state.session.refreshToken
    }
    return null
  },

  isIdTokenExpired (state, offsetSeconds = 0) {
    const d = MagnusSession.getIdTokenExpirationDate(state)
    if (d === null) {
      return false
    }
    return !(d.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)))
  },

  isSessionExpired (state) {
    if (state && state.session && state.session.version !== state.version) {
      return true
    }
    return false
  }

}

export default MagnusSession
