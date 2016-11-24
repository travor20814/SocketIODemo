import Sequelize from 'sequelize';

export const USE_FRONTEND = 'USE_FRONTEND';
export const USE_BACKEND = 'USE_BACKEND';

export function bindDefaultActions(roles, RoleAction) {
  return new Promise(async (resolve, reject) => {
    try {
      const useFrontend = await RoleAction.create({
        action: USE_FRONTEND,
      });

      await useFrontend.setRole(roles.student);

      const useBackend = await RoleAction.create({
        action: USE_BACKEND,
      });

      await useBackend.setRole(roles.admin);

      resolve();
    } catch (ex) {
      reject(ex);
    }
  });
}

export default function (sequelize) {
  const RoleAction = sequelize.define('RoleAction', {
    action: {
      type: Sequelize.ENUM(
        USE_FRONTEND,
        USE_BACKEND,
      ),
      allowNull: false,
    },
  }, {
    indexes: [{
      unique: true,
      fields: [
        'action',
        'RoleId',
      ],
    }],
    classMethods: {
      associate: (models) => {
        RoleAction.belongsTo(models.Role);
      },
    },
  });

  return RoleAction;
}
