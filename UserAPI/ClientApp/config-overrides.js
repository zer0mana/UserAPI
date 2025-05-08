const { override, addWebpackModuleRule, overrideDevServer } = require('customize-cra');

module.exports = {
  webpack: override(
    addWebpackModuleRule({
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    })
  ),
  devServer: overrideDevServer(config => {
    return {
      ...config,
      allowedHosts: 'all',
      host: 'localhost',
      port: 3006,
      proxy: {
        '/api': {
          target: 'http://localhost:5183',
          secure: false,
          changeOrigin: true,
          headers: {
            Connection: 'keep-alive'
          },
          onError: (err, req, res) => {
            console.error('Proxy Error:', err);
            res.writeHead(500, {
              'Content-Type': 'text/plain',
            });
            res.end('Ошибка подключения к серверу. Пожалуйста, убедитесь, что сервер запущен на порту 8081.');
          }
        },
        '/pyd-user-api-handler': {
          target: 'http://localhost:5183',
          secure: false,
          changeOrigin: true,
          headers: {
            Connection: 'keep-alive'
          },
          onError: (err, req, res) => {
            console.error('Proxy Error:', err);
            res.writeHead(500, {
              'Content-Type': 'text/plain',
            });
            res.end('Ошибка подключения к серверу. Пожалуйста, убедитесь, что сервер запущен.');
          }
        }
      }
    };
  })
}; 