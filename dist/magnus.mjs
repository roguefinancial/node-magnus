import _fetch from 'isomorphic-fetch';
import jwtDecode from 'jwt-decode';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import isArray from 'lodash/isArray';
import isDate from 'lodash/isDate';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';
import isUndefined from 'lodash/isUndefined';
import { QueryBatcher } from 'apollo-client/transport/batching';
import { printRequest } from 'apollo-client/transport/networkInterface';

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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
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



















var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
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

/* eslint-disable key-spacing, no-multi-spaces */

/* Action Types */

var AUTHENTICATE_REQUEST = 'AUTHENTICATE_REQUEST';
var AUTHENTICATE_SUCCESS = 'AUTHENTICATE_SUCCESS';
var AUTHENTICATE_FAILURE = 'AUTHENTICATE_FAILURE';
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
}), defineProperty(_createReducer, SIGN_IN_REQUEST, function (state) {
  return _extends({}, state, {
    isAuthenticating: true,
    requests: state.requests + 1,
    statusText: null
  });
}), defineProperty(_createReducer, SIGN_IN_SUCCESS, function (state, _ref3) {
  var session = _ref3.session;

  return _extends({}, state, {
    isAuthenticated: true,
    isAuthenticating: false,
    requests: state.requests - 1,
    session: _extends({}, session, {
      version: state.version
    }),
    statusText: 'You have been successfully logged in.'
  });
}), defineProperty(_createReducer, SIGN_IN_FAILURE, function (state, _ref4) {
  var error = _ref4.error;

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
}), defineProperty(_createReducer, SIGN_OUT_FAILURE, function (state, _ref5) {
  var error = _ref5.error;

  return _extends({}, state, {
    requests: state.requests - 1,
    session: null,
    statusText: 'Authentication Error: ' + error.message
  });
}), _createReducer));

var MagnusReducers = combineReducers({
  magnus: magnus$2
});

var preloadedState = {
  magnus: _extends({}, initialState, {
    session: MagnusStorage.load()
  })
};

var MagnusStore = createStore(MagnusReducers, preloadedState, applyMiddleware(thunkMiddleware));

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

var TIMEOUT = 'TIMEOUT';

function createTimeout() {
  var milliseconds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(TIMEOUT);
    }, milliseconds);
  });
}

function waitUntilAuthenticated(timeout) {
  var expired = false;
  timeout.then(function () {
    expired = true;
  });
  return Promise.race([timeout, new Promise(function (resolve) {
    if (expired === true) {
      resolve(TIMEOUT);
      return;
    }
    if (magnus.state.isAuthenticating) {
      setTimeout(function () {
        resolve(waitUntilAuthenticated(timeout));
      }, 100);
      return;
    }
    if (magnus.state.isAuthenticated) {
      resolve();
      return;
    }
    magnus.authenticate();
    setTimeout(function () {
      resolve(waitUntilAuthenticated(timeout));
    }, 100);
    return;
  })]);
}

var HTTPBearerMiddleware = {
  applyMiddleware: function applyMiddleware$$1(_ref, next) {
    var request = _ref.request,
        options = _ref.options;

    var opts = options.options || {};
    if (opts.authorization === false) {
      return next();
    }
    if (magnus.state.isAuthenticated === false) {
      var _ret = function () {
        var milliseconds = opts.timeout || 5000;
        var timeout = createTimeout(milliseconds);
        waitUntilAuthenticated(timeout).then(function (result) {
          if (result === TIMEOUT) {
            throw new Error('authentication timeout after ' + milliseconds + 'ms');
          }
          HTTPBearerMiddleware.applyMiddleware({ request: request, options: options }, next);
        });
        return {
          v: void 0
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }
    var headers = Object.assign({}, options.headers, {
      'Authorization': 'Bearer ' + magnus.session.idToken
    });
    options.headers = headers;
    return next();
  }
};

var HTTPTransport = function () {
  function HTTPTransport(uri) {
    var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, HTTPTransport);

    if (!uri) {
      throw new Error('A remote endpoint is required for a network layer');
    }

    if (typeof uri !== 'string') {
      throw new Error('Remote endpoint must be a string');
    }

    this._uri = uri;
    this._init = init;
    this._middlewares = [];
    this._afterwares = [];
  }

  createClass(HTTPTransport, [{
    key: 'applyMiddlewares',
    value: function applyMiddlewares(_ref) {
      var _this = this;

      var request = _ref.request,
          options = _ref.options;

      return new Promise(function (resolve) {
        var queue = function queue(funcs, scope) {
          var next = function next() {
            if (funcs.length > 0) {
              var f = funcs.shift();
              f.applyMiddleware.apply(scope, [{ request: request, options: options }, next]);
            } else {
              resolve({
                request: request,
                options: options
              });
            }
          };
          next();
        };

        // iterate through middlewares using next callback
        queue([].concat(toConsumableArray(_this._middlewares)), _this);
      });
    }
  }, {
    key: 'applyAfterwares',
    value: function applyAfterwares(_ref2) {
      var _this2 = this;

      var response = _ref2.response,
          options = _ref2.options;

      return new Promise(function (resolve) {
        var queue = function queue(funcs, scope) {
          var next = function next() {
            if (funcs.length > 0) {
              var f = funcs.shift();
              f.applyAfterware.apply(scope, [{ response: response, options: options }, next]);
            } else {
              resolve({
                response: response,
                options: options
              });
            }
          };
          next();
        };

        // iterate through afterwares using next callback
        queue([].concat(toConsumableArray(_this2._afterwares)), _this2);
      });
    }
  }, {
    key: 'fetchFromRemoteEndpoint',
    value: function fetchFromRemoteEndpoint(_ref3) {
      var request = _ref3.request,
          options = _ref3.options;

      var input = request.url;
      var init = Object.assign({}, options);
      delete input.options;
      return _fetch(input, init);
    }
  }, {
    key: 'fetch',
    value: function fetch(input) {
      var _this3 = this;

      var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var request = {
        url: '' + this._uri + input
      };
      var options = Object.assign({}, this._init, init, {
        headers: Object.assign({}, this._init.headers, init.headers),
        options: Object.assign({}, this._init.options, init.options)
      });

      return this.applyMiddlewares({ request: request, options: options }).then(this.fetchFromRemoteEndpoint.bind(this)).then(function (response) {
        _this3.applyAfterwares({ response: response, options: options });
        return response;
      });
    }
  }, {
    key: 'use',
    value: function use(middlewares) {
      var _this4 = this;

      middlewares.map(function (middleware) {
        if (typeof middleware.applyMiddleware === 'function') {
          _this4._middlewares.push(middleware);
        } else {
          throw new Error('Middleware must implement the applyMiddleware function');
        }
      });
    }
  }, {
    key: 'useAfter',
    value: function useAfter(afterwares) {
      var _this5 = this;

      afterwares.map(function (afterware) {
        if (typeof afterware.applyAfterware === 'function') {
          _this5._afterwares.push(afterware);
        } else {
          throw new Error('Afterware must implement the applyAfterware function');
        }
      });
    }
  }]);
  return HTTPTransport;
}();

var HTTPBearerTransport = function (_HTTPTransport) {
  inherits(HTTPBearerTransport, _HTTPTransport);

  function HTTPBearerTransport(uri) {
    var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, HTTPBearerTransport);

    var _this6 = possibleConstructorReturn(this, (HTTPBearerTransport.__proto__ || Object.getPrototypeOf(HTTPBearerTransport)).call(this, uri, init));

    _this6.use([HTTPBearerMiddleware]);
    return _this6;
  }

  return HTTPBearerTransport;
}(HTTPTransport);

var GraphQLHTTPFetchNetworkInterface = function (_HTTPBearerTransport) {
  inherits(GraphQLHTTPFetchNetworkInterface, _HTTPBearerTransport);

  function GraphQLHTTPFetchNetworkInterface(uri) {
    var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, GraphQLHTTPFetchNetworkInterface);
    return possibleConstructorReturn(this, (GraphQLHTTPFetchNetworkInterface.__proto__ || Object.getPrototypeOf(GraphQLHTTPFetchNetworkInterface)).call(this, uri, init));
  }

  createClass(GraphQLHTTPFetchNetworkInterface, [{
    key: 'queryFetchFromRemoteEndpoint',
    value: function queryFetchFromRemoteEndpoint(_ref) {
      var request0 = _ref.request,
          options = _ref.options;

      var request = {
        url: request0.url
      };
      delete request0.url;
      return this.fetchFromRemoteEndpoint({
        request: request,
        options: Object.assign({}, {
          body: JSON.stringify(printRequest(request0)),
          cache: 'no-cache',
          credentials: 'omit',
          method: 'POST',
          mode: 'cors'
        }, options, {
          headers: Object.assign({}, {
            'Accept': '*/*',
            'Content-Type': 'application/json charset=utf-8'
          }, options.headers)
        })
      });
    }
  }, {
    key: 'query',
    value: function query(input) {
      var _this2 = this;

      var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var request = _extends({}, input, {
        url: this._uri
      });
      var options = Object.assign({}, this._init, init, {
        headers: Object.assign({}, this._init.headers, init.headers),
        options: Object.assign({}, this._init.options, init.options)
      });

      return this.applyMiddlewares({ request: request, options: options }).then(this.queryFetchFromRemoteEndpoint.bind(this)).then(function (response) {
        _this2.applyAfterwares({ response: response, options: options });
        return response;
      }).then(function (response) {
        return response.json();
      }).then(function (payload) {
        if (!payload.hasOwnProperty('data') && !payload.hasOwnProperty('errors')) {
          throw new Error('Server response was missing for query \'' + request.debugName + '\'.');
        } else {
          return payload.data;
        }
      });
    }
  }]);
  return GraphQLHTTPFetchNetworkInterface;
}(HTTPBearerTransport);

var GraphQLHTTPBatchedNetworkInterface = function (_GraphQLHTTPFetchNetw) {
  inherits(GraphQLHTTPBatchedNetworkInterface, _GraphQLHTTPFetchNetw);

  function GraphQLHTTPBatchedNetworkInterface(uri, pollInterval, fetchOpts) {
    classCallCheck(this, GraphQLHTTPBatchedNetworkInterface);

    var _this3 = possibleConstructorReturn(this, (GraphQLHTTPBatchedNetworkInterface.__proto__ || Object.getPrototypeOf(GraphQLHTTPBatchedNetworkInterface)).call(this, uri, fetchOpts));

    if (typeof pollInterval !== 'number') {
      throw new Error('pollInterval must be a number, got ' + pollInterval);
    }

    _this3.pollInterval = pollInterval;
    _this3.batcher = new QueryBatcher({
      batchFetchFunction: _this3.batchQuery.bind(_this3)
    });
    _this3.batcher.start(_this3.pollInterval);
    return _this3;
  }

  createClass(GraphQLHTTPBatchedNetworkInterface, [{
    key: 'query',
    value: function query(input) {
      var _this4 = this;

      var request = _extends({}, input, {
        url: this._uri
      });
      // we just pass it through to the batcher.
      return new Promise(function (resolve, reject) {
        _this4.batcher.enqueueRequest(request).then(resolve, reject);
      });
    }

    // made public for testing only

  }, {
    key: 'batchQuery',
    value: function batchQuery(requests) {
      var _this5 = this;

      var options = Object.assign({}, this._opts);

      // Apply the middlewares to each of the requests
      var middlewarePromises = [];
      requests.forEach(function (request) {
        middlewarePromises.push(_this5.applyMiddlewares({
          request: request,
          options: options
        }));
      });

      return new Promise(function (resolve, reject) {
        Promise.all(middlewarePromises).then(function (requestsAndOptions) {
          return _this5.batchedFetchFromRemoteEndpoint(requestsAndOptions).then(function (result) {
            return result.json();
          }).then(function (responses) {
            if (typeof responses.map !== 'function') {
              throw new Error('GraphQLHTTPBatchedNetworkInterface: server response is not an array');
            }

            var afterwaresPromises = responses.map(function (response, index) {
              return _this5.applyAfterwares({
                response: response,
                options: requestsAndOptions[index].options
              });
            });

            Promise.all(afterwaresPromises).then(function (responsesAndOptions) {
              var results = [];
              responsesAndOptions.forEach(function (_ref2) {
                var response = _ref2.response;

                results.push(response);
              });
              resolve(results);
            }).catch(function (error) {
              reject(error);
            });
          });
        }).catch(function (error) {
          reject(error);
        });
      });
    }
  }, {
    key: 'batchedFetchFromRemoteEndpoint',
    value: function batchedFetchFromRemoteEndpoint(requestsAndOptions) {
      var request = {
        url: this._uri
      };
      var options = {};

      // Combine all of the options given by the middleware into one object.
      requestsAndOptions.forEach(function (requestAndOptions) {
        if (requestAndOptions.request.url) {
          request.url = requestAndOptions.request.url;
          delete requestAndOptions.request.url;
        }
        Object.assign(options, requestAndOptions.options);
      });

      // Serialize the requests to strings of JSON
      var printedRequests = requestsAndOptions.map(function (requestAndOptions) {
        return printRequest(requestAndOptions.request);
      });

      return this.fetchFromRemoteEndpoint({
        request: request,
        options: Object.assign({}, {
          body: JSON.stringify(printedRequests),
          cache: 'no-cache',
          credentials: 'omit',
          method: 'POST',
          mode: 'cors'
        }, options, {
          headers: Object.assign({}, {
            'Accept': '*/*',
            'Content-Type': 'application/json charset=utf-8'
          }, options.headers)
        })
      });
    }
  }]);
  return GraphQLHTTPBatchedNetworkInterface;
}(GraphQLHTTPFetchNetworkInterface);

function createGraphQLNetworkInterface(options) {
  if (!options) {
    throw new Error('You must pass an options argument to createGraphQLNetworkInterface.');
  }
  if (options.batchInterval) {
    return new GraphQLHTTPBatchedNetworkInterface(options.uri, options.batchInterval, options.opts);
  } else {
    return new GraphQLHTTPFetchNetworkInterface(options.uri, options.opts);
  }
}

var GraphQLMagnus = {
  GraphQLHTTPFetchNetworkInterface: GraphQLHTTPFetchNetworkInterface,
  GraphQLHTTPBatchedNetworkInterface: GraphQLHTTPBatchedNetworkInterface,
  createGraphQLNetworkInterface: createGraphQLNetworkInterface
};

var VueMagnus = {
  install: function install(Vue) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var clientConfig = (options || {}).client || {};
    Object.assign(magnus.client.config, clientConfig);
    Object.defineProperties(Vue.prototype, {
      $magnus: {
        get: function get() {
          return magnus;
        }
      }
    });
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
    key: 'graphql',
    get: function get$$1() {
      return GraphQLMagnus;
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
  }, {
    key: 'vue',
    get: function get$$1() {
      return VueMagnus;
    }
  }]);
  return Magnus;
}();

var magnus = new Magnus();

export default magnus;
//# sourceMappingURL=magnus.mjs.map
