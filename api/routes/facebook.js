import request from 'request';

export const FACEBOOK_HOST = 'https://graph.facebook.com';

function parseAccessToken(body) {
  if (typeof body === 'string' && body.indexOf('access_token=') === 0) {
    return body.substring('access_token='.length);
  }
  return null;
}

export function getAccessToken() {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      url: `${FACEBOOK_HOST}/oauth/access_token?`,
      qs: {
        client_id: '656017987892779',
        client_secret: 'd7fe8219684aa5a0ae0984712c3e01b3',
        grant_type: 'client_credentials',
      },
      json: true,
    };
    request(options, (error, response, body) => {
      resolve(parseAccessToken(body));
    });
  });
}

export function certificateFacebookToken(accessToken, inputToken) {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      url: `${FACEBOOK_HOST}/debug_token?`,
      qs: {
        access_token: accessToken,
        input_token: inputToken,
      },
      json: true,
    };
    request(options, (error, response, body) => resolve({
      isValid: body && body.data && body.data.is_valid || false,
      userId: body && body.data && body.data.user_id || null,
    }));
  });
}

export function getUserInfo(accessToken) {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      url: `${FACEBOOK_HOST}/me?`,
      qs: {
        access_token: accessToken,
        fields: 'id,name,email',
      },
      json: true,
    };
    request(options, (error, response, body) => resolve(body));
  });
}
