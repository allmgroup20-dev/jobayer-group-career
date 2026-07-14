export interface WhatsAppAccount {
  accountId: string;
  phone?: string;
  provider: "meta" | "bridge" | "log";
  status: string;
  dailyLimit: number;
  dailySent: number;
  totalSent: number;
  config?: Record<string, string>;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export type MessagePriority = 0 | 1 | 2;

export interface MessageQueueItem {
  id?: number;
  to: string;
  text: string;
  priority: MessagePriority;
  status: "queued" | "sending" | "sent" | "failed";
  accountId?: string;
  campaignId?: string;
  messageType: string;
  attempts: number;
  error?: string;
}

export interface BA_PhoneNumber {
  prefix: string;
  operator: string;
}
