import { HTTPBearerTransport } from './transports'
import { QueryBatcher } from 'apollo-client/transport/batching'
import { printRequest } from 'apollo-client/transport/networkInterface'

export class GraphQLHTTPFetchNetworkInterface extends HTTPBearerTransport {
  constructor (uri, init = {}) {
    super(uri, init)
  }

  queryFetchFromRemoteEndpoint ({ request: request0, options }) {
    const request = {
      url: request0.url
    }
    delete request0.url
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
    })
  }

  query (input, init = {}) {
    const request = {
      ...input,
      url: this._uri
    }
    const options = Object.assign({}, this._init, init, {
      headers: Object.assign({}, this._init.headers, init.headers),
      options: Object.assign({}, this._init.options, init.options)
    })

    return this.applyMiddlewares({ request, options })
      .then(this.queryFetchFromRemoteEndpoint.bind(this))
      .then((response) => {
        this.applyAfterwares({ response, options })
        return response
      })
      .then((response) => response.json())
      .then((payload) => {
        if (!payload.hasOwnProperty('data') && !payload.hasOwnProperty('errors')) {
          throw new Error(`Server response was missing for query '${request.debugName}'.`)
        } else {
          return payload.data
        }
      })
  }
}

export class GraphQLHTTPBatchedNetworkInterface extends GraphQLHTTPFetchNetworkInterface {
  constructor (uri, pollInterval, fetchOpts) {
    super(uri, fetchOpts)

    if (typeof pollInterval !== 'number') {
      throw new Error(`pollInterval must be a number, got ${pollInterval}`)
    }

    this.pollInterval = pollInterval
    this.batcher = new QueryBatcher({
      batchFetchFunction: this.batchQuery.bind(this)
    })
    this.batcher.start(this.pollInterval)
  }

  query (input) {
    const request = {
      ...input,
      url: this._uri
    }
    // we just pass it through to the batcher.
    return new Promise((resolve, reject) => {
      this.batcher.enqueueRequest(request).then(resolve, reject)
    })
  }

  // made public for testing only
  batchQuery (requests) {
    const options = Object.assign({}, this._opts)

    // Apply the middlewares to each of the requests
    const middlewarePromises = []
    requests.forEach((request) => {
      middlewarePromises.push(this.applyMiddlewares({
        request,
        options
      }))
    })

    return new Promise((resolve, reject) => {
      Promise.all(middlewarePromises)
        .then((requestsAndOptions) => {
          return this.batchedFetchFromRemoteEndpoint(requestsAndOptions)
            .then((result) => result.json())
            .then((responses) => {
              if (typeof responses.map !== 'function') {
                throw new Error('GraphQLHTTPBatchedNetworkInterface: server response is not an array')
              }

              const afterwaresPromises = responses.map((response, index) => {
                return this.applyAfterwares({
                  response,
                  options: requestsAndOptions[index].options
                })
              })

              Promise.all(afterwaresPromises)
                .then((responsesAndOptions) => {
                  const results = []
                  responsesAndOptions.forEach(({ response }) => {
                    results.push(response)
                  })
                  resolve(results)
                })
                .catch((error) => {
                  reject(error)
                })
            })
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  batchedFetchFromRemoteEndpoint (requestsAndOptions) {
    const request = {
      url: this._uri
    }
    const options = {}

    // Combine all of the options given by the middleware into one object.
    requestsAndOptions.forEach((requestAndOptions) => {
      if (requestAndOptions.request.url) {
        request.url = requestAndOptions.request.url
        delete requestAndOptions.request.url
      }
      Object.assign(options, requestAndOptions.options)
    })

    // Serialize the requests to strings of JSON
    const printedRequests = requestsAndOptions.map((requestAndOptions) => {
      return printRequest(requestAndOptions.request)
    })

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
    })
  }
}

export function createGraphQLNetworkInterface (options) {
  if (!options) {
    throw new Error(`You must pass an options argument to createGraphQLNetworkInterface.`)
  }
  if (options.batchInterval) {
    return new GraphQLHTTPBatchedNetworkInterface(options.uri, options.batchInterval, options.opts)
  } else {
    return new GraphQLHTTPFetchNetworkInterface(options.uri, options.opts)
  }
}
