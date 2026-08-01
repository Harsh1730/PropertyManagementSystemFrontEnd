import { Role } from "./Role.ts" ;
export interface registerDTO {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: Role|null;
}