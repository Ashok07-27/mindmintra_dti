import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { MessageCircleMore, Search, Send, ShieldAlert } from "lucide-react";
import api from "./api";
import { useAuth } from "./AuthContext";

function formatMessageTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isSending, setIsSending] = useState(false);
  const selectedUserRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageEndRef = useRef(null);

  const socket = useMemo(() => {
    const token = localStorage.getItem("mindmitra-token");

    if (!token) {
      return null;
    }

    const isLiveServerOrigin =
      window.location.origin === "http://127.0.0.1:5500" ||
      window.location.origin === "http://localhost:5500";

    const socketBaseUrl = import.meta.env.PROD
      ? isLiveServerOrigin
        ? "http://127.0.0.1:5000"
        : window.location.origin
      : import.meta.env.VITE_API_URL?.replace("/api", "") || window.location.origin;

    return io(
      socketBaseUrl,
      {
        auth: { token },
        transports: ["websocket", "polling"],
      }
    );
  }, []);

  useEffect(() => {
    api.get("/posts/matches").then(({ data }) => {
      setMatches(data);
      if (data[0]) setSelectedUser(data[0]);
    });
  }, []);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser, typingUsers]);

  useEffect(() => {
    if (!socket || !user?.id) return undefined;

    socket.on("chat:online-users", (userIds) => {
      setOnlineUsers(userIds.map(String));
    });

    socket.on("chat:message", (message) => {
      const activeUser = selectedUserRef.current;
      const isRelevantConversation =
        activeUser &&
        ((String(message.senderId) === String(activeUser._id) &&
          String(message.receiverId) === String(user.id)) ||
          (String(message.senderId) === String(user.id) &&
            String(message.receiverId) === String(activeUser._id)));

      if (isRelevantConversation) {
        setMessages((currentMessages) => {
          const alreadyExists = currentMessages.some(
            (currentMessage) => currentMessage._id === message._id
          );

          return alreadyExists ? currentMessages : [...currentMessages, message];
        });
      }
    });

    socket.on("chat:typing", ({ userId, isTyping }) => {
      setTypingUsers((currentUsers) => {
        const nextUsers = new Set(currentUsers);

        if (isTyping) {
          nextUsers.add(String(userId));
        } else {
          nextUsers.delete(String(userId));
        }

        return [...nextUsers];
      });
    });

    return () => {
      socket.off("chat:online-users");
      socket.off("chat:message");
      socket.off("chat:typing");
      socket.disconnect();
    };
  }, [socket, user?.id]);

  useEffect(() => {
    if (!selectedUser) return;
    api.get(`/chats/${selectedUser._id}`).then(({ data }) => setMessages(data));
  }, [selectedUser]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!selectedUser || !draft.trim()) return;

    try {
      setIsSending(true);
      await api.post("/chats", {
        receiverId: selectedUser._id,
        message: draft.trim(),
      });
      setDraft("");

      if (socket) {
        socket.emit("chat:typing", {
          receiverId: selectedUser._id,
          isTyping: false,
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleDraftChange = (event) => {
    const nextDraft = event.target.value;
    setDraft(nextDraft);

    if (!selectedUser || !socket) return;

    socket.emit("chat:typing", {
      receiverId: selectedUser._id,
      isTyping: nextDraft.trim().length > 0,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("chat:typing", {
        receiverId: selectedUser._id,
        isTyping: false,
      });
    }, 1200);
  };

  const filteredMatches = matches.filter((peer) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;

    return (
      peer.username.toLowerCase().includes(query) ||
      peer.tags.join(", ").toLowerCase().includes(query)
    );
  });

  const selectedUserIsTyping = selectedUser
    ? typingUsers.includes(String(selectedUser._id))
    : false;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
      <div className="glass-card overflow-hidden p-0">
        <div className="border-b border-sky-100 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-calm to-bloom p-3 text-white">
              <MessageCircleMore size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink">Peer Messages</h1>
              <p className="text-sm text-slate-500">
                Private, supportive conversations with matched students
              </p>
            </div>
          </div>

          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="soft-input pl-11"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search peers or tags"
            />
          </div>
        </div>

        <div className="max-h-[72vh] space-y-2 overflow-y-auto p-3">
          {filteredMatches.map((peer) => (
            <button
              key={peer._id}
              onClick={() => setSelectedUser(peer)}
              className={`w-full rounded-3xl p-4 text-left transition ${
                selectedUser?._id === peer._id
                  ? "bg-gradient-to-r from-sky-100 to-violet-100 shadow"
                  : "bg-slate-50 hover:bg-sky-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-calm to-bloom text-base font-bold text-white">
                  {peer.username.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-semibold text-ink">{peer.username}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        onlineUsers.includes(String(peer._id))
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {onlineUsers.includes(String(peer._id)) ? "Online" : "Offline"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-600">
                    {peer.tags.join(", ")}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Match score: {(peer.similarity * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </button>
          ))}
          {filteredMatches.length === 0 && (
            <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500">
              No peer matches found for that search.
            </div>
          )}
        </div>
      </div>

      <div className="glass-card flex min-h-[72vh] flex-col overflow-hidden p-0">
        {selectedUser ? (
          <>
            <div className="flex items-center justify-between border-b border-sky-100 bg-white/70 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-calm to-bloom font-bold text-white">
                  {selectedUser.username.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-ink">
                    {selectedUser.username}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {selectedUserIsTyping
                      ? "typing..."
                      : onlineUsers.includes(String(selectedUser._id))
                        ? "online now"
                        : "offline"}
                  </p>
                </div>
              </div>

              <div className="hidden rounded-2xl bg-sky-50 px-4 py-3 text-sm text-slate-600 md:block">
                Keep the chat kind, calm, and respectful.
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-sky-50/70 via-white to-violet-50/60 px-4 py-5">
              {messages.map((message) => {
                const isMine = String(message.senderId) === String(user?.id);

                return (
                  <div
                    key={message._id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-[24px] px-4 py-3 text-sm shadow-sm ${
                        isMine
                          ? "rounded-br-md bg-gradient-to-r from-calm to-bloom text-white"
                          : "rounded-bl-md bg-white text-slate-700"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-6">{message.message}</p>
                      <p
                        className={`mt-2 text-[11px] ${
                          isMine ? "text-white/75" : "text-slate-400"
                        }`}
                      >
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {selectedUserIsTyping && (
                <div className="flex justify-start">
                  <div className="rounded-[24px] rounded-bl-md bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    typing...
                  </div>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>

            <div className="border-t border-sky-100 bg-white/80 p-4">
              <form onSubmit={sendMessage} className="flex items-end gap-3">
                <input
                  className="soft-input"
                  value={draft}
                  onChange={handleDraftChange}
                  placeholder="Type a message"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage(event);
                    }
                  }}
                />
                <button
                  disabled={isSending || !draft.trim()}
                  className="primary-btn flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={16} />
                  {isSending ? "Sending" : "Send"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full min-h-[72vh] flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full bg-sky-50 p-5 text-calm">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-ink">Choose a peer to start chatting</h2>
              <p className="mt-2 max-w-md text-slate-500">
                Your conversations stay private inside MindMitra and update live while both students are online.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



