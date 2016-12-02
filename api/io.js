
import http from 'http';
import SocketIo from 'socket.io';

export function addSocketIO(app) {
  const server = http.Server(app);
  const io = new SocketIo(server);
  const userList = [];

  io.on('connection', (socket) => {
    userList.push(socket.handshake.query.name || socket.id);
    io.emit('connected', {
      content: `-- [ ${socket.handshake.query.name || socket.id} ] joined the chat room --`,
      list: userList,
    });
    socket.on('send', (data) => {
      socket.broadcast.emit('receive', {
        id: socket.id || 1,
        avatar: 'http://orig06.deviantart.net/8267/f/2012/133/6/f/xcsox_basic_avatar_pack__1__john_cena_starz_by_xcaptainshowoffx-d4zkfdc.jpg',
        name: socket.handshake.query.name || '江西拿',
        content: `[ ${socket.handshake.query.name || socket.id} ]: ${data}`,
      });
    });
    socket.on('disconnect', () => {
      const leaveIndex = userList.findIndex((s) => s === socket.handshake.query.name);
      if (leaveIndex >= 0) userList.splice(leaveIndex, 1);

      io.emit('disconnection', {
        content: `-- [ ${socket.handshake.query.name || socket.id} ] disconnected --`,
        list: userList,
      });
    });
  });

  return server;
}
