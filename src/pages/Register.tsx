import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("TENANT");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            await api.post("/auth/register", {
                name,
                email,
                password,
                role,
            });

            navigate("/login");
        } catch (error: any) {
            setError(
                error.response?.data?.message || "Registration failed"
            );
        }
    };

    return (
        <div>
            <h1>Register</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="TENANT">Tenant</option>
                    <option value="OWNER">Owner</option>
                </select>

                <button type="submit">
                    Register
                </button>
            </form>

            <button onClick={() => navigate("/login")}>
                Already have an account? Login
            </button>
        </div>
    );
}

export default Register;