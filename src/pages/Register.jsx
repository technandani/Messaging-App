import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", role: "Student" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("https://messaging-app-backend-phi.vercel.app/api/users/register", formData);
            navigate("/login");
        } catch (error) {
            console.error(error.response?.data?.error);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <div className=" p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" placeholder="Name" value={formData.name} onChange={handleChange}
                        className="w-full p-2 border rounded-md" required />
                    <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange}
                        className="w-full p-2 border rounded-md" required />
                    <input name="phone" type="text" placeholder="Phone" value={formData.phone} onChange={handleChange}
                        className="w-full p-2 border rounded-md" required />
                    <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange}
                        className="w-full p-2 border rounded-md" required />
                    <select name="role" value={formData.role} onChange={handleChange}
                        className="w-full p-2 border rounded-md">
                        <option>Student</option>
                        <option>Teacher</option>
                        <option>Institute</option>
                    </select>
                    <button type="submit" className="w-full bg-[#0C1821] p-2 rounded-md hover:bg-[#1b232a]">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
