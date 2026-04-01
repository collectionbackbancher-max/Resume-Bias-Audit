export interface IChatStorage {
  getConversation(id: number | string): Promise<any | undefined>;
  getAllConversations(): Promise<any[]>;
  createConversation(title: string): Promise<any>;
  deleteConversation(id: number | string): Promise<void>;
  getMessagesByConversation(conversationId: number | string): Promise<any[]>;
  createMessage(conversationId: number | string, role: string, content: string): Promise<any>;
}

export const chatStorage: IChatStorage = {
  async getConversation(_id) { return undefined; },
  async getAllConversations() { return []; },
  async createConversation(title) { return { id: "stub", title, createdAt: new Date().toISOString() }; },
  async deleteConversation(_id) {},
  async getMessagesByConversation(_conversationId) { return []; },
  async createMessage(_conversationId, role, content) {
    return { id: "stub", role, content, createdAt: new Date().toISOString() };
  },
};
