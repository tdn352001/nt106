import { AuthHandler, ConversationHanlder, ServerHanlder } from 'main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    auth: AuthHandler;
    server: ServerHanlder;
    conversation: ConversationHanlder;
  }
}

export {};
