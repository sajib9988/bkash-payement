"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  SquareTerminal,
  Users,
  Clapperboard,
  Star,
  FileText,
  CreditCard,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/userContext";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { useRouter } from "next/navigation";

const adminData = {
  navMain: [
    { title: "Dashboard", url: "/admin/dashboard", icon: SquareTerminal },
    { title: "User Management", url: "/admin/users", icon: Users },
    { title: "Movies & Series", url: "/admin/media", icon: Clapperboard },
    { title: "Movies-table", url: "/admin/media-table", icon: Clapperboard },
    { title: "Reviews", url: "/admin/reviews", icon: Star },
    { title: "Orders", url: "/admin/orders", icon: FileText },
    { title: "Payments", url: "/admin/payments", icon: CreditCard },
    { title: "Profile", url: "/admin/profile", icon: UserCog },
  ],
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const router = useRouter();

  // ✅ If not admin, redirect to home or 403
  React.useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/"); // or router.replace("/403") if you have a forbidden page
    }
  }, [user, router]);

  // ✅ Show nothing if not admin
  if (user?.role !== "ADMIN") return null;

  return (
    <Sidebar>
      <SidebarHeader className="py-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <div className="flex items-center justify-center">
                {/* <Logo /> */}
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-0">
        <NavMain items={adminData.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
