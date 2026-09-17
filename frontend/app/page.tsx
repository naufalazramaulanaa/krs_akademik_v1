import { getEnrollments } from "@/lib/api";
import { SearchInput } from "@/components/search-input";
import { FilterSelect } from "@/components/filter-select";
import { Pagination } from "@/components/pagination";
import { EnrollmentTableClient } from "@/components/enrollment-table-client";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const search =
    typeof resolvedParams.search === "string" ? resolvedParams.search : "";
  const status =
    typeof resolvedParams.status === "string" ? resolvedParams.status : "";
  const academic_year =
    typeof resolvedParams.academic_year === "string"
      ? resolvedParams.academic_year
      : "";
  const page =
    typeof resolvedParams.page === "string" ? Number(resolvedParams.page) : 1;

  const response = await getEnrollments({
    search,
    status,
    academic_year,
    page,
    per_page: 25,
  });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold tracking-tight text-blue-900">
            Manajemen KRS Akademik
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sistem Single Page CRUD dengan integrasi pencarian, filter, dan pagination server-side.
          </p>
        </div>

        {/* Toolbar: Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="w-full sm:w-96">
            <SearchInput />
          </div>
          <div className="w-full sm:w-auto">
            <FilterSelect />
          </div>
        </div>

        {/* Tabel & Tombol CRUD Interaktif */}
        <EnrollmentTableClient data={response.data} />

        {/* Footer Pagination */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <Pagination
            currentPage={response.meta.current_page}
            lastPage={response.meta.last_page}
            total={response.meta.total}
          />
        </div>

      </div>
    </main>
  );
}