import { combineReducers } from 'redux'
import {
  AUTHENTICATE_REQUEST,
  AUTHENTICATE_SUCCESS,
  AUTHENTICATE_FAILURE,
  SIGN_IN_REQUEST,
  SIGN_IN_SUCCESS,
  SIGN_IN_FAILURE,
  SIGN_OUT_REQUEST,
  SIGN_OUT_SUCCESS,
  SIGN_OUT_FAILURE
} from './actions'

function createReducer (initialState, map) {
  return function magnus (state = initialState, action) {
    const reducer = map[action.type]
    return (reducer) ? reducer(state, action.payload) : state
  }
}

export const initialState = {
  isAuthenticated: false,
  isAuthenticating: false,
  requests: 0,
  session: null,
  statusText: null,
  version: 2
}

const magnus = createReducer(initialState, {
  [AUTHENTICATE_REQUEST]: (state) => {
    return {
      ...state,
      isAuthenticating: true,
      requests: state.requests + 1
    }
  },
  [AUTHENTICATE_SUCCESS]: (state, { session }) => {
    return {
      ...state,
      isAuthenticated: true,
      isAuthenticating: false,
      requests: state.requests - 1,
      session: {
        ...session,
        version: state.version
      }
    }
  },
  [AUTHENTICATE_FAILURE]: (state, { error }) => {
    return {
      ...state,
      isAuthenticated: false,
      isAuthenticating: false,
      requests: state.requests - 1,
      session: null,
      statusText: `Authentication Error: ${error.message}`
    }
  },
  [SIGN_IN_REQUEST]: (state) => {
    return {
      ...state,
      isAuthenticating: true,
      requests: state.requests + 1,
      statusText: null
    }
  },
  [SIGN_IN_SUCCESS]: (state, { session }) => {
    return {
      ...state,
      isAuthenticated: true,
      isAuthenticating: false,
      requests: state.requests - 1,
      session: {
        ...session,
        version: state.version
      },
      statusText: 'You have been successfully logged in.'
    }
  },
  [SIGN_IN_FAILURE]: (state, { error }) => {
    return {
      ...state,
      isAuthenticated: false,
      isAuthenticating: false,
      requests: state.requests - 1,
      session: null,
      statusText: `Authentication Error: ${error.message}`
    }
  },
  [SIGN_OUT_REQUEST]: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      requests: state.requests + 1,
      statusText: null
    }
  },
  [SIGN_OUT_SUCCESS]: (state) => {
    return {
      ...state,
      requests: state.requests - 1,
      session: null,
      statusText: 'You have been successfully logged out.'
    }
  },
  [SIGN_OUT_FAILURE]: (state, { error }) => {
    return {
      ...state,
      requests: state.requests - 1,
      session: null,
      statusText: `Authentication Error: ${error.message}`
    }
  }
})

const MagnusReducers = combineReducers({
  magnus
})

export default MagnusReducers
