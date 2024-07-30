const { override, overrideDevServer } = require('customize-cra');

const devServerConfig = () => config => {
  return {
    ...config,
    allowedHosts: ['54.37.234.226/'],
  };
};

module.exports = {
  webpack: override(),
  devServer: overrideDevServer(devServerConfig())
};
