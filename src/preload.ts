import { contextBridge, ipcRenderer } from 'electron';

// contextBridge.exposeInMainWorld('electronAPI', {
//   // Example: Allow sending messages to the main process
//   sendMessage: (channel: string, data: any) => {
//     // Whitelist channels
//     const validChannels = ['notification:show-error']; // Add channels you want to allow
//     if (validChannels.includes(channel)) {
//       ipcRenderer.send(channel, data);
//     }
//   },
//   // Example: Allow receiving messages from the main process
//   onMessage: (channel: string, func: (...args: any[]) => void) => {
//     const validChannels = ['notification:show-error']; // Add channels you want to allow
//     if (validChannels.includes(channel)) {
//       // Deliberately strip event as it includes `sender` 
//       ipcRenderer.on(channel, (event, ...args) => func(...args));
//     }
    
//     // Return a function to remove the listener when no longer needed
//     return () => {
//       if (validChannels.includes(channel)) {
//         ipcRenderer.removeListener(channel, func);
//       }
//     };
//   },
// });

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('mainWindowAPI', {
  onMessage: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  sendMessage: (channel: string, data: any) => {
    ipcRenderer.send(channel, data);
  }
});

// Expose text input API to renderer
contextBridge.exposeInMainWorld('textInputAPI', {
  submitQuery: (query: string) => {
    ipcRenderer.invoke('text-input', query);
  }
});

// Expose password verification API to renderer
contextBridge.exposeInMainWorld('passwordAPI', {
  verifyPassword: (password: string) => {
    ipcRenderer.invoke('verify-password', password);
  },
  cancelVerification: () => {
    ipcRenderer.invoke('cancel-verification');
  }
});