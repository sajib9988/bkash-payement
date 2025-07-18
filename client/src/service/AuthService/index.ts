"use server";

import { IUser } from "@/type/type";
import { FieldValues } from "react-hook-form";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";


export const registerUser = async (userData: FieldValues) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const result = await res.json();
  
      
  
      return result;
    } catch (error: any) {
      return Error(error);
    }
  };

  
export const loginUser = async (userData: FieldValues) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const result = await res.json();
   console.log("Login result:", result);
    if (result.success) {
        (await cookies()).set("accessToken", result.data.accessToken);
      }
      if (result.success) {
        (await cookies()).set("refreshToken", result?.data?.refreshToken);
      }
   console.log( "token", result.data.accessToken);
      return result;
     
    } catch (error: any) {
      return Error(error);
    }
  };



  export const getCurrentUser = async (): Promise<IUser | null> => {
    const accessToken = (await cookies()).get("accessToken")?.value;

    if (!accessToken) {
      return null;
    }

    try {
      const decodedData: IUser = jwtDecode(accessToken);
      return decodedData;
    } catch (error) {
      // If the token is invalid or expired, delete it and return null
      (await cookies()).delete("accessToken");
      return null;
    }
  };



  
export const logout = async () => {
  (await cookies()).delete("accessToken");
};