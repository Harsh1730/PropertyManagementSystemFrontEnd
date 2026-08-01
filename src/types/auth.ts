import { Role } from "./Role.ts";

export interface RegisterRequest {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    role: Role|null;
}