export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: string;
}

export type InsertConversation = Omit<Conversation, "id" | "createdAt">;
export type InsertMessage = Omit<Message, "id" | "createdAt">;
