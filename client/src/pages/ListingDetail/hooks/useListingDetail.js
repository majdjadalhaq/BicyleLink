import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import {
  useListing,
  useListingCandidates,
  useUpdateListingStatus,
  useCheckReview,
  useSubmitReview,
  useSubmitReport,
} from "../../../hooks/useListing";
import { useQueryClient } from "@tanstack/react-query";
import useApi from "../../../hooks/useApi";
import { formatPrice } from "../../../utils/formatPrice";
import { useSocket } from "../../../hooks/useSocket";

const useListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const queryClient = useQueryClient();
  const { execute: executeApi } = useApi();

  // --- UI State (Modals & Selection) ---
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewsListOpen, setReviewsListOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);

  // --- Data Fetching (TanStack Query) ---
  const {
    data: listing,
    isLoading: loading,
    error: queryError,
  } = useListing(id);
  const { data: candidates = [], isLoading: isLoadingCandidates } =
    useListingCandidates(id, statusModalOpen);
  const { data: hasReviewed = false } = useCheckReview(id);

  // --- Mutations ---
  const updateStatusMutation = useUpdateListingStatus(id);
  const submitReviewMutation = useSubmitReview();
  const submitReportMutation = useSubmitReport();

  const error = queryError?.message;
  const isOwner =
    user && listing && user._id === (listing.ownerId?._id || listing.ownerId);
  const isBuyer = user && listing && user._id === listing.buyerId;
  const canRate = isBuyer && listing?.status === "sold" && !hasReviewed;
  const canViewReviews = (listing?.ownerId?.reviewCount ?? 0) > 0;

  // View tracking ref
  const viewTrackedRef = useRef(null);

  // --- Side Effects ---

  // Track page view once per listing ID
  useEffect(() => {
    if (!listing || !id || viewTrackedRef.current === id) return;

    const trackView = async () => {
      viewTrackedRef.current = id;
      if (!isOwner) {
        await executeApi(`/api/listings/${id}/view`, { method: "PATCH" });
      }
    };
    trackView();
  }, [id, !!listing, isOwner]);

  // Socket Live Updates
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit("join_room", { room: id });

    const handleUpdate = (data) => {
      queryClient.setQueryData(["listing", id], (prev) => {
        if (!prev) return prev;
        return { ...prev, status: data.status, buyerId: data.buyerId };
      });
    };

    socket.on("listing_status_updated", handleUpdate);
    return () => {
      socket.off("listing_status_updated", handleUpdate);
    };
  }, [socket, id]);

  // --- Handlers ---

  const handleStatusClick = () => {
    if (listing?.status === "active") {
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

    updateStatusMutation.mutate(
      { status: newStatus, buyerId },
      {
        onSuccess: () => setStatusModalOpen(false),
      },
    );
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    const targetId = listing.ownerId?._id || listing.ownerId;
    submitReviewMutation.mutate(
      { targetId, listingId: id, rating, comment },
      {
        onSuccess: () => {
          setReviewModalOpen(false);
          setReviewsListOpen(true);
        },
      },
    );
  };

  const handleReportSubmit = async (reason) => {
    if (!user) {
      navigate("/login", { state: { from: `/listings/${id}` } });
      return;
    }

    submitReportMutation.mutate(
      { targetId: id, targetType: "Listing", reason },
      {
        onSuccess: () => setReportModalOpen(false),
      },
    );
  };

  const handleMessageSeller = () => {
    if (!user) {
      navigate("/login", { state: { from: `/listings/${id}` } });
      return;
    }
    const sellerId = listing.ownerId?._id || listing.ownerId;
    navigate(`/chat/${id}?receiverId=${sellerId}`);
  };

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
    isSubmittingReview: submitReviewMutation.isPending,
    reviewsListOpen,
    setReviewsListOpen,
    handleStatusClick,
    handleStatusUpdate,
    handleReviewSubmit,
    reportModalOpen,
    setReportModalOpen,
    isSubmittingReport: submitReportMutation.isPending,
    handleReportSubmit,
    profileModalOpen,
    setProfileModalOpen,
    handleMessageSeller,
    displayPrice: listing ? formatPrice(listing.price) : "",
    navigate,
    reviewsRefreshTrigger,
    setReviewsRefreshTrigger,
    setHasReviewed: () =>
      queryClient.invalidateQueries({ queryKey: ["has_reviewed", id] }),
  };
};

export default useListingDetail;
