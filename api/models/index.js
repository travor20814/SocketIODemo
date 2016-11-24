/* eslint no-console: [0]*/
import Sequelize from 'sequelize';
import debug from 'debug';

import MemberModel from './Member.js';
import RoleModel, {
  generateDefaultRoles,
} from './Role.js';
import RoleActionModel, {
  bindDefaultActions,
} from './RoleAction.js';

const debugDB = debug('SocketIODemo:Database');

debugDB('Loading Models...');

const NODE_ENV = process.env.NODE_ENV || 'development';
const SOCKETIODEMO_DB = process.env.SOCKETIODEMO_DB || 'mariadb://rytass:rytass2O15@localhost/socketiodemo';
const RESET_DB = process.env.RESET_DB || false;

export const sequelize = new Sequelize(SOCKETIODEMO_DB, {
  sync: {
    force: !!RESET_DB,
  },
  define: {
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
  logging: NODE_ENV === 'development' ? console.log : false,
  timezone: '+08:00',
});

export default sequelize;

export const Member = new MemberModel(sequelize);
export const Role = new RoleModel(sequelize);
export const RoleAction = new RoleActionModel(sequelize);

Member.associate(sequelize.models);
Role.associate(sequelize.models);
RoleAction.associate(sequelize.models);

export function migrationData() {
  return new Promise(async (resolve, reject) => {
    if (!RESET_DB) {
      return resolve();
    }

    try {
      const admin = await Member.create({
        account: process.env.ADMIN_ACCOUNT || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin',
        name: process.env.ADMIN_NAME || 'Rytass',
      });

      const roles = await generateDefaultRoles(Role);

      await bindDefaultActions(roles, RoleAction);

      // add role
      await admin.addRole(roles.admin);

      return resolve();
    } catch (e) {
      return reject(e);
    }
  });
}
