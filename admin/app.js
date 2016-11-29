import 'babel-polyfill';
import React from 'react';
import thunk from 'redux-thunk';
import {
  createStore,
  compose,
  applyMiddleware,
} from 'redux';
import {
  Provider,
} from 'react-redux';
import {
  Router,
  Route,
  browserHistory,
} from 'react-router';
import fetchMiddleware from 'redux-middleware-fetch';
import reducer from './reducers/index.js';
import {
  syncHistoryWithStore,
  routerMiddleware,
} from 'react-router-redux';
import Reactotron from 'reactotron';

// React Otron
// Reactotron.connect();

export const store = createStore(reducer, {}, compose(
  applyMiddleware(
    thunk,
    routerMiddleware(browserHistory),
    fetchMiddleware,
    Reactotron.reduxMiddleware,
  ),
  Reactotron.storeEnhancer(),
));

// Pages
import MainBoard from './containers/MainBoard.js';

const history = syncHistoryWithStore(browserHistory, store);

export default (
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={MainBoard} />
    </Router>
  </Provider>
);
