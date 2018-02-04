process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const baseURL = 'https://api.paybyphone.com';
const credentials = {
  client: {
    id: 'paybyphone_webapp',
    secret: 'secret',
  },

  auth: {
    tokenHost: baseURL,
    tokenPath: '/identity/token',
  }
};
const oauth = require('simple-oauth2').create(credentials);

// Gets an unexpired token
export async function getToken() {
  let token;

  // If we already have a token refresh it (if needed) and return it
  if (program.state.token) {
    token = oauth.accessToken.create(program.state.token);
    if (token.expired()) {
      token = await token.refresh();
    }
    return token;
  } else {
    const { password, username } = process.env;
    token = oauth.accessToken.create(await oauth.ownerPassword.getToken({ password, username }));
  }

  return token;
}

export async function getClient() {
  const token = await getToken();
  return require('axios').create({
    baseURL: 'https://localhost:4443',
    headers: {
      'Authorization': `bearer ${token.token.access_token}`,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36',
      'Origin': 'https://m2.paybyphone.com',
      'x-pbp-version': 2,
    },
  });
}

export async function get(url) {
  const client = await getClient();
  const result = await client.get(url);
  return result.data;
}

export async function post(url, body) {
  const client = await getClient();
  const result = await client.post(url, body);
  return result;
}

export async function put(url, body) {
  const client = await getClient();
  const result = await client.put(url, body);
  return result;
}
