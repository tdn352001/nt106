import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ResponseEvents } from './chat-client/models';
import {
  AuthResponse,
  ConnectState,
  CreateGroupConversationRequest,
  CreateGroupConversationResponse,
  CreatePrivateConversationRequest,
  CreatePrivateConversationResponse,
  FindUsersReponse,
  GetConversationByIdResponse,
  GetConversationResponse,
  IpcMainEvent,
  IpcMainTrigger,
  NewMessageResponse,
  ReadedMessageResponse,
  ResponseType,
  SendTextMessageRequest,
} from './chat-client/types';

const authHanlder = {
  login: (form: any) => {
    ipcRenderer.invoke(IpcMainTrigger.LOGIN, form);
  },
  onLoginResponse: (callback: (data: AuthResponse) => void) => {
    const listener = (_: IpcRendererEvent, data: AuthResponse) => {
      callback(data);
    };

    ipcRenderer.on(ResponseEvents[ResponseType.LOGIN], listener);

    return () => {
      ipcRenderer.removeListener(ResponseEvents[ResponseType.LOGIN], listener);
    };
  },
  register: (form: any) => {
    ipcRenderer.invoke(IpcMainTrigger.REGISTER, form);
  },
  onRegisterResponse: (callback: (data: AuthResponse) => void) => {
    const listener = (_: IpcRendererEvent, data: AuthResponse) => {
      callback(data);
    };

    ipcRenderer.on(ResponseEvents[ResponseType.REGISTER], listener);

    return () => {
      ipcRenderer.removeListener(
        ResponseEvents[ResponseType.REGISTER],
        listener
      );
    };
  },
  checkAuth: () => {
    ipcRenderer.invoke(IpcMainTrigger.CHECK_AUTH);
  },
  onCheckAuthResponse: (callback: (data: AuthResponse) => void) => {
    const listener = (_: IpcRendererEvent, data: AuthResponse) => {
      callback(data);
    };

    ipcRenderer.on(ResponseEvents[ResponseType.CHECK_AUTH], listener);

    return () => {
      ipcRenderer.removeListener(
        ResponseEvents[ResponseType.CHECK_AUTH],
        listener
      );
    };
  },
};

const serverHandler = {
  onConnectChange: (callback: (state: ConnectState) => void) => {
    const listener = (_: IpcRendererEvent, data: ConnectState) => {
      callback(data);
    };

    ipcRenderer.on(IpcMainEvent.CONNECT_CHANGE, listener);

    return () => {
      ipcRenderer.removeListener(IpcMainEvent.CONNECT_CHANGE, listener);
    };
  },

  reconnect: () => {
    ipcRenderer.invoke(IpcMainTrigger.RECONNECT);
  },

  getConnectState: (): Promise<ConnectState> => {
    return ipcRenderer.invoke(IpcMainTrigger.GET_CONNECT_STATE);
  },
};

const conversationHanlder = {
  getConversations: () => {
    ipcRenderer.invoke(IpcMainTrigger.GET_CONVERSATIONS);
  },
  onGetConversationsResponse: (
    callback: (data: GetConversationResponse) => void
  ) => {
    const listener = (_: IpcRendererEvent, data: GetConversationResponse) => {
      callback(data);
    };

    ipcRenderer.on(ResponseEvents[ResponseType.GET_CONVERSATIONS], listener);

    return () => {
      ipcRenderer.removeListener(
        ResponseEvents[ResponseType.GET_CONVERSATIONS],
        listener
      );
    };
  },
  getConversationById: (id: string) => {
    ipcRenderer.invoke(IpcMainTrigger.GET_CONVERSATION_BY_ID, id);
  },
  onGetConversationByIdResponse: (
    callback: (data: GetConversationByIdResponse) => void
  ) => {
    const listener = (
      _: IpcRendererEvent,
      data: GetConversationByIdResponse
    ) => {
      callback(data);
    };

    ipcRenderer.on(
      ResponseEvents[ResponseType.GET_CONVERSATION_BY_ID],
      listener
    );

    return () => {
      ipcRenderer.removeListener(
        ResponseEvents[ResponseType.GET_CONVERSATION_BY_ID],
        listener
      );
    };
  },
  onReadedMessage: (callback: (data: ReadedMessageResponse) => void) => {
    const listener = (_: IpcRendererEvent, data: ReadedMessageResponse) => {
      callback(data);
    };

    ipcRenderer.on(ResponseEvents[ResponseType.READED_MESSAGE], listener);

    return () => {
      ipcRenderer.removeListener(
        ResponseEvents[ResponseType.READED_MESSAGE],
        listener
      );
    };
  },
  sendTextMessage: (req: SendTextMessageRequest) => {
    ipcRenderer.invoke(IpcMainTrigger.SEND_TEXT_MESSAGE, req);
  },
  sendFileMessage: (conversationId: string) => {
    return ipcRenderer.invoke(IpcMainTrigger.SEND_FILE_MESSAGE, conversationId);
  },
  onNewMessage: (callback: (data: NewMessageResponse) => void) => {
    const listener = (_: IpcRendererEvent, data: NewMessageResponse) => {
      callback(data);
    };

    ipcRenderer.on(ResponseEvents[ResponseType.NEW_MESSAGE], listener);

    return () => {
      ipcRenderer.removeListener(
        ResponseEvents[ResponseType.NEW_MESSAGE],
        listener
      );
    };
  },
  findUsers: (name: string) => {
    ipcRenderer.invoke(IpcMainTrigger.FIND_USERS, name);
  },
  onFindUsersReponse: (callback: (data: FindUsersReponse) => void) => {
    const listener = (_: IpcRendererEvent, data: FindUsersReponse) => {
      callback(data);
    };

    ipcRenderer.on(ResponseEvents[ResponseType.FIND_USER], listener);

    return () => {
      ipcRenderer.removeListener(
        ResponseEvents[ResponseType.FIND_USER],
        listener
      );
    };
  },
  createNewPrivateConversation: (data: CreatePrivateConversationRequest) => {
    ipcRenderer.invoke(IpcMainTrigger.NEW_PRIVATE_CONVERSATION, data);
  },
  onCreateNewPrivateConversation: (
    callback: (data: CreatePrivateConversationResponse) => void
  ) => {
    const listener = (
      _: IpcRendererEvent,
      data: CreatePrivateConversationResponse
    ) => {
      callback(data);
    };

    ipcRenderer.on(
      ResponseEvents[ResponseType.NEW_PRIVATE_CONVERSATION],
      listener
    );

    return () => {
      ipcRenderer.removeListener(
        ResponseEvents[ResponseType.NEW_PRIVATE_CONVERSATION],
        listener
      );
    };
  },
  createGroupConversation: (data: CreateGroupConversationRequest) => {
    ipcRenderer.invoke(IpcMainTrigger.NEW_GROUP_CONVERSATION, data);
  },
  onCreateGroupConversation: (
    callback: (data: CreateGroupConversationResponse) => void
  ) => {
    const listener = (
      _: IpcRendererEvent,
      data: CreateGroupConversationResponse
    ) => {
      callback(data);
    };

    ipcRenderer.on(
      ResponseEvents[ResponseType.NEW_GROUP_CONVERSATION],
      listener
    );

    return () => {
      ipcRenderer.removeListener(
        ResponseEvents[ResponseType.NEW_GROUP_CONVERSATION],
        listener
      );
    };
  },
};

contextBridge.exposeInMainWorld('auth', authHanlder);
contextBridge.exposeInMainWorld('server', serverHandler);
contextBridge.exposeInMainWorld('conversation', conversationHanlder);

export type AuthHandler = typeof authHanlder;
export type ServerHanlder = typeof serverHandler;
export type ConversationHanlder = typeof conversationHanlder;
