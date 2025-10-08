declare global {
  interface Window {
    recaptchaVerifier?: any;
    confirmationResult?: any;
  }
}

export {};

// Allow side-effect imports of CSS files used by some third-party packages
declare module '*.css';
