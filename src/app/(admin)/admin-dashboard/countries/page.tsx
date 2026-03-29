import Link from "next/link";
import { redirect } from "next/navigation";
import { getCountriesPaginated } from "@/app/(admin)/actions/admin";
import { AddCountryModal } from "./_components/AddCountryModal";
import { DeleteCountryButton } from "./_components/DeleteCountryButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function buildCountriesHref(opts: { page?: number }) {
  const p = new URLSearchParams();
  if (opts.page && opts.page > 1) p.set("page", String(opts.page));
  const q = p.toString();
  return q ? `/admin-dashboard/countries?${q}` : "/admin-dashboard/countries";
}

export default async function CountriesPage({
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

  const data = await getCountriesPaginated({ page });

  if (data.totalPages > 0 && page > data.totalPages) {
    redirect(buildCountriesHref({ page: data.totalPages }));
  }

  const {
    items: countries,
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
          Countries
        </h1>
        <AddCountryModal />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead>Num Code</TableHead>
              <TableHead>Phone Code</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="w-[72px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countries.map((country) => (
              <TableRow key={country.id}>
                <TableCell className="font-medium text-gray-900">
                  {country.name}
                </TableCell>
                <TableCell>{country.nationality || "-"}</TableCell>
                <TableCell>{country.numericCode || "-"}</TableCell>
                <TableCell>{country.phoneCode || "-"}</TableCell>
                <TableCell>
                  {country.CurrencyName} (
                  {country.CurrencySymbol || country.currencyCode})
                </TableCell>
                <TableCell className="text-right">
                  <DeleteCountryButton
                    countryId={country.id}
                    countryName={country.name}
                  />
                </TableCell>
              </TableRow>
            ))}
            {countries.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-gray-500"
                >
                  No countries found. Add some above.
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
                href={buildCountriesHref({ page: currentPage - 1 })}
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
                href={buildCountriesHref({ page: currentPage + 1 })}
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
