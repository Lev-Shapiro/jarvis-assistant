# Jarvis OS

## Google Cloud Setup

This application uses Google Cloud services for Text-to-Speech and Speech-to-Text functionality. Follow these steps to set up your Google Cloud credentials:

1. Create a Google Cloud account at https://cloud.google.com/ if you don't have one.

2. Create a new project in the Google Cloud Console.

3. Enable the following APIs for your project:
   - Cloud Text-to-Speech API
   - Cloud Speech-to-Text API

4. Create a service account key:
   - Go to IAM & Admin > Service Accounts
   - Create a new service account
   - Grant it the necessary roles (at minimum: Cloud Speech Client, Cloud Text-to-Speech Client)
   - Create and download a JSON key file

5. Set up authentication:
   - Option 1: Set the environment variable GOOGLE_APPLICATION_CREDENTIALS to the path of your JSON key file:
     ```
     export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-key-file.json"
     ```
   - Option 2: Add the path to your .env file:
     ```
     GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-key-file.json"
     ```

## Development

```bash
# Install dependencies
npm install

# Start the application
npm start
```

## Build

```bash
# Build the application
npm run build

# Package the application
npm run package
``` 