import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import ReviewModal from "../../components/ReviewModal/ReviewModal";
import ReviewsList from "../../components/ReviewsList/ReviewsList";
import ListingImageCarousel from "../../components/ListingImageCarousel/ListingImageCarousel";
import SellerCard from "../../components/SellerCard/SellerCard";
import MarkAsSoldModal from "../../components/MarkAsSoldModal";

const LocationMap = lazy(() => import("../../components/Map/LocationMap"));

// Subcomponents
import ListingHeader from "./components/ListingHeader";
import ListingInfo from "./components/ListingInfo";
import ListingActions from "./components/ListingActions";
import ListingSpecs from "./components/ListingSpecs";
import StickyContactBar from "./components/StickyContactBar";
import { ListingDetailSkeleton } from "../../components/ui/SkeletonLoaders";
import ReportModal from "../../components/ReportModal/ReportModal";
// Hooks
import useListingDetail from "./hooks/useListingDetail";

const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "0px 0px -50px 0px" }}
    transition={{ duration: 0.6, delay, ease: [0.25, 1, 0.5, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const ListingCardLazy = lazy(() => import("../../components/ListingCard"));

/* ─── Similar listings strip ─────────────────────────────────── */
const SimilarListings = ({ category, currentId }) => {
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    if (!category) return;
    const controller = new AbortController();
    fetch(
      `/api/listings?category=${encodeURIComponent(category)}&limit=8&page=1`,
      { credentials: "include", signal: controller.signal },
    )
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setSimilar(
            (json.result || []).filter((l) => l._id !== currentId).slice(0, 4),
          );
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [category, currentId]);

  if (!similar.length) return null;

  return (
    <div className="mt-14">
      <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-500"
        >
          <path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path d="M18.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path d="M15 6H9c-1.5 0-3 1-3 3l.5 3.5" />
          <path d="M15 6c1.5 0 3 1 3 3l-.5 3.5" />
        </svg>
        Similar Bikes
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <Suspense
          fallback={[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse"
            />
          ))}
        >
          {similar.map((l) => (
            <ListingCardLazy key={l._id} listing={l} />
          ))}
        </Suspense>
      </div>
    </div>
  );
};

/* ─── Share button ───────────────────────────────────────────── */
const ShareButton = () => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // User cancelled — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl transition-all"
      title="Share this listing"
    >
      {copied ? (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </>
      )}
    </button>
  );
};

const ListingDetail = () => {
  const {
    id,
    listing,
    loading,
    error,
    user,
    isOwner,
    canRate,
    canViewReviews,
    statusModalOpen,
    setStatusModalOpen,
    candidates,
    isLoadingCandidates,
    selectedBuyerId,
    setSelectedBuyerId,
    reviewModalOpen,
    setReviewModalOpen,
    isSubmittingReview,
    reviewsListOpen,
    setReviewsListOpen,
    reviewsRefreshTrigger,
    setReviewsRefreshTrigger,
    setHasReviewed,
    handleStatusClick,
    handleStatusUpdate,
    handleReviewSubmit,
    displayPrice,
    reportModalOpen,
    setReportModalOpen,
    isSubmittingReport,
    handleReportSubmit,
    navigate,
  } = useListingDetail();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!listing?.title) return;

    const setMeta = (property, content, isName = false) => {
      const attr = isName ? "name" : "property";
      let el = document.querySelector(`meta[${attr}="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const title = `${listing.title} | BiCycleL`;
    const description = listing.description
      ? listing.description.slice(0, 160)
      : `${listing.title} — €${listing.price?.toLocaleString()} on BiCycleL`;
    const image = listing.images?.[0] || "/favicon.png";
    const url = window.location.href;

    document.title = title;
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:image", image);
    setMeta("og:url", url);
    setMeta("og:type", "product");
    setMeta("twitter:title", title, true);
    setMeta("twitter:description", description, true);
    setMeta("twitter:image", image, true);
    setMeta("description", description, true);

    return () => {
      document.title = "BiCycleL | Premium marketplace for used bikes";
      setMeta("og:title", "BiCycleL - Premium Second-Hand Bike Marketplace");
      setMeta(
        "og:description",
        "BiCycleL - The premium community-driven marketplace for high-quality second-hand bikes in the Netherlands.",
      );
      setMeta("og:image", "/favicon.png");
      setMeta("og:url", "https://bicyle-link.vercel.app");
      setMeta("og:type", "website");
      setMeta(
        "twitter:title",
        "BiCycleL - Premium Second-Hand Bike Marketplace",
        true,
      );
      setMeta(
        "twitter:description",
        "BiCycleL - The premium community-driven marketplace for high-quality second-hand bikes in the Netherlands.",
        true,
      );
      setMeta("twitter:image", "/favicon.png", true);
      setMeta(
        "description",
        "BiCycleL - The premium community-driven marketplace for high-quality second-hand bikes in the Netherlands. Find your perfect ride today!",
        true,
      );
    };
  }, [listing]);

  if (loading) return <ListingDetailSkeleton />;
  if (error || !listing)
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
          Listing Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
          {error ||
            "The bicycle you're looking for might have been sold, removed, or the link is broken."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          Back to Garage
        </Link>
      </div>
    );

  const sellerData = {
    _id: listing.ownerId?._id,
    name: listing.ownerId?.name,
    averageRating: listing.ownerId?.averageRating ?? 0,
    reviewCount: listing.ownerId?.reviewCount ?? 0,
    avatarUrl: listing.ownerId?.avatarUrl,
    bio: listing.ownerId?.bio,
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#121212] transition-colors duration-300 pb-[150px] md:pb-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 pt-0 sm:pt-6">
        {/* Back Button - Desktop Top */}
        <div className="hidden md:block mb-6 px-1">
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

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px] gap-8 lg:gap-14 items-start w-full min-w-0">
          {/* Main Content Column (Left Side) - Images & Description */}
          <div className="w-full flex flex-col gap-6 lg:gap-8">
            {/* Images with Overlay Actions */}
            <FadeIn>
              <div className="relative group/carousel block overflow-hidden rounded-2xl w-full">
                <ListingImageCarousel
                  images={listing.images || []}
                  title={listing.title}
                  status={listing.status}
                />
                <ListingActions
                  listing={listing}
                  isOwner={isOwner}
                  user={user}
                  id={id}
                  handleStatusClick={handleStatusClick}
                  onReportClick={() => setReportModalOpen(true)}
                />
              </div>
            </FadeIn>

            {/* Mobile Only: Header, Pricing, Specs */}
            <FadeIn
              delay={0.1}
              className="lg:hidden flex flex-col gap-4 mt-2 px-4 sm:px-0"
            >
              <ListingHeader listing={listing} isOwner={isOwner} />
              <ListingInfo listing={listing} displayPrice={displayPrice} />
              <ListingSpecs listing={listing} />
            </FadeIn>

            {/* Description */}
            {listing.description && (
              <FadeIn
                delay={0.2}
                className="bg-white dark:bg-[#1a1a1a] p-6 lg:p-8 sm:rounded-2xl border-y sm:border border-gray-100 dark:border-white/5 shadow-sm"
              >
                <h3 className="text-xl font-black mb-4 text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-white/5 pb-4">
                  Description
                </h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-line text-[15px]">
                  {listing.description}
                </p>
              </FadeIn>
            )}

            {/* Mobile Only: Seller & Map */}
            <div className="lg:hidden flex flex-col gap-6 mt-2 px-4 sm:px-0">
              <div>
                <SellerCard
                  seller={sellerData}
                  canRate={canRate}
                  canViewReviews={canViewReviews}
                  isSold={listing.status === "sold"}
                  onRate={() => setReviewModalOpen(true)}
                  onViewReviews={() => setReviewsListOpen(true)}
                  onViewProfile={() =>
                    navigate(`/profile/${sellerData._id}?fromListing=${id}`)
                  }
                />
              </div>

              {listing.coordinates?.coordinates && (
                <Suspense
                  fallback={
                    <div className="h-64 bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl animate-pulse" />
                  }
                >
                  <LocationMap
                    coordinates={listing.coordinates}
                    title="Bike Location"
                  />
                </Suspense>
              )}
            </div>
          </div>

          {/* Details / Action Column (Right Side) - Desktop Only */}
          <div className="hidden lg:flex w-full flex-col gap-6 sticky top-24">
            <FadeIn delay={0.1}>
              <ListingHeader listing={listing} isOwner={isOwner} />
            </FadeIn>

            <FadeIn delay={0.15}>
              <ListingInfo listing={listing} displayPrice={displayPrice} />
            </FadeIn>

            <FadeIn delay={0.2}>
              <ListingSpecs listing={listing} />
            </FadeIn>

            <FadeIn delay={0.25}>
              <SellerCard
                seller={sellerData}
                canRate={canRate}
                canViewReviews={canViewReviews}
                isSold={listing.status === "sold"}
                onRate={() => setReviewModalOpen(true)}
                onViewReviews={() => setReviewsListOpen(true)}
                onViewProfile={() =>
                  navigate(`/profile/${sellerData._id}?fromListing=${id}`)
                }
              />
            </FadeIn>

            {listing.coordinates?.coordinates && (
              <FadeIn delay={0.3} className="relative mt-2">
                <Suspense
                  fallback={
                    <div className="h-64 bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl animate-pulse" />
                  }
                >
                  <LocationMap
                    coordinates={listing.coordinates}
                    title="Bike Location"
                  />
                </Suspense>
              </FadeIn>
            )}
          </div>
        </div>

        <MarkAsSoldModal
          isOpen={statusModalOpen}
          candidates={candidates}
          isLoading={isLoadingCandidates}
          selectedBuyerId={selectedBuyerId}
          onBuyerChange={setSelectedBuyerId}
          onConfirm={() => handleStatusUpdate("sold")}
          onClose={() => setStatusModalOpen(false)}
        />

        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onSubmit={handleReviewSubmit}
          isSubmitting={isSubmittingReview}
        />

        <ReviewsList
          isOpen={reviewsListOpen}
          onClose={() => setReviewsListOpen(false)}
          userId={listing.ownerId?._id}
          userName={listing.ownerId?.name}
          refreshTrigger={reviewsRefreshTrigger}
          onReviewDeleted={() => {
            setHasReviewed(false);
            setReviewsRefreshTrigger((prev) => prev + 1);
          }}
        />

        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          onSubmit={handleReportSubmit}
          isSubmitting={isSubmittingReport}
          targetTitle={listing.title}
        />

        {/* Share button — desktop */}
        <div className="hidden md:flex justify-end mt-6">
          <ShareButton />
        </div>

        {/* Similar listings */}
        <SimilarListings category={listing.category} currentId={id} />

        {/* Sticky Mobile Bar */}
        <StickyContactBar
          listing={listing}
          displayPrice={displayPrice}
          id={id}
          user={user}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
};

export default ListingDetail;
