let localStorage

if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
  let internal = {}
  localStorage = {
    setItem (id, val) { internal[id] = String(val) },
    getItem (id) { return internal.hasOwnProperty(id) ? internal[id] : undefined },
    removeItem (id) { delete internal[id] },
    clear () { internal = {} }
  }
} else {
  localStorage = window.localStorage
}

export default localStorage
