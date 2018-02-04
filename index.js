import { parse as parseQuery } from 'querystring';
import { parse as parseUrl } from 'url';
import { randomBytes } from 'crypto';
const { root } = program.refs;

export async function init() {
  program.state.verifyToken = randomBytes(32).toString('hex');
  await program.save();

  console.log('Webhook URL:', program.endpoints.webhook.url);
  console.log('Verify token:', program.state.verifyToken);
}

export async function update({ toVersion }) {
  console.log("Updating Facebook Messengerrrr driver");
  if (program.state.userId) {
    await sendMessage(`Updated to version: ${toVersion}`);
    await sendMessage(`token: ${program.state.verifyToken}`);
  }
}

export function endpoint({ name, req }) {
  if (name === 'webhook') {
    return handleWebhook(req);
  }
}

async function handleWebhook(req) {
  const { body, url } = req;
  const query = parseQuery(parseUrl(url).query);
  console.log('QUERY', query);

  if (query['hub.verify_token'] === program.state.verifyToken) {
    return { body: query['hub.challenge'] };
  } else if (body.object === 'page') {
    for (let pageEntry of body.entry) {
      for (let event of pageEntry.messaging) {
        if (event.optin) {
        } else if (event.message) {
          await onMessageReceived(event);
        } else if (event.delivery) {
        } else if (event.postback) {
        } else if (event.read) {
        } else if (event.account_linking) {
        } else {
          console.log("Webhook received unknown messaging event: ", event);
        }
      }
    }
  }
}

async function sendMessage(text) {
  const client = require('axios').create();
  const body = {
    recipient: {
      id: program.state.userId,
    },
    message: {
      text,
    }
  };

  const result = await client.post(`https://graph.facebook.com/v2.6/me/messages?access_token=${process.env.ACCESS_TOKEN}`, body);
  console.log(result.status);
  console.log(result.body);
}

async function onMessageReceived(event) {
  // For now, when we get the first message we are bound to this user
  if (!program.state.userId) {
    program.state.userId = event.sender.id;
    await program.save();
  }

  const { message } = event;
  if (message.text) {
    console.log('MESSAGE TEXT', message.text);
    root.messageReceived.dispatch({ text: message.text });
  } else if (message.attachments) {
    console.log('MESSAGE ATTACHMENTS', message.attachments);
  } else if (message.quick_reply) {
    console.log('MESSAGE QUICK REPLY', message.quick_reply);
  }

}

export let Root = {
  sendMessage({ args }) {
    return sendMessage(args.text);
  },
}

