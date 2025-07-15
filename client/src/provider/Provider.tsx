"use client"


import { UserProvider } from "@/context/userContext"
import { ReactNode } from "react"




const Provider = ({ children }: { children: ReactNode }) => {
  return (
  <UserProvider>{children}</UserProvider>)
}

export default Provider