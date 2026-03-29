import { Suspense } from "react";
import {
  getAdminOfferings,
  getCountries,
  getStates,
  getCities,
  getTemples,
} from "@/app/(admin)/actions/admin";
import { OfferingsFilter } from "@/app/(admin)/admin-dashboard/offerings/_components/OfferingsFilter";
import { ViewEditOfferingModal } from "@/app/(admin)/admin-dashboard/offerings/_components/ViewEditOfferingModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function MaintainerOfferingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const countryId = sp.country as string | undefined;
  const stateId = sp.state as string | undefined;
  const cityId = sp.city as string | undefined;
  const templeId = sp.temple as string | undefined;
  const language = sp.language as string | undefined;

  const [offerings, countries, states, cities, temples] = await Promise.all([
    getAdminOfferings({ countryId, stateId, cityId, templeId, language }),
    getCountries(),
    getStates(),
    getCities(),
    getTemples(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center whitespace-nowrap">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Offerings
        </h1>
      </div>

      <Suspense
        fallback={
          <div className="h-[120px] bg-gray-100 rounded-lg border border-gray-200 animate-pulse mb-6"></div>
        }
      >
        <OfferingsFilter
          countries={countries}
          states={states}
          cities={cities}
          temples={temples}
          basePath="/maintainer-dashboard/offerings"
        />
      </Suspense>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Devotee</TableHead>
              <TableHead>Initiated Name</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Language</TableHead>
              <TableHead className="w-1/2">Offering</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offerings.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-gray-900">
                  {item.user.firstName} {item.user.lastName}
                </TableCell>
                <TableCell>{item.user.initiatedName || "-"}</TableCell>
                <TableCell>{item.year}</TableCell>
                <TableCell>{item.language}</TableCell>
                <TableCell>
                  <ViewEditOfferingModal
                    offering={{
                      id: item.id,
                      offering: item.offering,
                      language: item.language,
                      userParams: `${item.user.firstName} ${item.user.lastName} - ${item.year}`,
                    }}
                  />
                </TableCell>
                <TableCell className="text-sm">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
            {offerings.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-gray-500"
                >
                  No offerings found for the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
