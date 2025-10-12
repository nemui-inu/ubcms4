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
        <main className="ms-4 me-4 flex align-center justify-center w-full">
          <div className="flex flex-col gap-2 w-full">
            <SidebarTrigger className="mt-2" />
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
