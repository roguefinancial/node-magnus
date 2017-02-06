(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('isomorphic-fetch'), require('jwt-decode'), require('redux'), require('redux-thunk'), require('lodash/isArray'), require('lodash/isDate'), require('lodash/isEqual'), require('lodash/isObject'), require('lodash/isUndefined')) :
	typeof define === 'function' && define.amd ? define(['isomorphic-fetch', 'jwt-decode', 'redux', 'redux-thunk', 'lodash/isArray', 'lodash/isDate', 'lodash/isEqual', 'lodash/isObject', 'lodash/isUndefined'], factory) :
	(global.magnus = factory(global._fetch,global.jwtDecode,global.redux,global.thunkMiddleware,global.isArray,global.isDate,global.isEqual,global.isObject,global.isUndefined));
}(this, (function (_fetch,jwtDecode,redux,thunkMiddleware,isArray,isDate,isEqual,isObject,isUndefined) { 'use strict';

_fetch = 'default' in _fetch ? _fetch['default'] : _fetch;
jwtDecode = 'default' in jwtDecode ? jwtDecode['default'] : jwtDecode;
thunkMiddleware = 'default' in thunkMiddleware ? thunkMiddleware['default'] : thunkMiddleware;
isArray = 'default' in isArray ? isArray['default'] : isArray;
isDate = 'default' in isDate ? isDate['default'] : isDate;
isEqual = 'default' in isEqual ? isEqual['default'] : isEqual;
isObject = 'default' in isObject ? isObject['default'] : isObject;
isUndefined = 'default' in isUndefined ? isUndefined['default'] : isUndefined;

var issuerPromise = null;

var MagnusClient = {

  config: {
    clientId: null,
    endpoint: 'https://magnus.rogue.team',
    issuer: null
  },

  fetch: function fetch(input0) {
    var init0 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var init = Object.assign({}, init0);
    var options = init.options || {};
    delete init.options;
    var input = MagnusClient.getURL(input0, options);
    if (input === false) {
      return MagnusClient.fetchIssuer().then(function () {
        return MagnusClient.fetch(input0, init0);
      });
    }
    return _fetch(input, init);
  },
  fetchIssuer: function fetchIssuer() {
    if (issuerPromise === null) {
      issuerPromise = MagnusClient.fetch('/client/' + MagnusClient.config.clientId, {
        cache: 'default',
        credentials: 'omit',
        method: 'GET',
        mode: 'cors',
        options: {
          authorization: false,
          issuer: false
        }
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        if (data && data.issuer) {
          MagnusClient.config.issuer = data.issuer;
          return Promise.resolve(MagnusClient.config.issuer);
        }
        return Promise.reject(data);
      }).catch(function (response) {
        issuerPromise = null;
        return Promise.reject(response);
      });
    }
    return issuerPromise;
  },
  getURL: function getURL(input, options) {
    if (options.issuer === false) {
      return '' + MagnusClient.config.endpoint + input;
    }
    if (MagnusClient.config.issuer === null) {
      return false;
    }
    return '' + MagnusClient.config.issuer + input;
  }
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

function ExtendableError() {
  // Not passing "newTarget" because core-js would fall back to non-exotic
  // object creation.
  var instance = Reflect.construct(Error, Array.from(arguments));
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  instance.name = this.constructor.name;
  return instance;
}

ExtendableError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true
  }
});

if (Object.setPrototypeOf) {
  Object.setPrototypeOf(ExtendableError, Error);
} else {
  // eslint-disable-next-line no-proto
  ExtendableError.__proto__ = Error;
}

var MagnusError = function (_ExtendableError) {
  inherits(MagnusError, _ExtendableError);

  function MagnusError(message, data) {
    classCallCheck(this, MagnusError);

    var _this = possibleConstructorReturn(this, (MagnusError.__proto__ || Object.getPrototypeOf(MagnusError)).call(this, message));

    _this.data = data;
    return _this;
  }

  return MagnusError;
}(ExtendableError);

var MagnusSession = {
  getAccessToken: function getAccessToken(state) {
    if (state && state.session && state.session.accessToken) {
      return state.session.accessToken;
    }
    return null;
  },
  getIdToken: function getIdToken(state) {
    if (state && state.session && state.session.idToken) {
      return state.session.idToken;
    }
    return null;
  },
  getIdTokenExpirationDate: function getIdTokenExpirationDate(state) {
    var idToken = MagnusSession.getIdToken(state);
    if (idToken) {
      try {
        var decoded = jwtDecode(idToken);
        if (typeof decoded.exp === 'undefined') {
          return null;
        }
        var d = new Date(0);
        d.setUTCSeconds(decoded.exp);
        return d;
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  getIdTokenExpiresAfter: function getIdTokenExpiresAfter(state) {
    var d = MagnusSession.getIdTokenExpirationDate(state);
    if (d === null) {
      return 0;
    }
    return (d.valueOf() - new Date().valueOf()) / 1000;
  },
  getRefreshToken: function getRefreshToken(state) {
    if (state && state.session && state.session.refreshToken) {
      return state.session.refreshToken;
    }
    return null;
  },
  isIdTokenExpired: function isIdTokenExpired(state) {
    var offsetSeconds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    var d = MagnusSession.getIdTokenExpirationDate(state);
    if (d === null) {
      return false;
    }
    return !(d.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
  },
  isSessionExpired: function isSessionExpired(state) {
    if (state && state.session && state.session.version !== state.version) {
      return true;
    }
    return false;
  }
};

var localStorage = void 0;

if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
  (function () {
    var internal = {};
    localStorage = {
      setItem: function setItem(id, val) {
        internal[id] = String(val);
      },
      getItem: function getItem(id) {
        return internal.hasOwnProperty(id) ? internal[id] : undefined;
      },
      removeItem: function removeItem(id) {
        delete internal[id];
      },
      clear: function clear() {
        internal = {};
      }
    };
  })();
} else {
  localStorage = window.localStorage;
}

var localStorage$1 = localStorage;

var MagnusStorage = {

  get key() {
    return 'magnus.' + MagnusClient.config.clientId + '/session';
  },

  get local() {
    return localStorage$1;
  },

  load: function load() {
    if (typeof localStorage$1 !== 'undefined' && typeof localStorage$1.getItem === 'function') {
      var value = null;
      try {
        value = JSON.parse(localStorage$1.getItem(MagnusStorage.key));
      } catch (e) {
        return null;
      }
      return value;
    }
    return null;
  },
  dump: function dump(value) {
    if (typeof localStorage$1 !== 'undefined' && typeof localStorage$1.setItem === 'function') {
      localStorage$1.setItem(MagnusStorage.key, JSON.stringify(value));
    }
    return value;
  }
};

/* eslint-disable key-spacing, no-multi-spaces */

/* Action Types */

var AUTHENTICATE_REQUEST = 'AUTHENTICATE_REQUEST';
var AUTHENTICATE_SUCCESS = 'AUTHENTICATE_SUCCESS';
var AUTHENTICATE_FAILURE = 'AUTHENTICATE_FAILURE';
var LOAD_SESSION_REQUEST = 'LOAD_SESSION_REQUEST';
var LOAD_SESSION_SUCCESS = 'LOAD_SESSION_SUCCESS';
var LOAD_SESSION_FAILURE = 'LOAD_SESSION_FAILURE';
var SIGN_IN_REQUEST = 'SIGN_IN_REQUEST';
var SIGN_IN_SUCCESS = 'SIGN_IN_SUCCESS';
var SIGN_IN_FAILURE = 'SIGN_IN_FAILURE';
var SIGN_OUT_REQUEST = 'SIGN_OUT_REQUEST';
var SIGN_OUT_SUCCESS = 'SIGN_OUT_SUCCESS';
var SIGN_OUT_FAILURE = 'SIGN_OUT_FAILURE';

/* Action Creators */

function authenticateRequest() {
  return {
    type: AUTHENTICATE_REQUEST,
    payload: null
  };
}

function authenticateSuccess(session) {
  return {
    type: AUTHENTICATE_SUCCESS,
    payload: {
      session: session
    }
  };
}

function authenticateFailure(error) {
  return {
    type: AUTHENTICATE_FAILURE,
    payload: {
      error: error
    }
  };
}

function loadSessionRequest() {
  return {
    type: LOAD_SESSION_REQUEST,
    payload: null
  };
}

function loadSessionSuccess(session) {
  return {
    type: LOAD_SESSION_SUCCESS,
    payload: {
      session: session
    }
  };
}

function loadSessionFailure(error) {
  return {
    type: LOAD_SESSION_FAILURE,
    payload: {
      error: error
    }
  };
}

function signinRequest() {
  return {
    type: SIGN_IN_REQUEST,
    payload: null
  };
}

function signinSuccess(session) {
  return {
    type: SIGN_IN_SUCCESS,
    payload: {
      session: session
    }
  };
}

function signinFailure(error) {
  return {
    type: SIGN_IN_FAILURE,
    payload: {
      error: error
    }
  };
}

function signoutRequest() {
  return {
    type: SIGN_OUT_REQUEST,
    payload: null
  };
}

function signoutSuccess(session) {
  return {
    type: SIGN_OUT_SUCCESS,
    payload: {
      session: session
    }
  };
}

function signoutFailure(error) {
  return {
    type: SIGN_OUT_FAILURE,
    payload: {
      error: error
    }
  };
}

/* Actions */

var MagnusActions = {
  authenticate: function authenticate() {
    var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    return function (dispatch, getState) {
      var _getState = getState(),
          state = _getState.magnus;

      if (state.isAuthenticated === true && state.session && force === false && state.session.tokeninfo) {
        return Promise.resolve(authenticateSuccess(state.session));
      }
      dispatch(authenticateRequest());
      return dispatch(_authenticate()).then(function (session) {
        return dispatch(authenticateSuccess(session));
      }).catch(function (error) {
        return Promise.reject(dispatch(authenticateFailure(error)));
      });
    };
  },
  loadSession: function loadSession() {
    return function (dispatch) {
      var session = MagnusStorage.load();
      dispatch(loadSessionRequest());
      if (typeof session !== 'undefined' && session !== null) {
        return Promise.resolve(dispatch(loadSessionSuccess(session)));
      } else {
        return Promise.reject(dispatch(loadSessionFailure(new MagnusError('invalid session'))));
      }
    };
  },
  signin: function signin(opts) {
    var options = Object.assign({}, opts);
    return function (dispatch) {
      dispatch(signinRequest());
      return _signin(options).then(function (data) {
        return _userinfo(data);
      }).then(function (session) {
        return dispatch(signinSuccess(session));
      }).catch(function (error) {
        return Promise.reject(dispatch(signinFailure(error)));
      });
    };
  },
  signout: function signout() {
    return function (dispatch, getState) {
      var _getState2 = getState(),
          state = _getState2.magnus;

      dispatch(signoutRequest());
      return _signout().then(function () {
        return dispatch(signoutSuccess(state.session));
      }).catch(function (error) {
        return Promise.reject(dispatch(signoutFailure(error)));
      });
    };
  }
};

/** Authenticate **/

function _authenticate() {
  return function (dispatch) {
    return dispatch(_authenticateWithTokeninfo()).catch(function (error) {
      if (error.message === 'invalid token') {
        return dispatch(_authenticateWithSSO());
      }
      return Promise.reject(error);
    });
  };
}

function _authenticateWithTokeninfo() {
  return function (dispatch, getState) {
    dispatch;

    var _getState3 = getState(),
        state = _getState3.magnus;

    var idToken = MagnusSession.getIdToken(state);
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
      }).then(function (response) {
        return response.json();
      }).then(function (tokeninfo) {
        return _extends({}, state.session, {
          tokeninfo: tokeninfo
        });
      }).catch(function (error) {
        if (error && error.status && error.status !== 401 && (state.session.tokeninfo || state.session.userinfo)) {
          return _extends({}, state.session, {
            tokeninfo: state.session.tokeninfo || state.session.userinfo
          });
        }
        return Promise.reject(new MagnusError('bad tokeninfo response', error));
      });
    }
    return Promise.reject(new MagnusError('invalid token'));
  };
}

function _authenticateWithSSO() {
  return function (dispatch) {
    return MagnusClient.fetch('/user/ssodata', {
      cache: 'no-cache',
      credentials: 'include',
      method: 'GET',
      mode: 'cors',
      options: {
        authorization: false
      }
    }).then(function (response) {
      return response.json();
    }).then(function (json) {
      if (json && json.lastUsedConnection && json.lastUsedConnection.name && json.sso === true) {
        var options = {
          connection: json.lastUsedConnection.name,
          sso: true
        };
        return dispatch(MagnusActions.signin(options)).then(function (_ref) {
          var session = _ref.payload.session;

          return session;
        });
      }
      return Promise.reject(json);
    }).catch(function (error) {
      return Promise.reject(new MagnusError('invalid SSO', error));
    });
  };
}

/** Sign-In **/

function _signin(options) {
  var scope = options.scope || 'openid email profile';
  return _signinDefault(options).then(function (response) {
    return response.json();
  }).then(function (data) {
    if (data && data.access_token && data.id_token && (scope.indexOf('offline_access') === -1 || data.refresh_token)) {
      return data;
    } else {
      return Promise.reject(new MagnusError('invalid response', data));
    }
  }, function (error) {
    return Promise.reject(new MagnusError('caught exception', error));
  });
}

function _signinDefault(options) {
  if (options.sso !== false) {
    options.sso = true;
  }

  if (typeof options.username !== 'undefined' || typeof options.email !== 'undefined') {
    return _signinWithUsernamePassword(options);
  }

  if (options.sso === true && typeof options.connection !== 'undefined') {
    return _signinWithSSO(options);
  }

  return Promise.reject(new MagnusError('unhandled options', options));
}

function _signinWithSSO(options) {
  var connection = options.connection,
      sso = options.sso;

  var scope = options.scope || 'openid email profile';
  var data = {
    'client_id': MagnusClient.config.clientId,
    'connection': connection,
    'grant_type': 'sso',
    'scope': scope,
    'sso': sso
  };
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
  });
}

function _signinWithUsernamePassword(options) {
  var email = options.email,
      username = options.username,
      password = options.password,
      connection = options.connection,
      sso = options.sso;

  var scope = options.scope || 'openid email profile';
  var data = {
    'client_id': MagnusClient.config.clientId,
    'connection': connection || 'Username-Password-Authentication',
    'grant_type': 'password',
    'username': username || email,
    'password': password,
    'scope': scope,
    'sso': sso
  };
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
  });
}

function _userinfo(data) {
  if (!data || !data.access_token) {
    return Promise.reject(new MagnusError('missing data.access_token', data));
  }
  return MagnusClient.fetch('/userinfo', {
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Authorization': 'Bearer ' + data.access_token
    },
    method: 'GET',
    mode: 'cors',
    options: {
      authorization: false
    }
  }).then(function (response) {
    return response.json();
  }).then(function (userinfo) {
    var session = {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      tokeninfo: null,
      userinfo: userinfo
    };
    return session;
  }).catch(function (error) {
    return Promise.reject(new MagnusError('userinfo error', error));
  });
}

/** Sign-Out **/

function _signout() {
  return MagnusClient.fetch('/logout', {
    cache: 'no-cache',
    credentials: 'include',
    method: 'GET',
    mode: 'cors',
    options: {
      authorization: false
    }
  });
}

var _createReducer;

function createReducer(initialState, map) {
  return function magnus() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    var reducer = map[action.type];
    return reducer ? reducer(state, action.payload) : state;
  };
}

var initialState = {
  isAuthenticated: false,
  isAuthenticating: false,
  requests: 0,
  session: null,
  statusText: null,
  version: 2
};

var magnus$2 = createReducer(initialState, (_createReducer = {}, defineProperty(_createReducer, AUTHENTICATE_REQUEST, function (state) {
  return _extends({}, state, {
    isAuthenticating: true,
    requests: state.requests + 1
  });
}), defineProperty(_createReducer, AUTHENTICATE_SUCCESS, function (state, _ref) {
  var session = _ref.session;

  return _extends({}, state, {
    isAuthenticated: true,
    isAuthenticating: false,
    requests: state.requests - 1,
    session: _extends({}, session, {
      version: state.version
    })
  });
}), defineProperty(_createReducer, AUTHENTICATE_FAILURE, function (state, _ref2) {
  var error = _ref2.error;

  return _extends({}, state, {
    isAuthenticated: false,
    isAuthenticating: false,
    requests: state.requests - 1,
    session: null,
    statusText: 'Authentication Error: ' + error.message
  });
}), defineProperty(_createReducer, LOAD_SESSION_REQUEST, function (state) {
  return _extends({}, state, {
    requests: state.requests + 1
  });
}), defineProperty(_createReducer, LOAD_SESSION_SUCCESS, function (state, _ref3) {
  var session = _ref3.session;

  return _extends({}, state, {
    session: _extends({}, session, {
      version: state.version
    })
  });
}), defineProperty(_createReducer, LOAD_SESSION_FAILURE, function (state) {
  return _extends({}, state, {
    requests: state.requests - 1,
    session: null
  });
}), defineProperty(_createReducer, SIGN_IN_REQUEST, function (state) {
  return _extends({}, state, {
    isAuthenticating: true,
    requests: state.requests + 1,
    statusText: null
  });
}), defineProperty(_createReducer, SIGN_IN_SUCCESS, function (state, _ref4) {
  var session = _ref4.session;

  return _extends({}, state, {
    isAuthenticated: true,
    isAuthenticating: false,
    requests: state.requests - 1,
    session: _extends({}, session, {
      version: state.version
    }),
    statusText: 'You have been successfully logged in.'
  });
}), defineProperty(_createReducer, SIGN_IN_FAILURE, function (state, _ref5) {
  var error = _ref5.error;

  return _extends({}, state, {
    isAuthenticated: false,
    isAuthenticating: false,
    requests: state.requests - 1,
    session: null,
    statusText: 'Authentication Error: ' + error.message
  });
}), defineProperty(_createReducer, SIGN_OUT_REQUEST, function (state) {
  return _extends({}, state, {
    isAuthenticated: false,
    requests: state.requests + 1,
    statusText: null
  });
}), defineProperty(_createReducer, SIGN_OUT_SUCCESS, function (state) {
  return _extends({}, state, {
    requests: state.requests - 1,
    session: null,
    statusText: 'You have been successfully logged out.'
  });
}), defineProperty(_createReducer, SIGN_OUT_FAILURE, function (state, _ref6) {
  var error = _ref6.error;

  return _extends({}, state, {
    requests: state.requests - 1,
    session: null,
    statusText: 'Authentication Error: ' + error.message
  });
}), _createReducer));

var MagnusReducers = redux.combineReducers({
  magnus: magnus$2
});

var preloadedState = {
  magnus: _extends({}, initialState, {
    session: MagnusStorage.load()
  })
};

var MagnusStore = redux.createStore(MagnusReducers, preloadedState, redux.applyMiddleware(thunkMiddleware));

var MagnusUtil = {
  changeset: function changeset(o1, o2) {
    if (isEqual(o1, o2)) {
      return;
    } else {
      if (isDate(o1) || isDate(o2)) {
        if (isDate(o1) && isDate(o2) && isEqual(+o1, +o2)) {
          return;
        } else {
          return o2;
        }
      } else if (isObject(o1) && isObject(o2) && !isArray(o1) && !isArray(o2)) {
        var obj = {};
        var key = void 0,
            val = void 0;
        for (key in o1) {
          if (isUndefined(o2[key])) {
            obj[key] = null;
          } else {
            val = this.changeset(o1[key], o2[key]);
            if (!isUndefined(val)) {
              obj[key] = val;
            }
          }
        }
        for (key in o2) {
          val = this.changeset(o1[key], o2[key]);
          if (!isUndefined(val)) {
            obj[key] = val;
          }
        }
        return obj;
      } else {
        return o2;
      }
    }
  }
};

var Magnus = function () {
  function Magnus() {
    var _this = this;

    classCallCheck(this, Magnus);

    this.subscription = this.store.subscribe(function () {
      _this.storage.dump(_this.state.session);
    });
  }

  createClass(Magnus, [{
    key: 'authenticate',
    value: function authenticate() {
      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      return MagnusStore.dispatch(MagnusActions.authenticate(force));
    }
  }, {
    key: 'loadSession',
    value: function loadSession() {
      return MagnusStore.dispatch(MagnusActions.loadSession());
    }
  }, {
    key: 'signin',
    value: function signin(options) {
      return MagnusStore.dispatch(MagnusActions.signin(options));
    }
  }, {
    key: 'signout',
    value: function signout() {
      return MagnusStore.dispatch(MagnusActions.signout());
    }

    // subscribe only to changes to authentication state

  }, {
    key: 'subscribe',
    value: function subscribe(listener) {
      var _this2 = this;

      if (typeof listener !== 'function') {
        throw new Error('Listener must be a function');
      }
      var isAuthenticated = function () {
        var state = _this2.state;
        if (state.isAuthenticated && state.requests === 0) {
          listener();
          return state.isAuthenticated;
        }
        return null;
      }();
      return this.store.subscribe(function () {
        var state = _this2.state;
        if (state.requests === 0 && state.isAuthenticated !== isAuthenticated) {
          isAuthenticated = state.isAuthenticated;
          listener();
        }
      });
    }
  }, {
    key: 'client',
    get: function get$$1() {
      return MagnusClient;
    }
  }, {
    key: 'expiresAfter',
    get: function get$$1() {
      return MagnusSession.getIdTokenExpiresAfter(this.state);
    }
  }, {
    key: 'session',
    get: function get$$1() {
      var state = this.state;
      return state.session ? state.session : null;
    }
  }, {
    key: 'storage',
    get: function get$$1() {
      return MagnusStorage;
    }
  }, {
    key: 'state',
    get: function get$$1() {
      return this.store.getState().magnus;
    }
  }, {
    key: 'store',
    get: function get$$1() {
      return MagnusStore;
    }
  }, {
    key: 'util',
    get: function get$$1() {
      return MagnusUtil;
    }
  }]);
  return Magnus;
}();

var magnus = new Magnus();

return magnus;

})));
//# sourceMappingURL=magnus.js.map
