import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Messaging() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversation_id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API}/messages/conversations`, {
        withCredentials: true,
      });
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`${API}/messages/${conversationId}`, {
        withCredentials: true,
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const otherParticipant = selectedConversation.participants.find(
      (p) => p !== user.user_id
    );

    setSending(true);
    try {
      await axios.post(
        `${API}/messages`,
        {
          receiver_id: otherParticipant,
          content: newMessage.trim(),
        },
        { withCredentials: true }
      );
      setNewMessage("");
      fetchMessages(selectedConversation.conversation_id);
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getOtherParticipant = (conv) => {
    const otherId = conv.participants.find((p) => p !== user.user_id);
    return {
      id: otherId,
      name: conv.participant_names?.[otherId] || "Unknown",
      picture: conv.participant_pictures?.[otherId] || "",
    };
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    if (diff < 86400000) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-[calc(100vh-8rem)]" data-testid="messaging">
        <div className="glass rounded-2xl h-full overflow-hidden flex">
          {/* Conversations List */}
          <div
            className={`w-full md:w-80 border-r border-white/10 flex flex-col ${
              selectedConversation ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageSquare size={20} className="text-[hsl(250_100%_70%)]" />
                Messages
              </h2>
            </div>

            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-12 h-12 rounded-full bg-white/10" />
                      <div className="flex-1">
                        <div className="h-4 bg-white/10 rounded w-24 mb-2" />
                        <div className="h-3 bg-white/5 rounded w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare size={48} className="mx-auto text-slate-600 mb-4" />
                  <p className="text-slate-500">No conversations yet</p>
                  <p className="text-xs text-slate-600 mt-2">
                    Start by messaging someone from their profile
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {conversations.map((conv) => {
                    const other = getOtherParticipant(conv);
                    const unread = conv.unread_count?.[user.user_id] || 0;

                    return (
                      <button
                        key={conv.conversation_id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          selectedConversation?.conversation_id === conv.conversation_id
                            ? "bg-white/10"
                            : "hover:bg-white/5"
                        }`}
                        data-testid={`conversation-${conv.conversation_id}`}
                      >
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={other.picture} />
                            <AvatarFallback className="bg-white/10">
                              {other.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {unread > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[hsl(250_100%_70%)] flex items-center justify-center text-xs font-bold text-white">
                              {unread}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-white truncate">{other.name}</p>
                            {conv.last_message_at && (
                              <span className="text-xs text-slate-500">
                                {formatTime(conv.last_message_at)}
                              </span>
                            )}
                          </div>
                          {conv.last_message && (
                            <p className="text-sm text-slate-400 truncate">
                              {conv.last_message}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div
            className={`flex-1 flex flex-col ${
              selectedConversation ? "flex" : "hidden md:flex"
            }`}
          >
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden text-slate-400"
                  >
                    <ArrowLeft size={20} />
                  </Button>
                  <Avatar
                    className="w-10 h-10 cursor-pointer"
                    onClick={() =>
                      navigate(`/profile/${getOtherParticipant(selectedConversation).id}`)
                    }
                  >
                    <AvatarImage src={getOtherParticipant(selectedConversation).picture} />
                    <AvatarFallback className="bg-white/10">
                      {getOtherParticipant(selectedConversation).name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">
                      {getOtherParticipant(selectedConversation).name}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isOwn = msg.sender_id === user.user_id;
                      return (
                        <div
                          key={msg.message_id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] ${
                              isOwn
                                ? "bg-[hsl(250_100%_70%)] text-white"
                                : "bg-white/10 text-white"
                            } px-4 py-2 rounded-2xl ${
                              isOwn ? "rounded-br-sm" : "rounded-bl-sm"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 ${
                                isOwn ? "text-white/70" : "text-slate-500"
                              }`}
                            >
                              <span className="text-xs">{formatTime(msg.created_at)}</span>
                              {isOwn && (
                                msg.read ? (
                                  <CheckCheck size={14} />
                                ) : (
                                  <Check size={14} />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-3">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="bg-black/30 border-white/10 text-white placeholder:text-slate-500"
                      data-testid="message-input"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-[hsl(250_100%_70%)] hover:bg-[hsl(250_100%_60%)] text-white rounded-xl px-4"
                      data-testid="send-message-btn"
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare size={64} className="mx-auto text-slate-700 mb-4" />
                  <p className="text-slate-400">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
