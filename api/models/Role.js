import Sequelize from 'sequelize';

export let ADMIN;
export let STUDENT;

export const Roles = {};

export function generateDefaultRoles(Role) {
  return new Promise(async (resolve, reject) => {
    try {
      // Admin Role
      ADMIN = await Role.create({
        name: '系統管理員',
      });

      STUDENT = await Role.create({
        name: '學生',
      });

      resolve({
        admin: ADMIN,
        student: STUDENT,
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

export default function (sequelize) {
  const Role = sequelize.define('Role', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }, {
    classMethods: {
      associate: (models) => {
        Role.hasMany(models.RoleAction);
        Role.belongsToMany(models.Member, {
          through: 'MemberRoles',
        });
      },
    },
  });

  return Role;
}
