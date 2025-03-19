import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Cookies from "js-cookie"; 

export const AuthContext = createContext();
const socket = io("https://messaging-app-backend-phi.vercel.app");

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = Cookies.get("user"); 
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            socket.emit("setOnline", user?.userId);
        }

        axios.get("https://messaging-app-backend-phi.vercel.app/api/users")
            .then((res) => {
                setUsers(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching users:", err);
                setLoading(false);
            });

        socket.on("userOnline", (data) => {
            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u._id === data?.userId ? { ...u, online: true } : u
                )
            );
        });

        socket.on("userOffline", (data) => {
            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u._id === data?.userId ? { ...u, online: false } : u
                )
            );
        });

        return () => {
            if (user) socket.emit("setOffline", user?.userId);
            socket.off("userOnline");
            socket.off("userOffline");
        };
    }, [user]);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post("https://messaging-app-backend-phi.vercel.app/api/users/login", { email, password });
            setUser(data);
            Cookies.set("user", JSON.stringify(data), { expires: 7 });  // Store user data in cookie
            socket.emit("setOnline", data?.userId);
        } catch (error) {
            console.error(error.response?.data?.error);
        }
    };

    const logout = () => {
        if (user) socket.emit("setOffline", user?.userId);
        setUser(null);
        Cookies.remove("user");  // Remove user cookie on logout
    };

    return (
        <AuthContext.Provider value={{ user, users, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
