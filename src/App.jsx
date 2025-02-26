import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ChatRoom from "./pages/ChatRoom";

function App() {
  return (
    <AuthProvider>
      <div className="h-screen w-screen overflow-hidden">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat/:receiverId" element={<ChatRoom />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
