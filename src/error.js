function ExtendableError () {
  // Not passing "newTarget" because core-js would fall back to non-exotic
  // object creation.
  const instance = Reflect.construct(Error, Array.from(arguments))
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this))
  instance.name = this.constructor.name
  return instance
}

ExtendableError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true
  }
})

if (Object.setPrototypeOf) {
  Object.setPrototypeOf(ExtendableError, Error)
} else {
  // eslint-disable-next-line no-proto
  ExtendableError.__proto__ = Error
}

export class MagnusError extends ExtendableError {
  constructor (message, data) {
    super(message)
    this.data = data
  }
}
