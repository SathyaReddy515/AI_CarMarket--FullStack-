import { CarFilters } from "./_components/car-filters";
import { getCarFilters } from "@/actions/car-listing";
import { CarListings } from "./_components/car-listing";
import { Suspense } from "react";

export const metadata = {
  title: "Cars | Vehiql",
  description: "Browse and search for your dream car",
};

export default async function CarsPage() {
  // Fetch filters data on the server
  const filtersData = await getCarFilters();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl mb-4 gradient-title">Browse Cars</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Section */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <Suspense fallback={<div className="p-4 border rounded-lg bg-gray-50 animate-pulse h-[400px]">Loading filters...</div>}>
            <CarFilters filters={filtersData.data} />
          </Suspense>
        </div>

        {/* Car Listings */}
        <div className="flex-1">
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div className="h-64 border rounded-lg bg-gray-50 animate-pulse"></div></div>}>
            <CarListings />
          </Suspense>
        </div>
      </div>
    </div>
  );
}