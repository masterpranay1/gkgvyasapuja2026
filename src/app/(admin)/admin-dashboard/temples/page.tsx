import Link from "next/link";
import { redirect } from "next/navigation";
import { getTemplesPaginated, getCities } from "@/app/(admin)/actions/admin";
import { AddTempleModal } from "./_components/AddTempleModal";
import { DeleteTempleButton } from "./_components/DeleteTempleButton";
import { TempleSearchBar } from "./_components/TempleSearchBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function buildTemplesHref(opts: { page?: number; q?: string }) {
  const p = new URLSearchParams();
  const t = opts.q?.trim();
  if (t) p.set("q", t);
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  const qs = p.toString();
  return qs ? `/admin-dashboard/temples?${qs}` : "/admin-dashboard/temples";
}

export default async function TemplesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const pageRaw = sp.page;
  const parsedPage =
    typeof pageRaw === "string" ? parseInt(pageRaw, 10) : NaN;
  const page =
    Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const qRaw = sp.q;
  const searchQuery =
    typeof qRaw === "string" && qRaw.trim().length > 0 ? qRaw.trim() : undefined;

  const [data, allCities] = await Promise.all([
    getTemplesPaginated({ page, search: searchQuery }),
    getCities(),
  ]);

  if (data.totalPages > 0 && page > data.totalPages) {
    redirect(
      buildTemplesHref({ page: data.totalPages, q: searchQuery }),
    );
  }

  const {
    items: templeRows,
    total,
    page: currentPage,
    pageSize,
    totalPages,
  } = data;

  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center whitespace-nowrap">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Temples
        </h1>
        <AddTempleModal cities={allCities} />
      </div>

      <TempleSearchBar initialQuery={searchQuery ?? ""} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[260px]">Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="w-[72px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templeRows.map((temple) => (
              <TableRow key={temple.id}>
                <TableCell className="font-medium text-gray-900">
                  {temple.name}
                </TableCell>
                <TableCell>{temple.cityName}</TableCell>
                <TableCell>{temple.stateName}</TableCell>
                <TableCell className="text-right">
                  <DeleteTempleButton
                    templeId={temple.id}
                    templeName={temple.name}
                  />
                </TableCell>
              </TableRow>
            ))}
            {templeRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-gray-500"
                >
                  {searchQuery
                    ? "No temples match your search. Try different words or clear the search."
                    : "No temples found. Add some above."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {total > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
          <p>
            Showing{" "}
            <span className="font-medium text-gray-900">
              {from}–{to}
            </span>{" "}
            of <span className="font-medium text-gray-900">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={buildTemplesHref({
                  page: currentPage - 1,
                  q: searchQuery,
                })}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center rounded-md border border-transparent px-3 py-1.5 text-sm text-gray-400 cursor-not-allowed">
                Previous
              </span>
            )}
            <span className="text-gray-500 tabular-nums px-1">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages ? (
              <Link
                href={buildTemplesHref({
                  page: currentPage + 1,
                  q: searchQuery,
                })}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center rounded-md border border-transparent px-3 py-1.5 text-sm text-gray-400 cursor-not-allowed">
                Next
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
