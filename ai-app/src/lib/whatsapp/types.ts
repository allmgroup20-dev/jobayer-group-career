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
  status: "queued" | "sending" | "sent" | "failed" | "pending_web";
  accountId?: string;
  campaignId?: string;
  messageType: string;
  attempts: number;
  error?: string;
}
