import magnus from './index'

const TIMEOUT = 'TIMEOUT'

function createTimeout (milliseconds = 0) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve(TIMEOUT)
    }, milliseconds)
  })
}

function waitUntilAuthenticated (timeout) {
  let expired = false
  timeout.then(() => {
    expired = true
  })
  return Promise.race([
    timeout,
    new Promise((resolve) => {
      if (expired === true) {
        resolve(TIMEOUT)
        return
      }
      if (magnus.state.isAuthenticating) {
        setTimeout(function () {
          resolve(waitUntilAuthenticated(timeout))
        }, 100)
        return
      }
      if (magnus.state.isAuthenticated) {
        resolve()
        return
      }
      magnus.authenticate()
      setTimeout(function () {
        resolve(waitUntilAuthenticated(timeout))
      }, 100)
      return
    })
  ])
}

export const HTTPBearerMiddleware = {
  applyMiddleware ({ request, options }, next) {
    const opts = options.options || {}
    if (opts.authorization === false) {
      return next()
    }
    if (magnus.state.isAuthenticated === false) {
      const milliseconds = opts.timeout || 5000
      const timeout = createTimeout(milliseconds)
      waitUntilAuthenticated(timeout).then((result) => {
        if (result === TIMEOUT) {
          throw new Error(`authentication timeout after ${milliseconds}ms`)
        }
        HTTPBearerMiddleware.applyMiddleware({ request, options }, next)
      })
      return
    }
    const headers = Object.assign({}, options.headers, {
      'Authorization': `Bearer ${magnus.session.idToken}`
    })
    options.headers = headers
    return next()
  }
}
