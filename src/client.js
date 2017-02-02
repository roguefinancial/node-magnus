import fetch from 'isomorphic-fetch'

let issuerPromise = null

const MagnusClient = {

  config: {
    clientId: null,
    endpoint: 'https://magnus.rogue.team',
    issuer: null
  },

  fetch (input0, init0 = {}) {
    const init = Object.assign({}, init0)
    const options = init.options || {}
    delete init.options
    const input = MagnusClient.getURL(input0, options)
    if (input === false) {
      return MagnusClient.fetchIssuer().then(() => {
        return MagnusClient.fetch(input0, init0)
      })
    }
    return fetch(input, init)
  },

  fetchIssuer () {
    if (issuerPromise === null) {
      issuerPromise = MagnusClient.fetch(`/client/${MagnusClient.config.clientId}`, {
        cache: 'default',
        credentials: 'omit',
        method: 'GET',
        mode: 'cors',
        options: {
          authorization: false,
          issuer: false
        }
      }).then((response) => {
        return response.json()
      }).then((data) => {
        if (data && data.issuer) {
          MagnusClient.config.issuer = data.issuer
          return Promise.resolve(MagnusClient.config.issuer)
        }
        return Promise.reject(data)
      }).catch((response) => {
        issuerPromise = null
        return Promise.reject(response)
      })
    }
    return issuerPromise
  },

  getURL (input, options) {
    if (options.issuer === false) {
      return `${MagnusClient.config.endpoint}${input}`
    }
    if (MagnusClient.config.issuer === null) {
      return false
    }
    return `${MagnusClient.config.issuer}${input}`
  }

}

export default MagnusClient
