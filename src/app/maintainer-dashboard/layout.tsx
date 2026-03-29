import { redirect } from "next/navigation";
import { requireMaintainerDashboardAccess } from "@/lib/auth";
import { logoutMaintainer } from "@/app/(admin)/actions/maintainers";
import { MaintainerSidebar } from "./_components/MaintainerSidebar";

export default async function MaintainerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireMaintainerDashboardAccess();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow z-10 sticky top-0">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">
                Maintainer
              </span>
            </div>
            <div className="flex items-center">
              <form action={logoutMaintainer}>
                <button
                  type="submit"
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <MaintainerSidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
