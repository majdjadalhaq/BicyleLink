import { Link } from "react-router";

const ListingBreadcrumb = () => {
  return (
    <div className="hidden md:block mb-8 px-1">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-500 transition-colors group"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Listings
      </Link>
    </div>
  );
};

export default ListingBreadcrumb;
