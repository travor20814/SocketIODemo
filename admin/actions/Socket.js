import io from 'socket.io-client';

const socket = io.connect('http://localhost:1733');

export const SEND_MESSAGE = Symbol('SEND_MESSAGE');

export function sendMessage() {
  const message = 'hi';

  socket.emit('send', message);
  return {
    type: SEND_MESSAGE,
    message,
  };
}
