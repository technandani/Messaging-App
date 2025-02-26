import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { login, user, loading } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
            if ( user) {
                navigate("/dashboard");
            }
        }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
        navigate("/dashboard");
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className=" p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded-md" required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded-md" required />
                    <button type="submit" className="w-full bg-[#0C1821]  p-2 rounded-md hover:bg-[#1f272e]">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;