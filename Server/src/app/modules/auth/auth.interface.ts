

export type  IJwtPayload={
    userId?: string 
    email: string;
    name:string
    password?: string;
    role: string;
    iat?: number;
    exp?: number;
}