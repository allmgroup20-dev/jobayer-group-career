"use client";
interface Props {
  message: { id: number; role: string; content: string; created_at: string };
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-[#DCF8C6] text-gray-800 rounded-br-sm"
            : "bg-white text-gray-800 rounded-bl-sm"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div className={`text-[10px] mt-1 ${isUser ? "text-right text-gray-500" : "text-left text-gray-400"}`}>
          {time}
          {isUser && (
            <svg className="inline w-3.5 h-3.5 ml-1 -mt-0.5 text-[#4FC3F7]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
