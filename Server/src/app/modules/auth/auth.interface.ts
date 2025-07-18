
export type role = "admin" | "user";
export type  IJwtPayload={
    userId?: string 
    email: string;
    name:string
    password?: string;
    role: role;
    iat?: number;
    exp?: number;
}