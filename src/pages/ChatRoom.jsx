import { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000", { autoConnect: false });

const ChatRoom = () => {
  const { user, users } = useContext(AuthContext);
  const { receiverId } = useParams();
  console.log("user: ", user);

  const [messages, setMessages] = useState([]);
  const messagesRef = useRef([]);
  const [newMessage, setNewMessage] = useState("");

  // ✅ Connect socket once when component mounts
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      socket.emit("setOnline", user.userId);
    }
  }, []); // ✅ Runs only once on mount

  // ✅ Fetch previous messages and listen for new ones
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/messages/${user.userId}/${receiverId}`)
      .then((res) => {
        setMessages(res.data);
        messagesRef.current = res.data;
      });

    // ✅ Listen for real-time messages
    socket.on("receiveMessage", (message) => {
      console.log("New message received:", message);

      // ✅ Avoid duplicate messages
      messagesRef.current = [...messagesRef.current, message];
      setMessages([...messagesRef.current]);
    });

    return () => {
      socket.off("receiveMessage"); // ✅ Cleanup listener
    };
  }, [receiverId]);

  // ✅ Send message function
  const sendMessage = () => {
    if (newMessage.trim() === "") return; // ✅ Prevent empty messages

    const message = {
      sender: user.userId,
      receiver: receiverId,
      content: newMessage,
    };

    // ✅ Update UI instantly before API call
    messagesRef.current = [...messagesRef.current, message];
    setMessages([...messagesRef.current]);

    axios
      .post("http://localhost:5000/api/messages", message)
      .then((res) => {
        socket.emit("sendMessage", res.data.newMessage); // ✅ Emit message to backend
        setNewMessage(""); // ✅ Clear input field
      })
      .catch((err) => console.error("Message send failed:", err));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Chat Room</h2>
      <p className="text-xl font-bold">{user.name}</p>

      {/* ✅ Fixed Online/Offline Status UI */}
      <div className=" p-4">
        {users.map((u, index) => ( // ✅ Corrected parameter order & added return
          <span
            key={index}
            className={`text-sm ${
              u.online ? "text-green-500" : "text-gray-400"
            } p-2 inline-block h-4 w-4 rounded-full bg-green`}
          >
            {u.online ? "." : "."}
          </span>
        ))}
      </div>

      {/* ✅ Chat Messages */}
      <div className="h-[400px] overflow-y-auto border p-2 mb-4">
        {messages.map((msg, index) => (
          <p
            key={index}
            className={`p-2 border rounded-lg my-1 ${
              msg.sender === user.userId ? "bg-blue-300" : "bg-gray-300"
            }`}
          >
            {msg.sender === user.userId ? "Me" : "Other"}: {msg.content}
          </p>
        ))}
      </div>

      {/* ✅ Message Input Box */}
      <div className="flex gap-2 h-10 items-center justify-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full h-full border rounded-md px-2"
        />
        <button
          onClick={sendMessage}
          className="w-56 h-full bg-blue-900 text-white rounded-md hover:bg-blue-800 mt-2"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;