import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import reducers, { initialState } from './reducers'
import storage from './storage'

const preloadedState = {
  magnus: {
    ...initialState,
    session: storage.load()
  }
}

const MagnusStore = createStore(reducers, preloadedState, applyMiddleware(thunkMiddleware))

export default MagnusStore
