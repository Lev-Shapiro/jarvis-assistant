const path = require('path');
const fs = require('fs');

// Get all TypeScript files in the renderer directory
const rendererDir = path.join(__dirname, 'src', 'pages');
const entryPoints = {};

// Read the renderer directory to find all TypeScript files
fs.readdirSync(rendererDir)
  .filter(file => file.endsWith('.ts'))
  .forEach(file => {
    const name = file.replace('.ts', '');
    entryPoints[name] = path.join(rendererDir, file);
  });

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: entryPoints,
  output: {
    path: path.resolve(__dirname, 'dist', 'pages'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.renderer.json'
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  target: 'web',
  // Use source-map for both dev and prod, but inline only for dev
  devtool: isProduction ? 'source-map' : 'inline-source-map'
}; 