import MagnusClient from './client'
import { MagnusError } from './error'
import MagnusSession from './session'
import MagnusStorage from './storage'

/* eslint-disable key-spacing, no-multi-spaces */

/* Action Types */

export const AUTHENTICATE_REQUEST = 'AUTHENTICATE_REQUEST'
export const AUTHENTICATE_SUCCESS = 'AUTHENTICATE_SUCCESS'
export const AUTHENTICATE_FAILURE = 'AUTHENTICATE_FAILURE'
export const LOAD_SESSION_REQUEST = 'LOAD_SESSION_REQUEST'
export const LOAD_SESSION_SUCCESS = 'LOAD_SESSION_SUCCESS'
export const LOAD_SESSION_FAILURE = 'LOAD_SESSION_FAILURE'
export const SIGN_IN_REQUEST      = 'SIGN_IN_REQUEST'
export const SIGN_IN_SUCCESS      = 'SIGN_IN_SUCCESS'
export const SIGN_IN_FAILURE      = 'SIGN_IN_FAILURE'
export const SIGN_OUT_REQUEST     = 'SIGN_OUT_REQUEST'
export const SIGN_OUT_SUCCESS     = 'SIGN_OUT_SUCCESS'
export const SIGN_OUT_FAILURE     = 'SIGN_OUT_FAILURE'

/* Action Creators */

function authenticateRequest () {
  return {
    type: AUTHENTICATE_REQUEST,
    payload: null
  }
}

function authenticateSuccess (session) {
  return {
    type: AUTHENTICATE_SUCCESS,
    payload: {
      session
    }
  }
}

function authenticateFailure (error) {
  return {
    type: AUTHENTICATE_FAILURE,
    payload: {
      error
    }
  }
}

function loadSessionRequest () {
  return {
    type: LOAD_SESSION_REQUEST,
    payload: null
  }
}

function loadSessionSuccess (session) {
  return {
    type: LOAD_SESSION_SUCCESS,
    payload: {
      session
    }
  }
}

function loadSessionFailure (error) {
  return {
    type: LOAD_SESSION_FAILURE,
    payload: {
      error
    }
  }
}

function signinRequest () {
  return {
    type: SIGN_IN_REQUEST,
    payload: null
  }
}

function signinSuccess (session) {
  return {
    type: SIGN_IN_SUCCESS,
    payload: {
      session
    }
  }
}

function signinFailure (error) {
  return {
    type: SIGN_IN_FAILURE,
    payload: {
      error
    }
  }
}

function signoutRequest () {
  return {
    type: SIGN_OUT_REQUEST,
    payload: null
  }
}

function signoutSuccess (session) {
  return {
    type: SIGN_OUT_SUCCESS,
    payload: {
      session
    }
  }
}

function signoutFailure (error) {
  return {
    type: SIGN_OUT_FAILURE,
    payload: {
      error
    }
  }
}

/* Actions */

export const MagnusActions = {

  authenticate (force = false) {
    return (dispatch, getState) => {
      const { magnus: state } = getState()
      if (state.isAuthenticated === true && state.session && force === false && state.session.tokeninfo) {
        return Promise.resolve(authenticateSuccess(state.session))
      }
      dispatch(authenticateRequest())
      return dispatch(_authenticate())
        .then((session) => dispatch(authenticateSuccess(session)))
        .catch((error) => Promise.reject(dispatch(authenticateFailure(error))))
    }
  },

  loadSession () {
    return (dispatch) => {
      const session = MagnusStorage.load()
      dispatch(loadSessionRequest())
      if (typeof session !== 'undefined' && session !== null) {
        return Promise.resolve(dispatch(loadSessionSuccess(session)))
      } else {
        return Promise.reject(dispatch(loadSessionFailure(new MagnusError('invalid session'))))
      }
    }
  },

  signin (opts) {
    const options = Object.assign({}, opts)
    return (dispatch) => {
      dispatch(signinRequest())
      return _signin(options)
        .then((data) => _userinfo(data))
        .then((session) => dispatch(signinSuccess(session)))
        .catch((error) => Promise.reject(dispatch(signinFailure(error))))
    }
  },

  signout () {
    return (dispatch, getState) => {
      const { magnus: state } = getState()
      dispatch(signoutRequest())
      return _signout()
        .then(() => dispatch(signoutSuccess(state.session)))
        .catch((error) => Promise.reject(dispatch(signoutFailure(error))))
    }
  }

}

/** Authenticate **/

function _authenticate () {
  return (dispatch) => {
    return dispatch(_authenticateWithTokeninfo())
      .catch((error) => {
        if (error.message === 'invalid token') {
          return dispatch(_authenticateWithSSO())
        }
        return Promise.reject(error)
      })
  }
}

function _authenticateWithTokeninfo () {
  return (dispatch, getState) => {
    dispatch
    const { magnus: state } = getState()
    const idToken = MagnusSession.getIdToken(state)
    if (idToken && !MagnusSession.isSessionExpired(state) && !MagnusSession.isIdTokenExpired(state)) {
      return MagnusClient.fetch('/tokeninfo', {
        body: JSON.stringify({
          id_token: idToken
        }),
        cache: 'no-cache',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        method: 'POST',
        mode: 'cors',
        options: {
          authorization: false
        }
      })
        .then((response) => response.json())
        .then((tokeninfo) => {
          return {
            ...state.session,
            tokeninfo
          }
        })
        .catch((error) => {
          if (error && error.status && error.status !== 401 && (state.session.tokeninfo || state.session.userinfo)) {
            return {
              ...state.session,
              tokeninfo: state.session.tokeninfo || state.session.userinfo
            }
          }
          return Promise.reject(new MagnusError('bad tokeninfo response', error))
        })
    }
    return Promise.reject(new MagnusError('invalid token'))
  }
}

function _authenticateWithSSO () {
  return (dispatch) => {
    return MagnusClient.fetch('/user/ssodata', {
      cache: 'no-cache',
      credentials: 'include',
      method: 'GET',
      mode: 'cors',
      options: {
        authorization: false
      }
    })
      .then((response) => response.json())
      .then((json) => {
        if (json && json.lastUsedConnection && json.lastUsedConnection.name && json.sso === true) {
          const options = {
            connection: json.lastUsedConnection.name,
            sso: true
          }
          return dispatch(MagnusActions.signin(options)).then(({ payload: { session } }) => {
            return session
          })
        }
        return Promise.reject(json)
      })
      .catch((error) => {
        return Promise.reject(new MagnusError('invalid SSO', error))
      })
  }
}

/** Sign-In **/

function _signin (options) {
  const scope = options.scope || 'openid email profile'
  return _signinDefault(options).then((response) => response.json()).then((data) => {
    if (data && data.access_token && data.id_token && (scope.indexOf('offline_access') === -1 || data.refresh_token)) {
      return data
    } else {
      return Promise.reject(new MagnusError('invalid response', data))
    }
  }, (error) => {
    return Promise.reject(new MagnusError('caught exception', error))
  })
}

function _signinDefault (options) {
  if (options.sso !== false) {
    options.sso = true
  }

  if (typeof options.username !== 'undefined' || typeof options.email !== 'undefined') {
    return _signinWithUsernamePassword(options)
  }

  if (options.sso === true && typeof options.connection !== 'undefined') {
    return _signinWithSSO(options)
  }

  return Promise.reject(new MagnusError('unhandled options', options))
}

function _signinWithSSO (options) {
  const {
    connection,
    sso
  } = options
  const scope = options.scope || 'openid email profile'
  const data = {
    'client_id':  MagnusClient.config.clientId,
    'connection': connection,
    'grant_type': 'sso',
    'scope':      scope,
    'sso':        sso
  }
  return MagnusClient.fetch('/oauth/ro', {
    body: JSON.stringify(data),
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    method: 'POST',
    mode: 'cors',
    options: {
      authorization: false
    }
  })
}

function _signinWithUsernamePassword (options) {
  const {
    email,
    username,
    password,
    connection,
    sso
  } = options
  const scope = options.scope || 'openid email profile'
  const data = {
    'client_id':  MagnusClient.config.clientId,
    'connection': connection || 'Username-Password-Authentication',
    'grant_type': 'password',
    'username':   username || email,
    'password':   password,
    'scope':      scope,
    'sso':        sso
  }
  return MagnusClient.fetch('/oauth/ro', {
    body: JSON.stringify(data),
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    method: 'POST',
    mode: 'cors',
    options: {
      authorization: false
    }
  })
}

function _userinfo (data) {
  if (!data || !data.access_token) {
    return Promise.reject(new MagnusError('missing data.access_token', data))
  }
  return MagnusClient.fetch('/userinfo', {
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${data.access_token}`
    },
    method: 'GET',
    mode: 'cors',
    options: {
      authorization: false
    }
  })
    .then((response) => response.json())
    .then((userinfo) => {
      const session = {
        accessToken:  data.access_token,
        idToken:      data.id_token,
        refreshToken: data.refresh_token,
        tokeninfo:    null,
        userinfo:     userinfo
      }
      return session
    })
    .catch((error) => {
      return Promise.reject(new MagnusError('userinfo error', error))
    })
}

/** Sign-Out **/

function _signout () {
  return MagnusClient.fetch('/logout', {
    cache: 'no-cache',
    credentials: 'include',
    method: 'GET',
    mode: 'cors',
    options: {
      authorization: false
    }
  })
}

/* eslint-enable key-spacing, no-multi-spaces */

export default MagnusActions
