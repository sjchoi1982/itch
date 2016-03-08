
import {omit} from 'underline'

import {createStore, applyMiddleware, compose} from 'redux'
import {electronEnhancer} from 'redux-electron-store'
import {install as reduxLoop} from 'redux-loop'
import thunk from 'redux-thunk'
import createLogger from 'redux-cli-logger'
import createSagaMiddleware from 'redux-saga'

import sagas from '../sagas'
import reducer from '../reducers'

const middleware = [
  createSagaMiddleware(...sagas),
  thunk
]

if (process.env.NODE_ENV === 'development') {
  const logger = createLogger({
    predicate: (getState, action) => !action.MONITOR_ACTION,
    stateTransformer: (state) => state::omit('ui')
  })

  middleware.push(logger)
}

const enhancer = compose(
  electronEnhancer(),
  applyMiddleware(...middleware),
  reduxLoop()
)

const initialState = {}
const store = createStore(reducer, initialState, enhancer)

export default store