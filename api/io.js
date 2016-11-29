
import http from 'http';
import SocketIo from 'socket.io';

export function addSocketIO(app) {
  const server = http.Server(app);
  const io = new SocketIo(server);
  const userName = 'user';

  io.on('connection', (socket) => {
    console.info(`New client connected (id=${socket.id}).`);
    socket.emit('news', { hello: 'world' });
    socket.on('send', (data) => {
      console.log(`id[${socket.id}]: ${data}`);
      socket.broadcast.emit('receive', {
        id: socket.id || 1,
        avatar: 'http://orig06.deviantart.net/8267/f/2012/133/6/f/xcsox_basic_avatar_pack__1__john_cena_starz_by_xcaptainshowoffx-d4zkfdc.jpg',
        name: '江西拿',
        content: `id[${socket.id}]:${data}`,
      });
    });
    socket.emit('receive', {
      content: `Welcome ${userName}`,
    });
  });

  return server;
}
