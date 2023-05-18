import { ResponseType } from './types';

export const ResponseEvents: Record<ResponseType, string> = {
  [ResponseType.LOGIN]: 'auth:on-login-response',
  [ResponseType.REGISTER]: 'auth:on-register-response',
  [ResponseType.CHECK_AUTH]: 'auth:on-check-auth-response',
  [ResponseType.FIND_USER]: 'chat:on-find-user-response',
  [ResponseType.GET_CONVERSATIONS]: 'chat:on-get-conversations-response',
  [ResponseType.GET_CONVERSATION_BY_ID]: 'chat:on-get-conversation-response',
  [ResponseType.NEW_MESSAGE]: 'chat:on-new-message',
  [ResponseType.READED_MESSAGE]: 'chat:on-readed-message',
  [ResponseType.NEW_PRIVATE_CONVERSATION]:
    'chat:on-create-private-conversation-reponse',
  [ResponseType.NEW_GROUP_CONVERSATION]:
    'chat:on-create-group-conversation-reponse',
};
