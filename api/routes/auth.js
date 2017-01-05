import { Router } from 'express';
import RouteKeeper from 'express-route-keeper';
import debug from 'debug';
import {
  getAccessToken,
  certificateFacebookToken,
  getUserInfo,
} from './facebook.js';
import jwt from 'jsonwebtoken';
import {
  Member,
  Role,
  RoleAction,
} from '../models/index.js';

const JWT_TOKEN = process.env.JWT_TOKEN || '_SocketIODemo*Rytass$';
const debugACL = debug('SocketIODemo:ACL');

const keeper = new RouteKeeper();
const router = new Router();

router.post('/login', keeper({
  account: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  facebookToken: {
    type: String,
    required: false,
  },
}), async (req, res) => {
  if ((!req.body.account && req.body.password) ||
      (req.body.account && !req.body.password) ||
      (!req.body.account && !req.body.password && !req.body.facebookToken)) {
    res.status(400);
    return res.json({
      message: 'Invalid Parameter',
    });
  }

  if (req.body.facebookToken) {
    const accessToken = await getAccessToken();
    const {
      isValid,
      userId,
    } = await certificateFacebookToken(accessToken, req.body.facebookToken);

    if (isValid) {
      const member = await Member.findOne({
        where: {
          facebookId: userId,
        },
        include: [{
          model: Role,
          required: false,
          attributes: [
            'name',
          ],
          include: [{
            model: RoleAction,
            required: false,
            attributes: [
              'action',
            ],
          }],
        }],
      });

      if (!member) {
        res.status(401);
        return res.json({
          message: 'Resource not found',
        });
      }

      const memberActions = [];
      member.Roles.forEach((role) => {
        role.RoleActions.forEach((roleAction) => memberActions.push(roleAction.action));
      });

      const tokenPayload = {
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        roles: member.Roles.map((role) => role.name),
        actions: memberActions,
      };

      return res.json({
        accessToken: jwt.sign(tokenPayload, JWT_TOKEN, {
          expiresIn: '14d',
        }),
        ...tokenPayload,
      });
    }

    res.status(400);
    return res.json({
      message: 'Invalid Token.',
    });
  }

  const member = await Member.findOne({
    where: {
      account: req.body.account,
    },
    include: [{
      model: Role,
      required: false,
      attributes: [
        'name',
      ],
      include: [{
        model: RoleAction,
        required: false,
        attributes: [
          'action',
        ],
      }],
    }],
  });

  if (!member) {
    res.status(401);
    return res.json({
      message: 'Resource not found',
    });
  }

  if (member.validPassword(req.body.password)) {
    const memberActions = [];
    member.Roles.forEach((role) => {
      role.RoleActions.forEach((roleAction) => memberActions.push(roleAction.action));
    });

    const tokenPayload = {
      id: member.id,
      name: member.name,
      roles: member.Roles.map((role) => role.name),
      actions: memberActions,
    };

    return res.json({
      accessToken: jwt.sign(tokenPayload, JWT_TOKEN, {
        expiresIn: '14d',
      }),
      ...tokenPayload,
    });
  }

  res.status(401);
  return res.json({
    message: 'Password invalid.',
  });
});

router.post('/signup', keeper({
  account: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  avatar: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  facebookToken: {
    type: String,
    required: false,
  },
}), async (req, res) => {
  /* check parameter */
  if (!((req.body.facebookToken && (!req.body.account && !req.body.password && !req.body.avatar && !req.body.name)) ||
      (!req.body.facebookToken && (req.body.account && req.body.password && req.body.avatar && req.body.name)))) {
    res.status(400);
    return res.json({
      message: 'Invalid Parameter',
    });
  }

  if (req.body.facebookToken) {
    const accessToken = await getAccessToken();
    const {
      isValid,
      userId,
    } = await certificateFacebookToken(accessToken, req.body.facebookToken);

    if (isValid) {
      const {
        name,
        email,
      } = await getUserInfo(req.body.facebookToken);

      try {
        const member = await Member.create({
          account: email,
          facebookId: userId,
          name,
          avatar: `http://graph.facebook.com/v2.8/${userId}/picture?width=99999`,
        });

        const student = await Role.findOne({
          where: {
            name: '學生',
          },
          attributes: [
            'id',
          ],
        });

        await member.addRole(student);

        return res.json({
          id: member.id,
        });
      } catch (e) {
        res.status(400);
        return res.json({
          message: 'Duplicate account.',
        });
      }
    }

    res.status(400);
    return res.json({
      message: 'Invalid Token.',
    });
  }

  try {
    const member = await Member.create({
      account: req.body.account,
      password: req.body.password,
      name: req.body.name,
      avatar: req.body.avatar,
    });

    const student = await Role.findOne({
      where: {
        name: '學生',
      },
      attributes: [
        'id',
      ],
    });

    await member.addRole(student);

    return res.json({
      id: member.id,
    });
  } catch (e) {
    res.status(400);
    return res.json({
      message: 'Duplicate account.',
    });
  }
});

export default router;

export async function aclInjector(req, res, next) {
  const jwtToken = req.headers.authorization;
  req.tokenPayload = {};

  if (jwtToken) {
    jwt.verify(jwtToken.replace(/^Bearer\s/, ''), JWT_TOKEN, async (err, payloads) => {
      if (err) {
        debugACL(err);

        req.aclActions = [];
        next();
      } else {
        req.aclActions = payloads.actions;
        req.tokenPayload = payloads;
        next();
      }
    });
  } else {
    req.aclActions = [];
    next();
  }
}
