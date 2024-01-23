const port = process.env.PORT ? Number(process.env.PORT) : 6060;
const host = process.env.HOST ?? 'localhost';

const urlPrefix = `http://${host}:${port}`;

module.exports = {
  openapi: '3.0.0',
  info: {
    // API informations (required)
    title: 'InkStain', // Title (required)
    version: '1.0.0', // Version (required)
  },
  servers: [
    {
      url: `${urlPrefix}/api/v1`,
      description: 'Local server',
    }
  ]
};
