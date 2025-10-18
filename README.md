# Jarvis OS

## WARNING FOR ALL THOSE PUBLIC USERS

This program was for long a private repo, and in October 18, 2025 I'm deciding to make it publicly available for private reasons.

1. NOTE THAT this app will most certainly crash on Windows, regarding Linux chances are 50/50, I was using MacOS.
2. NOTE THAT you need a Google Cloud Account to use it
3. NOTE THAT if the app launches, and you didn't specify 10+ photos in the training/[YourName] - Jarvis will NOT be able to recognize your face
4. NOTE THAT if Jarvis does not recognize your face - it blocks access to your computer (that's actually a feat, yeah...) and hotkeys will NOT work (the only way to bypass it is restart your computer).
5. NOTE THAT technically, all the soil for Jarvis being able to interact with your browser exists, there's one problem... The Google Extension that I developed that allowed such connection is unavailable, because I forgot to save that extension in a repo and accidentally removed it...

ALSO from what I understood, Youtube disabled some things, so now developers like me cannot directly fully operate with Youtube Videos (which was used to play music), theoretically I would find a workaround for that, but have no will...

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