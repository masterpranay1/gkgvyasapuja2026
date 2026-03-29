import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getStatesPaginated,
  getCountries,
} from "@/app/(admin)/actions/admin";
import { AddStateModal } from "./_components/AddStateModal";
import { DeleteStateButton } from "./_components/DeleteStateButton";
import { StatesCountryFilter } from "./_components/StatesCountryFilter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function buildStatesHref(opts: { countryId?: string; page?: number }) {
  const p = new URLSearchParams();
  if (opts.countryId) p.set("country", opts.countryId);
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  const q = p.toString();
  return q ? `/admin-dashboard/states?${q}` : "/admin-dashboard/states";
}

export default async function StatesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const countryRaw = sp.country;
  const countryId =
    typeof countryRaw === "string" && countryRaw.length > 0
      ? countryRaw
      : undefined;

  const pageRaw = sp.page;
  const parsedPage =
    typeof pageRaw === "string" ? parseInt(pageRaw, 10) : NaN;
  const page =
    Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const [data, countries] = await Promise.all([
    getStatesPaginated({ countryId, page }),
    getCountries(),
  ]);

  if (data.totalPages > 0 && page > data.totalPages) {
    redirect(buildStatesHref({ countryId, page: data.totalPages }));
  }

  const { items: states, total, page: currentPage, pageSize, totalPages } =
    data;

  const countryMap = countries.reduce(
    (acc, country) => {
      acc[country.id] = country.name;
      return acc;
    },
    {} as Record<string, string>,
  );

  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center whitespace-nowrap">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          States
        </h1>
        <AddStateModal countries={countries} />
      </div>

      <Suspense
        fallback={
          <div className="h-[120px] bg-gray-100 rounded-lg border border-gray-200 animate-pulse" />
        }
      >
        <StatesCountryFilter countries={countries} />
      </Suspense>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="w-[72px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {states.map((state) => (
              <TableRow key={state.id}>
                <TableCell className="font-medium text-gray-900">
                  {state.name}
                </TableCell>
                <TableCell>
                  {countryMap[state.countryId] || "Unknown"}
                </TableCell>
                <TableCell className="text-right">
                  <DeleteStateButton
                    stateId={state.id}
                    stateName={state.name}
                  />
                </TableCell>
              </TableRow>
            ))}
            {states.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-gray-500"
                >
                  No states found. Add some above or adjust the filter.
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
                href={buildStatesHref({
                  countryId,
                  page: currentPage - 1,
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
                href={buildStatesHref({
                  countryId,
                  page: currentPage + 1,
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
