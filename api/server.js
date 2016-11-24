import {
  makeExpressApp,
} from './app.js';
import {
  addSocketIO,
} from './io.js';
import debug from 'debug';

const debugServer = debug('SocketIODemo:Server');
const PORT = process.env.PORT || 1733;

const app = makeExpressApp();
const server = addSocketIO(app);

server.listen(PORT, (err) => {
  if (err) {
    debugServer('Listen server on port %s error: %s', PORT, err);
  } else {
    debugServer('Server listen on port', PORT);
  }
});
