"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import { logout } from "@/service/AuthService";
import { protectedRoutes } from "@/constant";



export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, setIsLoading } = useUser();

  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    setIsLoading(true);

    if (protectedRoutes.some((route) => pathname.match(route))) {
      router.push("/");
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="sm"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-1"
            >
              <Avatar className="h-6 w-6 rounded-sm">
                <AvatarImage alt={user?.name} />
                <AvatarFallback className="rounded-sm text-xs">
                  {user?.role?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-xs leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="truncate text-[10px] text-muted-foreground">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-3" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-48 rounded-sm"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1 text-left text-xs">
                <Avatar className="h-6 w-6 rounded-sm">
                  <AvatarImage alt={user?.name} />
                  <AvatarFallback className="rounded-sm text-xs">
                    {user?.role?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="truncate text-[10px] text-muted-foreground">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuItem onClick={() => handleLogout()} className="text-xs">
              <LogOut className="mr-1 h-3 w-3" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}