import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import io from "socket.io-client";
import axios from "axios";

const socket = io("https://messaging-app-backend-phi.vercel.app", { autoConnect: false });

const Dashboard = () => {
  const { user, users } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // ✅ Connect socket once when component mounts
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      socket.emit("setOnline", user?.userId);
    }
  }, []);

  // ✅ Fetch chat when a user is selected
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    axios
      .get(
        `https://messaging-app-backend-phi.vercel.app/api/messages/${user.userId}/${selectedUser._id}`
      )
      .then((res) => {
        setMessages(res.data);
      });

    socket.on("receiveMessage", (message) => {
      if (
        message.sender === selectedUser._id ||
        message.receiver === selectedUser._id
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedUser]);

  // ✅ Send message function
  const sendMessage = () => {
    if (newMessage.trim() === "" || !selectedUser) return;

    const message = {
      sender: user.userId,
      receiver: selectedUser._id,
      content: newMessage,
    };

    setMessages((prev) => [...prev, message]);

    axios
      .post("https://messaging-app-backend-phi.vercel.app/api/messages", message)
      .then(() => {
        socket.emit("sendMessage", message);
        setNewMessage("");
      })
      .catch((err) => console.error("Message send failed:", err));
  };

  return (
    <div className="px-6 py-2 h-full w-full grid grid-cols-6">
      <div className="border-r p-4 col-span-2">
        <h2 className="text-xl font-bold">Users</h2>
        <ul>
          {users.map((u) => (
            <li key={u._id} className="p-2 flex justify-between border-b">
              <div>
                <div className="flex gap-2 items-center justify-center">
                  <div>
                    <img src="/images/user.png" alt="" className="h-10 w-10" />
                  </div>
                  <div>
                    <div className="text-lg">{u.name}</div>
                    <div className="text-sm">{u.role}</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(u)}
                className="bg-[#0C1821] text-white w-32 h-10 rounded-md cursor-pointer"
              >
                Chat
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 col-span-4 h-full">
        {!selectedUser ? (
          <div className="text-gray-500 text-center h-full"></div>
        ) : (
          <>
            <div className="p-4">
              {selectedUser && (
                <div className="flex gap-2">
                  <span className="font-bold text-xl">{selectedUser.name}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      selectedUser.online
                        ? "text-green-500 content-(--my-content) bg-green-500"
                        : "text-gray-400 bg-neutral-600 content-[offline]"
                    }`}
                  ></span>
                </div>
              )}
            </div>

            <hr />
            <div className="h-[70%] max-h-[70%] overflow-y-scroll  p-2 mb-4 flex flex-col">
              {messages.map((msg, index) => (
                <p
                  key={index}
                  className={`p-2 w-fit rounded-lg my-1 ${
                    msg.sender === user.userId
                      ? "bg-green-800 self-end text-right"
                      : "bg-neutral-700 self-start text-left float-left"
                  }`}
                >
                  {msg.sender === user.userId ? "Me" : selectedUser.name}:{" "}
                  {msg.content}
                </p>
              ))}
            </div>
            <div
              className="w-full px-4"
            >
              <div className="relative">
                <input
                  type="text"
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full p-3 rounded-full border border-gray-300 focus:outline-none focus:ring focus:ring-blue-800"
                />
                <button
                  onClick={sendMessage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 text-[#0C1821] rounded-full transition bg-white"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
