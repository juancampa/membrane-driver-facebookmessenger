const { environment, schema, endpoints } = program;

program.name = 'facebookmessenger';
program.isDriver = true;

environment
  .add('ACCESS_TOKEN', 'The Facebook access token')

// Endpoints
endpoints
  .https('webhook', 'Set this URL in Facebook App page to enable webhooks', { response: true })

schema.type('Root')
  .action('sendMessage')
    .param('text', 'String')
  .event('messageReceived')
    .param('text', 'String')

