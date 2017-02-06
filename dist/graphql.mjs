import fetch from 'isomorphic-fetch';
import magnus from '@potatosalad/magnus';
import { QueryBatcher } from 'apollo-client/transport/batching';
import { printRequest } from 'apollo-client/transport/networkInterface';

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
  applyMiddleware: function applyMiddleware(_ref, next) {
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
      return fetch(input, init);
    }
  }, {
    key: 'fetch',
    value: function fetch$$1(input) {
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

var graphql = {
  GraphQLHTTPFetchNetworkInterface: GraphQLHTTPFetchNetworkInterface,
  GraphQLHTTPBatchedNetworkInterface: GraphQLHTTPBatchedNetworkInterface,
  createGraphQLNetworkInterface: createGraphQLNetworkInterface
};

export { GraphQLHTTPFetchNetworkInterface, GraphQLHTTPBatchedNetworkInterface, createGraphQLNetworkInterface };export default graphql;
//# sourceMappingURL=graphql.mjs.map
