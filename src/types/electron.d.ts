declare global {
  interface Window {
    textInputAPI: {
      submitQuery: (query: string) => void;
    };
    passwordAPI: {
      verifyPassword: (password: string) => void;
      cancelVerification: () => void;
    };
    mainWindowAPI: {
      onMessage: (channel: string, func: (...args: any[]) => void) => void;
      sendMessage: (channel: string, data: any) => void;
    };
  }
}

export { };
