import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MessageCircle, Send, X, User, Bot } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface SimpleChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleChatWindow({ isOpen, onClose }: SimpleChatWindowProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm here to help you with your VA claims. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        isUser: true,
        timestamp: new Date(),
      };
      
      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thank you for your message. A VA support agent will respond shortly. For immediate assistance, please call 1-800-827-1000.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, userMessage, botMessage]);
      setMessage("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px]">
      <Card className="h-full flex flex-col shadow-2xl border-2 border-navy-700">
        <CardHeader className="bg-gradient-to-r from-navy-700 to-navy-800 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <CardTitle className="text-lg font-semibold">VA Support Chat</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-navy-600 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${msg.isUser ? "flex-row-reverse" : ""}`}>
                    <div
                      className={`p-2 rounded-full ${
                        msg.isUser ? "bg-navy-700" : "bg-gold-500"
                      }`}
                    >
                      {msg.isUser ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        msg.isUser
                          ? "bg-navy-700 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        
        <CardFooter className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
            <Input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!message.trim()}
              className="bg-navy-700 hover:bg-navy-800 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}