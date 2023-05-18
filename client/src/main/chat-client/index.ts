import { BrowserWindow, dialog, ipcMain } from 'electron';
import ElectronStore from 'electron-store';
import fs from 'fs';
import {
  AuthResponse,
  CreateGroupConversationRequest,
  CreatePrivateConversationRequest,
  SendTextMessageRequest,
} from 'main/chat-client/types';
import net from 'net';
import path from 'path';
import { ResponseEvents } from './models';
import {
  ConnectState,
  IpcMainEvent,
  IpcMainTrigger,
  RequestType,
  TcpData,
} from './types';

export class ChatClient {
  private socket!: net.Socket;
  private store: ElectronStore;
  private win: BrowserWindow;
  private connect: ConnectState;

  constructor(win: BrowserWindow) {
    this.win = win;
    this.connect = ConnectState.IDLE;
    this.store = new ElectronStore();
    this.initSocket();
    this.handleEvents();
  }

  private initSocket() {
    const socket = net.connect({ port: 4000 });

    socket.on('connect', () => {
      this.connect = ConnectState.CONNECTED;

      this.win.webContents.send(
        IpcMainEvent.CONNECT_CHANGE,
        ConnectState.CONNECTED
      );

      this.checkAuth();
    });

    socket.on('data', (data) => {
      this.handleDataReceived(data);
    });

    socket.on('error', () => {
      console.log('connect error');
      this.connect = ConnectState.ERROR;
      this.win.webContents.send(
        IpcMainEvent.CONNECT_CHANGE,
        ConnectState.ERROR
      );
    });

    socket.on('close', () => {
      console.log('close connection');
      this.connect = ConnectState.CLOSE;
      this.win.webContents.send(
        IpcMainEvent.CONNECT_CHANGE,
        ConnectState.CLOSE
      );
    });

    this.socket = socket;
  }

  private reconnect() {
    if (this.socket) {
      this.socket.destroy();
    }
    this.initSocket();
  }

  handleDataReceived(data: Buffer) {
    try {
      const dataObj = JSON.parse(data.toString()) as TcpData;
      const type = dataObj.type;
      console.log('received data');
      console.log(type);
      const eventName = ResponseEvents[type];
      // console.log(util.inspect(dataObj, { depth: null, colors: true }));

      if (eventName) {
        this.win.webContents.send(eventName, dataObj);
      }

      if (
        eventName === ResponseEvents.LOGIN ||
        eventName === ResponseEvents.REGISTER
      ) {
        if (dataObj.success) {
          const res = dataObj as AuthResponse;
          const token = res.data?.accessToken;
          // console.log({ dataObj, token });
          this.store.set('token', token);
        }
      }
    } catch (error) {
      console.log(data.toString());
      console.error(error);
    }
  }

  private handleEvents = () => {
    ipcMain.handle(IpcMainTrigger.LOGIN, (_, loginForm) =>
      this.login(loginForm)
    );

    ipcMain.handle(IpcMainTrigger.REGISTER, (_, registerForm) =>
      this.register(registerForm)
    );

    ipcMain.handle(IpcMainTrigger.CHECK_AUTH, () => this.checkAuth());

    ipcMain.handle(IpcMainTrigger.RECONNECT, () => {
      this.reconnect();
    });

    ipcMain.handle(IpcMainTrigger.GET_CONVERSATIONS, () => {
      this.getConversations();
    });

    ipcMain.handle(IpcMainTrigger.GET_CONVERSATION_BY_ID, (_, id: string) =>
      this.getConversationById(id)
    );

    ipcMain.handle(
      IpcMainTrigger.SEND_TEXT_MESSAGE,
      (_, req: SendTextMessageRequest) => this.sendTextMessage(req)
    );

    ipcMain.handle(IpcMainTrigger.FIND_USERS, (_, name) => this.findUser(name));
    ipcMain.handle(IpcMainTrigger.NEW_PRIVATE_CONVERSATION, (_, data) =>
      this.createPrivateConversation(data)
    );
    ipcMain.handle(IpcMainTrigger.NEW_GROUP_CONVERSATION, (_, data) =>
      this.createGroupConversation(data)
    );

    ipcMain.handle(IpcMainTrigger.SEND_FILE_MESSAGE, (_, conversationId) =>
      this.sendFileMessage(conversationId)
    );

    ipcMain.handle(IpcMainTrigger.GET_CONNECT_STATE, () => this.connect);
  };

  private login(form: any) {
    this.socket?.write(
      JSON.stringify({
        type: RequestType.LOGIN,
        ...form,
      })
    );
  }

  private register(form: any) {
    this.socket.write(
      JSON.stringify({
        type: RequestType.REGISTER,
        ...form,
      })
    );
  }

  private checkAuth() {
    const token = this.store.get('token');
    if (token) {
      this.socket.write(
        JSON.stringify({
          type: RequestType.CHECK_AUTH,
          token,
        })
      );
    }
  }

  private getConversations() {
    this.socket.write(
      JSON.stringify({
        type: RequestType.GET_CONVERSATIONS,
      })
    );
  }

  private getConversationById(id: string) {
    this.socket.write(
      JSON.stringify({
        type: RequestType.GET_CONVERSATION_BY_ID,
        id,
      })
    );
  }

  private sendTextMessage(req: SendTextMessageRequest) {
    this.socket.write(
      JSON.stringify({
        type: RequestType.SEND_TEXT_MESSAGE,
        conversationId: req.conversationId,
        content: req.content,
      })
    );
  }

  private findUser(name: string) {
    this.socket.write(
      JSON.stringify({
        type: RequestType.FIND_USER,
        name,
      })
    );
  }

  private createPrivateConversation(data: CreatePrivateConversationRequest) {
    this.socket.write(
      JSON.stringify({
        type: RequestType.NEW_PRIVATE_CONVERSATION,
        ...data,
      })
    );
  }

  private createGroupConversation(data: CreateGroupConversationRequest) {
    this.socket.write(
      JSON.stringify({
        type: RequestType.NEW_GROUP_CONVERSATION,
        ...data,
      })
    );
  }

  private async sendFileMessage(conversationId: string) {
    return dialog
      .showOpenDialog(this.win, {
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
          { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
        ],
        message: 'Please select a file (size < 10MB)',
      })
      .then((results) => {
        const filePaths = results.filePaths;
        const filePath = filePaths[0];

        if (filePath) {
          const stats = fs.statSync(filePath);
          const fileSize = stats.size;

          if (fileSize > 10 * 1024 * 1024) {
            return {
              err: {
                message: 'Please select a file (size < 10MB)',
              },
            };
          }

          const fileData = fs.readFileSync(filePath);
          const fileExtension = path.extname(filePath);
          console.log({ fileExtension });

          this.socket.write(
            JSON.stringify({
              type: RequestType.SEND_FILE_MESSAGE,
              file: fileData,
              ext: fileExtension,
              conversationId,
            })
          );

          return { success: true };
        }
      });
  }

  public destroy() {
    this.socket.destroy();
  }
}
