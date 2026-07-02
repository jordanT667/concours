// src/app/models/auth.model.ts

export interface LoginRequest {
    username: string;
    password: string;
}

export interface JwtResponse {
    accessToken: string;
    refreshToken: string;
    type: string;
    id: string;
    username: string;
    roles: string[];
}
