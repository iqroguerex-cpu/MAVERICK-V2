export enum Role {
  User = 'user',
  Model = 'model',
}

export interface Message {
  role: Role;
  text: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}
