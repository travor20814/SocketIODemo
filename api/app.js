import express from 'express';
import db, {
  migrationData,
} from './models/index.js';
import debug from 'debug';
import bodyParser from 'body-parser';
import cors from 'cors';

// Routes
import AuthRouter, {
  aclInjector,
} from './routes/auth.js';

export const COURSE_NOT_FOUND = 'Course not found.';
export const MEMBER_DOES_NOT_HAVE_COURSE = 'Member does not have course.';
export const MEMBER_NOT_FOUND = 'Member not found.';

const debugServer = debug('SocketIODemo:Server');

// Sync Server
(async () => {
  try {
    await db.sync();
    await migrationData();
  } catch (e) {
    debugServer('Sync database failed:', e);
  }
})();

const NODE_ENV = process.env.NODE_ENV || 'development';

export function makeExpressApp() {
  const app = express();

  if (NODE_ENV !== 'production') {
    app.use(cors());
  }

  app.use(bodyParser.json());

  app.use('/auth', AuthRouter);

  app.use(aclInjector);

  return app;
}
