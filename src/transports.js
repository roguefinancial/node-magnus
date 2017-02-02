import fetch from 'isomorphic-fetch'
import { HTTPBearerMiddleware } from './middlewares'

export class HTTPTransport {
  constructor (uri, init = {}) {
    if (!uri) {
      throw new Error('A remote endpoint is required for a network layer')
    }

    if (typeof uri !== 'string') {
      throw new Error('Remote endpoint must be a string')
    }

    this._uri = uri
    this._init = init
    this._middlewares = []
    this._afterwares = []
  }

  applyMiddlewares ({ request, options }) {
    return new Promise((resolve) => {
      const queue = (funcs, scope) => {
        const next = () => {
          if (funcs.length > 0) {
            const f = funcs.shift()
            f.applyMiddleware.apply(scope, [{ request, options }, next])
          } else {
            resolve({
              request,
              options
            })
          }
        }
        next()
      }

      // iterate through middlewares using next callback
      queue([...this._middlewares], this)
    })
  }

  applyAfterwares ({ response, options }) {
    return new Promise((resolve) => {
      const queue = (funcs, scope) => {
        const next = () => {
          if (funcs.length > 0) {
            const f = funcs.shift()
            f.applyAfterware.apply(scope, [{ response, options }, next])
          } else {
            resolve({
              response,
              options
            })
          }
        }
        next()
      }

      // iterate through afterwares using next callback
      queue([...this._afterwares], this)
    })
  }

  fetchFromRemoteEndpoint ({ request, options }) {
    const input = request.url
    const init = Object.assign({}, options)
    delete input.options
    return fetch(input, init)
  }

  fetch (input, init = {}) {
    const request = {
      url: `${this._uri}${input}`
    }
    const options = Object.assign({}, this._init, init, {
      headers: Object.assign({}, this._init.headers, init.headers),
      options: Object.assign({}, this._init.options, init.options)
    })

    return this.applyMiddlewares({ request, options })
      .then(this.fetchFromRemoteEndpoint.bind(this))
      .then((response) => {
        this.applyAfterwares({ response, options })
        return response
      })
  }

  use (middlewares) {
    middlewares.map((middleware) => {
      if (typeof middleware.applyMiddleware === 'function') {
        this._middlewares.push(middleware)
      } else {
        throw new Error(`Middleware must implement the applyMiddleware function`)
      }
    })
  }

  useAfter (afterwares) {
    afterwares.map((afterware) => {
      if (typeof afterware.applyAfterware === 'function') {
        this._afterwares.push(afterware)
      } else {
        throw new Error(`Afterware must implement the applyAfterware function`)
      }
    })
  }
}

export class HTTPBearerTransport extends HTTPTransport {
  constructor (uri, init = {}) {
    super(uri, init)
    this.use([HTTPBearerMiddleware])
  }
}
