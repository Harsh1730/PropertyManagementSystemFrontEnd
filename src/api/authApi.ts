import axios from "axios";
import type { RegisterRequest } from "../types/auth";

export function register(user: RegisterRequest) {

    return axios.post(

        "http://localhost:8080/register",

        user,

        {
            withCredentials: true
        }

    );

}