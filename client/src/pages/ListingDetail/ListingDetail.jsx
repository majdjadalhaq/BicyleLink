import { lazy, Suspense, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25,
    },
  },
};

const RevealItem = ({ children, className = "" }) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
);

RevealItem.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
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
    if (listing?.title) {
      document.title = `${listing.title} | BiCycleL`;
    }
    return () => {
      document.title = "BiCycleL | Premium marketplace for used bikes";
    };
  }, [listing]);

  if (loading) return <ListingDetailSkeleton />;
  
  if (error || !listing)
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div 
           initial={{ scale: 0.8, opacity: 0 }} 
           animate={{ scale: 1, opacity: 1 }}
           className="w-24 h-24 mb-6 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </motion.div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Listing Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
          {error || "The bicycle you're looking for might have been sold, removed, or the link is broken."}
        </p>
        <Link to="/" className="btn-primary">Back to Garage</Link>
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
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#121212] transition-colors duration-300 pb-[150px] md:pb-24 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 pt-0 sm:pt-6">
        {/* Breadcrumb */}
        <div className="hidden md:block mb-8 px-1">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-500 transition-colors group">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><polyline points="15 18 9 12 15 6" /></svg>
            Back to Listings
          </Link>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px] gap-8 lg:gap-14 items-start w-full min-w-0"
        >
          {/* Main Column */}
          <div className="w-full flex flex-col gap-8">
            <RevealItem>
              <div className="relative group/carousel block overflow-hidden rounded-[2rem] w-full shadow-2xl shadow-black/5">
                <ListingImageCarousel images={listing.images || []} title={listing.title} status={listing.status} />
                <ListingActions 
                  listing={listing} 
                  isOwner={isOwner} 
                  user={user} 
                  id={id} 
                  handleStatusClick={handleStatusClick} 
                  onReportClick={() => setReportModalOpen(true)} 
                />
              </div>
            </RevealItem>

            {/* Mobile Metadata */}
            <div className="lg:hidden flex flex-col gap-6 px-4">
              <RevealItem><ListingHeader listing={listing} isOwner={isOwner} /></RevealItem>
              <RevealItem><ListingInfo listing={listing} displayPrice={displayPrice} /></RevealItem>
              <RevealItem><ListingSpecs listing={listing} /></RevealItem>
            </div>

            {/* Description */}
            {listing.description && (
              <RevealItem className="bg-white dark:bg-[#1a1a1a] p-8 sm:rounded-[2rem] border-y sm:border border-gray-100 dark:border-white/5 shadow-sm">
                <h3 className="text-xl font-black mb-6 text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-white/5 pb-4">Description</h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-line text-[15px]">{listing.description}</p>
              </RevealItem>
            )}

            {/* Mobile Seller/Map */}
            <div className="lg:hidden flex flex-col gap-6 px-4">
              <RevealItem>
                <SellerCard 
                  seller={sellerData} canRate={canRate} canViewReviews={canViewReviews} isSold={listing.status === "sold"}
                  onRate={() => setReviewModalOpen(true)} onViewReviews={() => setReviewsListOpen(true)}
                  onViewProfile={() => navigate(`/profile/${sellerData._id}?fromListing=${id}`)}
                />
              </RevealItem>
              {listing.coordinates?.coordinates && (
                <RevealItem>
                   <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl animate-pulse" />}>
                     <LocationMap coordinates={listing.coordinates} title="Bike Location" />
                   </Suspense>
                </RevealItem>
              )}
            </div>
          </div>

          {/* Desktop Sidebar (Sticky) */}
          <div className="hidden lg:flex w-full flex-col gap-6 sticky top-24">
            <RevealItem><ListingHeader listing={listing} isOwner={isOwner} /></RevealItem>
            <RevealItem><ListingInfo listing={listing} displayPrice={displayPrice} /></RevealItem>
            <RevealItem><ListingSpecs listing={listing} /></RevealItem>
            <RevealItem>
              <SellerCard 
                seller={sellerData} canRate={canRate} canViewReviews={canViewReviews} isSold={listing.status === "sold"}
                onRate={() => setReviewModalOpen(true)} onViewReviews={() => setReviewsListOpen(true)}
                onViewProfile={() => navigate(`/profile/${sellerData._id}?fromListing=${id}`)}
              />
            </RevealItem>
            {listing.coordinates?.coordinates && (
              <RevealItem>
                <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl animate-pulse" />}>
                  <LocationMap coordinates={listing.coordinates} title="Bike Location" />
                </Suspense>
              </RevealItem>
            )}
          </div>
        </motion.div>

        <MarkAsSoldModal 
          isOpen={statusModalOpen} candidates={candidates} isLoading={isLoadingCandidates} selectedBuyerId={selectedBuyerId}
          onBuyerChange={setSelectedBuyerId} onConfirm={() => handleStatusUpdate("sold")} onClose={() => setStatusModalOpen(false)}
        />
        <ReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} onSubmit={handleReviewSubmit} isSubmitting={isSubmittingReview} />
        <ReviewsList 
          isOpen={reviewsListOpen} onClose={() => setReviewsListOpen(false)} userId={listing.ownerId?._id} userName={listing.ownerId?.name}
          refreshTrigger={reviewsRefreshTrigger} onReviewDeleted={() => { setHasReviewed(false); setReviewsRefreshTrigger(prev => prev + 1); }}
        />
        <ReportModal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} onSubmit={handleReportSubmit} isSubmitting={isSubmittingReport} targetTitle={listing.title} />
        
        <StickyContactBar listing={listing} displayPrice={displayPrice} id={id} user={user} isOwner={isOwner} />
      </div>
    </div>
  );
};

export default ListingDetail;
