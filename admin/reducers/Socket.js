import {
  SEND_MESSAGE,
} from '../actions/Socket.js';

const initialState = {
  message: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SEND_MESSAGE:
      return Object.assign({}, state, {
        message: action.message,
      });
    default:
      return state;
  }
};
