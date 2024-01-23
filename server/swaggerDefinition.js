const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const host = `http://${process.env.HOST}:${port}`;

module.exports = {
  openapi: '3.0.0',
  info: {
    // API informations (required)
    title: 'InkStain', // Title (required)
    version: '1.0.0', // Version (required)
  },
  servers: [
    {
      url: `${host}/api/v1`,
      description: 'Local server',
    }
  ]
};
