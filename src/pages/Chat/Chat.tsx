import React, { useEffect, useState } from "react";
import Sidebar from "../../shared/ui/Sidebar/Sidebar";
import useUserStore from "../../entity/user/user.store";
import useMessageStore from "../../entity/message/message.store";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const Chat = () => {
  const { user } = useUserStore();
  const { messages, addMessage, setMessages } = useMessageStore();
  const [message, setMessage] = useState<string>("");
  const [recipientId, setRecipientId] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      socket.emit("register", user.id);
      fetchMessageHistory(user.id);
    }

    socket.on("private_message", (data) => {
      addMessage(data);
    });

    return () => {
      socket.off("private_message");
    };
  }, [user]);

  const fetchMessageHistory = async (id: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/messages/${id}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching message history:", error);
    }
  };

  const handleSendMessage = () => {
    if (recipientId && message) {
      const timestamp = new Date().toISOString();
      socket.emit("private_message", { to: recipientId, message, timestamp });
      addMessage({ from: user?.id || "me", to: recipientId, message, timestamp });
      setMessage("");
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUser(id);
    setRecipientId(id);
    fetchMessageHistory(user?.id || "");
  };

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.from === user?.id && msg.to === selectedUser) ||
      (msg.from === selectedUser && msg.to === user?.id)
  );

  return (
    <div className="chat">
      <Sidebar onSelectUser={handleSelectUser} />
      <div className="chat-content">
        {selectedUser && (
          <div>
            <h2>Chat with {selectedUser}</h2>
            <div>
              <input
                type="text"
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
            <div>
              <h2>Messages</h2>
              <ul>
                {filteredMessages.map((msg, index) => (
                  <li key={index}>
                    {msg.from} ({new Date(msg.timestamp).toLocaleTimeString()}): {msg.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
