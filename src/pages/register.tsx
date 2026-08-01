import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import type { SyntheticEvent } from "react";
import type { RegisterRequest } from "../types/auth";
import type { Role } from "../types/Role";
import type { registerDTO as RegisterDTO } from "../types/registerDTO";
export default function Register() {

    const [form, setForm] = useState<RegisterRequest>({

        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: null,
    });


    const [roles, setRoles] = useState<Role[]>([]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        if (name === "phone" && !/^\d*$/.test(value)) {
            return;
        }
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    useEffect(() => {
        async function loadRoles() {
            await fetch("http://localhost:8080/roles", {
                headers: {
                    Authorization: "Basic " + btoa("harsh:12345")
                }
            })
                .then((response) => response.json())
                .then((data) => setRoles(data));
        }

        loadRoles();
    }, []);



    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        if (form.password !== form.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        e.preventDefault();
        const csrf = await fetch("http://localhost:8080/token", {
            credentials: "include",
            headers: {
                Authorization: "Basic " + btoa("harsh:12345")
            }
        });

        if (!csrf.ok) {
            throw new Error("Couldn't fetch CSRF token");
        }

        const csrfData = await csrf.json();
        console.log("CSRF Data:", csrfData);


        const RegisterDTO: RegisterDTO = {
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
            role: form.role,
        };
        const response = await fetch("http://localhost:8080/register", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                [csrfData.headerName]: csrfData.token,
                Authorization: "Basic " + btoa("harsh:12345")
            },
            body: JSON.stringify(RegisterDTO),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            alert(errorMessage);
            return;
        }
        const user = await response.json();
        alert(`${user.name} registered successfully!`);
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
            />

            <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
            />

            <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
            />

            <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
            />

            <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
            />
            <select
                name="role"
                value={form.role ?? ""}
                onChange={handleChange}
            >
                <option value="">Select Role</option>

                {roles.map(role => (
                    <option key={role} value={role}>
                        {role}
                    </option>
                ))}
            </select>
            <button type="submit">Register</button>
        </form>
    );
}