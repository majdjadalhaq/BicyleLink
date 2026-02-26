import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import ListingCard from "../../components/ListingCard";
import { LoadingState } from "../../components/ui";
import EmptyState from "../../components/ui/EmptyState/EmptyState";

const MyListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);

  const { isLoading, error, performFetch } = useFetch(
    `/listings?ownerId=${user?._id}`,
    (response) => {
      setListings(response.result);
    },
  );

  useEffect(() => {
    if (user) {
      performFetch();
    }
  }, [user]);

  const activeCount = listings.filter((l) => l.status === "active").length;
  const soldCount = listings.filter((l) => l.status === "sold").length;

  if (isLoading) return <LoadingState message="Loading your bikes..." />;
  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-red-500">
        Error: {error.toString()}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          My Listings
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Manage your bikes and track their status.
        </p>
      </div>

      {/* Stats bar */}
      {listings.length > 0 && (
        <div className="flex gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              {activeCount} Active
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              {soldCount} Sold
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      {listings.length === 0 ? (
        <div className="py-12 bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
          <EmptyState
            title="No listings yet"
            message="Use the 'Sell a Bike' button in the navigation to create your first listing."
            icon={
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <polyline points="15 6 10 6 6 10.5 4.5 13" />
                <polyline points="19 17.5 19 9 14 3 7.5 3" />
              </svg>
            }
          />
        </div>
      ) : (
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              isOwnerView={true}
              onUpdated={performFetch}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
