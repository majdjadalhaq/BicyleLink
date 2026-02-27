import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import useFetch from "../../../hooks/useFetch";
import useApi from "../../../hooks/useApi";
import useToast from "../../../hooks/useToast";
import { formatPrice } from "../../../utils/formatPrice";
import { useSocket } from "../../../hooks/useSocket";

const useListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const socket = useSocket();

  const [listing, setListing] = useState(null);
  const [prevId, setPrevId] = useState(id);

  // Modal and selection state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewsListOpen, setReviewsListOpen] = useState(false);
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Reset when navigating between listings
  if (id !== prevId) {
    setListing(null);
    setPrevId(id);
  }

  const isOwner = user && listing && user?._id === listing.ownerId?._id;
  const isBuyer = user && listing && user?._id === listing.buyerId;
  const canRate = isBuyer && listing?.status === "sold" && !hasReviewed;
  const canViewReviews = (listing?.ownerId?.reviewCount ?? 0) > 0;

  const { execute: executeApi } = useApi();

  // Fetch listing details
  const {
    isLoading: loading,
    error,
    performFetch,
    cancelFetch,
  } = useFetch(`/listings/${id}`, (response) => {
    setListing(response.result);
  });

  const hasFetchedRef = useRef(false);
  const viewTrackedRef = useRef(null); // String ref to track which ID was viewed

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    performFetch();
    return () => cancelFetch();
  }, [id, reviewsRefreshTrigger]);

  // Track page view
  useEffect(() => {
    if (!listing || !id || viewTrackedRef.current === id) return;

    const trackView = async () => {
      viewTrackedRef.current = id;
      const isActuallyOwner =
        user && user._id === (listing.ownerId?._id || listing.ownerId);
      if (!isActuallyOwner) {
        await executeApi(`/api/listings/${id}/view`, { method: "PATCH" });
      }
    };

    trackView();
  }, [id, !!listing]);

  // Fetch candidate buyers when the status modal opens
  useEffect(() => {
    if (!statusModalOpen) return;

    const fetchCandidates = async () => {
      setIsLoadingCandidates(true);
      const data = await executeApi(`/api/listings/${id}/candidates`);
      if (data?.success) {
        setCandidates(data.result);
      }
      setIsLoadingCandidates(false);
    };

    fetchCandidates();
  }, [statusModalOpen, id]);

  // Check if the current user has already reviewed this listing
  useEffect(() => {
    if (!user || !id) return;

    const checkReview = async () => {
      const data = await executeApi(`/api/reviews/check?listingId=${id}`);
      if (data?.success) {
        setHasReviewed(data.hasReviewed);
      }
    };

    checkReview();
  }, [id, user, reviewsRefreshTrigger, listing?.status]);

  // Socket Live Updates
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("join_room", { room: id });

    const handleUpdate = (data) => {
      setListing((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: data.status,
          buyerId: data.buyerId,
        };
      });
      showToast(`Listing status updated to ${data.status}`, "info");
    };

    socket.on("listing_status_updated", handleUpdate);
    return () => {
      socket.off("listing_status_updated", handleUpdate);
      // socket.emit("leave_room", { room: id }); // Optional: implement leave_room if needed
    };
  }, [socket, id, showToast]);

  const handleStatusClick = () => {
    if (listing.status === "active") {
      setStatusModalOpen(true);
    } else {
      handleStatusUpdate("active");
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    const buyerId =
      newStatus === "sold" && selectedBuyerId !== "other"
        ? selectedBuyerId
        : null;

    const data = await executeApi(`/api/listings/${id}/status`, {
      method: "PATCH",
      body: { status: newStatus, ...(buyerId ? { buyerId } : {}) },
    });

    if (data?.success) {
      setListing((prev) => ({
        ...prev,
        status: data.listing.status,
        buyerId: data.listing.buyerId,
      }));
      setStatusModalOpen(false);
      showToast(`Listing marked as ${newStatus}`, "success");
    } else {
      showToast("Failed to update status", "error");
    }
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    setIsSubmittingReview(true);

    const targetId = listing.ownerId?._id || listing.ownerId;
    const data = await executeApi("/api/reviews", {
      method: "POST",
      body: { targetId, listingId: listing._id, rating, comment },
    });

    setIsSubmittingReview(false);

    if (data?.success) {
      setReviewModalOpen(false);
      setReviewsRefreshTrigger((prev) => prev + 1);
      setHasReviewed(true);
      setReviewsListOpen(true);
      showToast("Review submitted successfully", "success");
    } else {
      showToast(
        data?.msg || data?.errors?.[0]?.message || "Failed to submit review",
        "error",
      );
    }
  };

  const handleReportSubmit = async (reason) => {
    if (!user) {
      navigate("/login", { state: { from: `/listings/${id}` } });
      return;
    }

    setIsSubmittingReport(true);
    const data = await executeApi("/api/reports", {
      method: "POST",
      body: { targetId: id, targetType: "Listing", reason },
    });
    setIsSubmittingReport(false);

    if (data?.success) {
      setReportModalOpen(false);
      showToast("Listing reported successfully", "success");
    } else {
      showToast(
        data?.message || data?.msg || "Failed to submit report",
        "error",
      );
    }
  };

  const handleMessageSeller = () => {
    if (!user) {
      navigate("/login", { state: { from: `/listings/${id}` } });
      return;
    }
    // Navigate to chat room based on listingId and users
    const room = `${id}_${user._id}_${listing.ownerId?._id || listing.ownerId}`;
    navigate(`/chat/${room}`);
  };

  const displayPrice = listing ? formatPrice(listing.price) : "";

  return {
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
    reportModalOpen,
    setReportModalOpen,
    isSubmittingReport,
    handleReportSubmit,
    profileModalOpen,
    setProfileModalOpen,
    handleMessageSeller,
    navigate,
    showToast,
    displayPrice,
  };
};

export default useListingDetail;
