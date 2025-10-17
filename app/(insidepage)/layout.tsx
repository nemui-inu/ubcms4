import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="">
      <AppSidebar />
      <SidebarInset>
        <main className="flex flex-row w-full h-full p-4">
          <div className="flex flex-col gap-2 w-full h-full">
            <SidebarTrigger />
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
