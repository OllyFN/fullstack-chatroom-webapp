import { Socket } from "socket.io-client";

export type messageType = {name:string, message:string}

export interface chatProps {
  socket: Socket,
  sendMessage: (userID: number, message:string) => void;
  newUser: (name:string, password:string) => Promise<number>;
  authenticateUser: (username:string, password:string) => Promise<number>;
}

export interface messageProps {
  messageData: messageType
}

export interface inputProps {
  userInput: string;
  setUserInput: (userInput:string) => void;
  sendMessage: (message:string) => void;
}

export interface loginProps {
  handleUserLogin: (username:string, password:string, isRegistering?:boolean) => void;
  waitState: boolean;
  err: string;
}