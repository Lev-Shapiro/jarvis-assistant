const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  // Entry points for your renderer process scripts
  entry: {
    'pages/main/main-renderer': './src/pages/main/main-renderer.ts',
    'pages/infobar/infobar-renderer': './src/pages/infobar/infobar-renderer.ts',
    // Add other renderer entries here if needed
  },
  
  // Configure output
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js', // Output will be dist/pages/main/main-renderer.js, etc.
  },
  
  // Target the electron renderer process
  target: 'electron-renderer',
  
  // Module rules for processing different file types
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              // Use the specific tsconfig for renderer code
              configFile: 'tsconfig.renderer.json',
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  
  // Resolve extensions
  resolve: {
    extensions: ['.ts', '.js'],
    // Add aliases corresponding to tsconfig paths
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      // Add other aliases here if needed, e.g.:
      // '@pages': path.resolve(__dirname, 'src/pages/')
    }
  },
  
  // Use CopyPlugin to copy HTML and CSS files
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          context: 'src',
          from: 'pages/**/*.html',
          to: '[path][name][ext]',
        },
        {
          context: 'src',
          from: 'pages/**/*.css',
          to: '[path][name][ext]',
        },
      ],
    }),
  ],
  
  // Mode can be 'development' or 'production'
  mode: 'production',
};
