import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../../lib/utils';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MessageContext } from '../context/MessageContext.jsx';
import { UserContext } from '../context/UserContext.jsx';
import { socket } from '../socket';

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const scrollEnd = useRef();
  const typingTimeout = useRef(null);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const { messages, setMessages } = useContext(MessageContext);
  const { user, isLoggedIn } = useContext(UserContext);
  const URI = import.meta.env.VITE_BACKEND_URI;

  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user._id);
    }
  }, [user]);

  const fetchMessageData = async () => {
    try {
      const { data } = await axios.get(`${URI}/api/v1/message/${selectedUser._id}`, {
        withCredentials: true,
      });
      setMessages(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error fetching messages');
    }
  };

  useEffect(() => {
    if (selectedUser) fetchMessageData();
  }, [selectedUser, isLoggedIn]);

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleReceive = (msg) => {
      if (
        msg.sender._id === selectedUser._id ||
        msg.receiver._id === selectedUser._id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive-message", handleReceive);
    socket.on("message-sent", handleReceive);

    return () => {
      socket.off("receive-message", handleReceive);
      socket.off("message-sent", handleReceive);
    };
  }, [selectedUser]);

  // Typing and online user events
  useEffect(() => {
    socket.on("typing", ({ from }) => {
      if (from === selectedUser._id) {
        setIsTyping(true);
      }
    });

    socket.on("stop-typing", ({ from }) => {
      if (from === selectedUser._id) {
        setIsTyping(false);
      }
    });

    socket.on("user-online", (userId) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    socket.on("user-offline", (userId) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    return () => {
      socket.off("typing");
      socket.off("stop-typing");
      socket.off("user-online");
      socket.off("user-offline");
    };
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!message.trim() && !imageFile) return;
    setIsSending(true);

    try {
      const formData = new FormData();
      if (message) formData.append("message", message);
      if (imageFile) formData.append("image", imageFile);

      const { data } = await axios.post(
        `${URI}/api/v1/message/${selectedUser._id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );

      if (data.success) {
        const latest = data.data;
        socket.emit("send-message", {
          senderId: user._id,
          receiverId: selectedUser._id,
          message: latest.message,
          image: latest.image,
          createdAt: latest.createdAt,
        });

        await fetchMessageData();
        setMessage('');
        setImageFile(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending message');
    } finally {
      setIsSending(false);
    }
  };

  const deleteMessage = async (id) => {
    try {

      const { data } = await axios.delete(`${URI}/api/v1/message/${id}`, { withCredentials: true });

      if (data.success) {

        setMessages((prevMessage) => prevMessage.filter((msg, index) => msg._id !== id));
        toast.success(data.message);
      }

    } catch (err) {
      toast.error(err.response.data.message)
    }
  }

  const renderAvatar = (msgUser) => {
    const name = msgUser?.name || "U";
    const profileImage = msgUser?.additionalDetails?.profileImage;

    return profileImage ? (
      <img src={profileImage} alt={name} className="w-7 h-7 rounded-full object-cover" />
    ) : (
      <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center font-semibold text-sm uppercase">
        {name.charAt(0)}
      </div>
    );
  };

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mx-4 py-3 border-b border-stone-500">
        {renderAvatar(selectedUser)}
        <div className="flex-1 text-lg text-white">
          <div className="flex items-center gap-2">
            {selectedUser.name}
            <span
              className={`w-2 h-2 rounded-full ${onlineUsers.has(selectedUser._id)
                ? 'bg-green-500' : 'bg-gray-400'}`}
            ></span>
          </div>
          {isTyping && (
            <p className="text-sm text-violet-300 animate-pulse">Typing...</p>
          )}
        </div>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className="md:hidden w-6 cursor-pointer"
        />
        <img src={assets.help_icon} className="max-md:hidden w-5" alt="Help" />
      </div>

      {/* Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll px-4 py-3 space-y-4">
        {messages.map((msg, index) => {
          const isSender = msg.sender._id === user._id;

          return (
            <div key={index} className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
                {!isSender && renderAvatar(msg.sender)}

                <div className="relative group">

                  {msg.image ? (
                    <img
                      src={msg.image}
                      className="max-w-[230px] border border-gray-700 rounded-lg"
                      alt="sent"
                    />
                  ) : (
                    <p
                      className={`p-2 max-w-[220px] md:text-sm font-light rounded-lg break-words text-white ${isSender ? 'bg-violet-600 rounded-br-none' : 'bg-pink-600 rounded-bl-none'}`}
                    >
                      {msg.message}
                    </p>
                  )}

                  {isSender && (
                    <button
                      onClick={() => deleteMessage(msg._id)}
                      className="absolute top-0 right-0 text-xs text-red-400 bg-black/70 px-1 py-0.5 rounded hidden group-hover:block"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {isSender && renderAvatar(msg.sender)}
              </div>

              <span className="text-[10px] text-gray-400 mt-1 px-2">
                {formatMessageTime(msg.createdAt)}
              </span>
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Image Preview with Loader */}
      {imageFile && (
        <div className="absolute bottom-20 left-4 bg-black/60 p-2 rounded-lg z-10">
          <div className="relative">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="preview"
              className={`w-32 rounded-md ${isSending ? 'opacity-50' : ''}`}
            />
            {isSending && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-[#2f20654a] px-3 rounded-full">
          <input
            disabled={isSending}
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none bg-transparent text-white placeholder-gray-400"
            type="text"
            value={message}
            onChange={(ev) => {
              setMessage(ev.target.value);
              socket.emit("typing", { receiverId: selectedUser._id });
              if (typingTimeout.current) clearTimeout(typingTimeout.current);
              typingTimeout.current = setTimeout(() => {
                socket.emit("stop-typing", { receiverId: selectedUser._id });
              }, 1000);
            }}
            placeholder="Send a message"
          />
          <input
            type="file"
            id="image"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImageFile(file);
                setMessage('');
              }
            }}
          />
          <label htmlFor="image">
            <img src={assets.gallery_icon} className="w-5 mr-2 cursor-pointer" alt="Attach" />
          </label>
        </div>
        <img
          onClick={isSending ? null : sendMessage}
          src={assets.send_button}
          className={`w-7 cursor-pointer ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
          alt="Send"
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="max-w-16" alt="Logo" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
