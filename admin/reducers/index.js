import {
  combineReducers,
} from 'redux';

import {
  routerReducer,
} from 'react-router-redux';

import Socket from './Socket.js';

export default combineReducers({
  Socket,
  routing: routerReducer,
});
