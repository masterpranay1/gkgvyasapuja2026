import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getCitiesPaginated,
  getCountryById,
  getStateById,
} from "@/app/(admin)/actions/admin";
import { AddCityModal } from "./_components/AddCityModal";
import { CitiesFilters } from "./_components/CitiesFilters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function buildCitiesHref(opts: {
  countryId?: string;
  stateId?: string;
  page?: number;
}) {
  const p = new URLSearchParams();
  if (opts.countryId) p.set("country", opts.countryId);
  if (opts.stateId) p.set("state", opts.stateId);
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  const q = p.toString();
  return q ? `/admin-dashboard/cities?${q}` : "/admin-dashboard/cities";
}

export default async function CitiesPage({
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
  const stateRaw = sp.state;
  const stateId =
    typeof stateRaw === "string" && stateRaw.length > 0
      ? stateRaw
      : undefined;

  const pageRaw = sp.page;
  const parsedPage =
    typeof pageRaw === "string" ? parseInt(pageRaw, 10) : NaN;
  const page =
    Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const [data, initialCountry, initialState] = await Promise.all([
    getCitiesPaginated({ countryId, stateId, page }),
    countryId ? getCountryById(countryId) : Promise.resolve(null),
    stateId ? getStateById(stateId) : Promise.resolve(null),
  ]);

  if (data.totalPages > 0 && page > data.totalPages) {
    redirect(
      buildCitiesHref({
        countryId,
        stateId,
        page: data.totalPages,
      }),
    );
  }

  const {
    items: cityRows,
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
          Cities
        </h1>
        <AddCityModal />
      </div>

      <Suspense
        fallback={
          <div className="h-[180px] bg-gray-100 rounded-lg border border-gray-200 animate-pulse" />
        }
      >
        <CitiesFilters
          initialCountry={initialCountry}
          initialState={initialState}
        />
      </Suspense>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>State</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cityRows.map((city) => (
              <TableRow key={city.id}>
                <TableCell className="font-medium text-gray-900">
                  {city.name}
                </TableCell>
                <TableCell>{city.stateName}</TableCell>
              </TableRow>
            ))}
            {cityRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="h-24 text-center text-gray-500"
                >
                  No cities found. Add some above or adjust the filters.
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
                href={buildCitiesHref({
                  countryId,
                  stateId,
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
                href={buildCitiesHref({
                  countryId,
                  stateId,
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
