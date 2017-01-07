
import http from 'http';
import SocketIo from 'socket.io';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

const JWT_TOKEN = process.env.JWT_TOKEN || '_SocketIODemo*Rytass$';

export function addSocketIO(app) {
  const server = http.Server(app);
  const io = new SocketIo(server);
  const userList = [];

  io.on('connection', (socket) => {
    io.emit('connected', {
      content: `-- [ ${socket.handshake.query.name || 'new user'} ] joined the chat room --`,
    });
    socket.on('join', data => {
      console.log(data);
      const jwtToken = data.accessToken;
      jwt.verify(jwtToken.replace(/^Bearer\s/, ''), JWT_TOKEN, async (err, payloads) => {
        if (err) {
          return;
        }

        console.log(payloads);
        if (!(_.find(userList, user => user.id === payloads.id))) {
        console.log(`add user id=${payloads.id}`);
          userList.push({
            socketId: socket.id,
            aclActions: payloads.actions,
            payloads,
          });
        }

        io.emit('checkUser', {
          list: userList,
        });
      });
    });
    socket.on('send', data => {
      console.log(data);
      const jwtToken = data.accessToken;
      jwt.verify(jwtToken.replace(/^Bearer\s/, ''), JWT_TOKEN, async (err, payloads) => {
        if (err) {
          return;
        }

        const sender = _.find(userList, user => user.payloads.id === payloads.id);
        console.log(sender);
        if (sender) {
          socket.broadcast.emit('receive', {
            id: sender.payloads.id || 1,
            avatar: sender.payloads.avatar,
            name: sender.payloads.name || '江西拿',
            content: `[ ${sender.payloads.name || sender.payloads.id} ]: ${data.content}`,
          });
        }
      });
    });
    socket.on('disconnect', () => {
      const leaveIndex = userList.findIndex((s) => s.socketId === socket.id);
      if (leaveIndex >= 0) userList.splice(leaveIndex, 1);

      io.emit('disconnection', {
        content: `-- [ ${socket.handshake.query.name || socket.id} ] disconnected --`,
        list: userList,
      });
    });
  });

  return server;
}
