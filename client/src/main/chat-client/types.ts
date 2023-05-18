export enum RequestType {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  CHECK_AUTH = 'CHECK_AUTH',
  FIND_USER = 'FIND_USER',
  GET_CONVERSATIONS = 'GET_CONVERSATIONS',
  GET_CONVERSATION_BY_ID = 'GET_CONVERSATION_BY_ID',
  SEND_TEXT_MESSAGE = 'SEND_TEXT_MESSAGE',
  SEND_FILE_MESSAGE = 'SEND_FILE_MESSAGE',
  NEW_PRIVATE_CONVERSATION = 'NEW_PRIVATE_CONVERSATION',
  NEW_GROUP_CONVERSATION = 'NEW_GROUP_CONVERSATION',
}

export enum ResponseType {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  CHECK_AUTH = 'CHECK_AUTH',
  FIND_USER = 'FIND_USER',
  GET_CONVERSATIONS = 'GET_CONVERSATIONS',
  GET_CONVERSATION_BY_ID = 'GET_CONVERSATION_BY_ID',
  READED_MESSAGE = 'READED_MESSAGE',
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_PRIVATE_CONVERSATION = 'NEW_PRIVATE_CONVERSATION',
  NEW_GROUP_CONVERSATION = 'NEW_GROUP_CONVERSATION',
}

export enum IpcMainTrigger {
  LOGIN = 'AUTH:LOGIN',
  REGISTER = 'AUTH:REGISTER',
  CHECK_AUTH = 'AUTH:CHECK_AUTH',
  RECONNECT = 'SERVER:RECONNECT',
  GET_CONNECT_STATE = 'SERVER:GET_CONNECT_STATE',
  GET_CONVERSATIONS = 'SERVER:GET_CONVERSATIONS',
  GET_CONVERSATION_BY_ID = 'SERVER:GET_CONVERSATION_BY_ID',
  SEND_TEXT_MESSAGE = 'SERVER:SEND_TEXT_MESSAGE',
  FIND_USERS = 'SERVER:FIND_USERS',
  NEW_PRIVATE_CONVERSATION = 'SERVER:NEW_PRIVATE_CONVERSATION',
  NEW_GROUP_CONVERSATION = 'SERVER:NEW_GROUP_CONVERSATION',
  SEND_FILE_MESSAGE = 'SERVER:SEND_FILE_MESSAGE',
}

export enum IpcMainEvent {
  CONNECT_CHANGE = 'SERVER:ON-CONNECT-STATE-CHANGE',
}

export type TcpData<T = any> = {
  success: boolean;
  status: number;
  type: ResponseType;
  message: string;
  data?: T;
};

export type User = {
  _id: string;
  username: string;
  thumbnail?: string;
  isOnline?: string;
};

export type Conversation = {
  _id: string;
  members: User[];
  name?: string;
  type: ConversationType;
  message: Message;
  unreadMessages: number;
};

export type ConversationDetail = {
  _id: string;
  members: User[];
  name?: string;
  type: ConversationType;
  messages: Message[];
};

export type Message = {
  _id: string;
  content: string;
  conversationId: string;
  type?: MessageType;
  sender: User;
  readed: User[];
  createdAt: string;
};

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export enum ConversationType {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP',
}

export type AuthResponse = TcpData<{ accessToken: string; user?: User }>;

export type GetConversationResponse = TcpData<{
  conversations: Conversation[];
}>;

export type GetConversationByIdResponse = TcpData<{
  conversation: ConversationDetail;
}>;

export type ReadedMessageResponse = TcpData<{
  conversationId: string;
  messages: Message[];
}>;

export type NewMessageResponse = TcpData<{
  message: Message;
}>;

export type FindUsersReponse = TcpData<{
  users: User[];
}>;

export type CreatePrivateConversationResponse = TcpData<{
  conversationId?: string;
  conversation?: Conversation;
  receiverId: string;
}>;

export type CreateGroupConversationResponse = TcpData<{
  conversation: Conversation;
  requestId: string;
}>;

export enum ConnectState {
  IDLE = 'IDLE',
  CONNECTED = 'CONNECTED',
  CLOSE = 'CLOSE',
  ERROR = 'ERROR',
}

export type SendTextMessageRequest = {
  conversationId: string;
  content: string;
};

export type CreatePrivateConversationRequest = {
  receiverId: string;
  content: string;
};

export type CreateGroupConversationRequest = {
  receiverIds: string[];
  content: string;
  requestId: string;
  name: string;
};
