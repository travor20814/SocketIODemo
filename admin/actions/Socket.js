import io from 'socket.io-client';

export const SEND_MESSAGE = Symbol('SEND_MESSAGE');

export function sendMessage(socket) {
  const message = 'hi';

  socket.emit('send', message);
  return {
    type: SEND_MESSAGE,
    message,
  };
}
