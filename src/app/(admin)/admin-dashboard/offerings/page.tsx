import {
  getAdminOfferings,
  getCountries,
  getStates,
  getCities,
  getTemples,
} from "@/app/(admin)/actions/admin";
import { OfferingsListPage } from "@/components/offerings/OfferingsListPage";

export default async function OfferingsPage({
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
    <OfferingsListPage
      offerings={offerings}
      countries={countries}
      states={states}
      cities={cities}
      temples={temples}
      basePath="/admin-dashboard/offerings"
    />
  );
}
