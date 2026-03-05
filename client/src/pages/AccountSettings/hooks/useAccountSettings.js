import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import useFetch from "../../../hooks/useFetch";
import { useAuth } from "../../../hooks/useAuth";

export const useAccountSettings = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("security");
  const [success, setSuccess] = useState("");

  const [passwordCode, setPasswordCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordCodeSent, setIsPasswordCodeSent] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false);

  const [deleteCode, setDeleteCode] = useState("");
  const [isDeleteCodeSent, setIsDeleteCodeSent] = useState(false);

  const successTimeout = useRef(null);

  const showSuccess = (msg) => {
    setSuccess(msg);
    if (successTimeout.current) clearTimeout(successTimeout.current);
    successTimeout.current = setTimeout(() => setSuccess(""), 5000);
  };

  useEffect(() => {
    return () => {
      if (successTimeout.current) clearTimeout(successTimeout.current);
    };
  }, []);

  const onPasswordChanged = () => {
    setPasswordCode("");
    setNewPassword("");
    setIsPasswordCodeSent(false);
    showSuccess("Password updated successfully!");
  };

  const onEmailVerified = (data) => {
    if (data?.user) login(data.user);
    setNewEmail("");
    setEmailCode("");
    setIsEmailCodeSent(false);
    showSuccess("Email updated successfully!");
  };

  const onDeleted = async () => {
    await logout();
    navigate("/login");
  };

  const {
    isLoading: isChangingPassword,
    error: passwordError,
    performFetch: performPasswordChange,
  } = useFetch("/users/password", onPasswordChanged);

  const {
    isLoading: isVerifyingEmail,
    error: emailVerifyError,
    performFetch: performEmailVerify,
  } = useFetch("/users/verify-email-change", onEmailVerified);

  const {
    isLoading: isDeleting,
    error: deleteError,
    performFetch: performDelete,
  } = useFetch("/users/account", onDeleted);

  const {
    isLoading: isRequestingPassCode,
    error: passReqError,
    performFetch: performPassCodeReq,
  } = useFetch("/users/request-security-code", () =>
    setIsPasswordCodeSent(true),
  );

  const {
    isLoading: isRequestingDeleteCode,
    error: deleteReqError,
    performFetch: performDeleteCodeReq,
  } = useFetch("/users/request-security-code", () => setIsDeleteCodeSent(true));

  const {
    isLoading: isRequestingEmail,
    error: emailReqError,
    performFetch: performEmailReq,
  } = useFetch("/users/request-email-change", () => setIsEmailCodeSent(true));

  const { isLoading: isUpdatingSettings, performFetch: performSettingsUpdate } =
    useFetch("/users/notification-settings", (data) => {
      if (data?.settings) {
        login({ ...user, notificationSettings: data.settings });
        showSuccess("Preferences updated!");
      }
    });

  const handleSettingsChange = (key, value) => {
    performSettingsUpdate({
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ settings: { [key]: value } }),
    });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passwordCode || !newPassword) return;
    performPasswordChange({
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: passwordCode, newPassword }),
    });
  };

  const handleEmailRequest = (e) => {
    e.preventDefault();
    if (!newEmail || newEmail === user.email) return;
    performEmailReq({
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ newEmail }),
    });
  };

  const handleEmailVerify = (e) => {
    e.preventDefault();
    if (!emailCode || emailCode.length !== 6) return;
    performEmailVerify({
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: emailCode }),
    });
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    if (!deleteCode) return;
    if (
      window.confirm(
        "Are you absolutely sure you want to delete your account? This cannot be undone.",
      )
    ) {
      performDelete({
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: deleteCode }),
      });
    }
  };

  return {
    user,
    activeTab,
    setActiveTab,
    success,
    // password
    passwordCode,
    setPasswordCode,
    newPassword,
    setNewPassword,
    isPasswordCodeSent,
    setIsPasswordCodeSent,
    isChangingPassword,
    passwordError,
    isRequestingPassCode,
    passReqError,
    performPassCodeReq,
    handlePasswordChange,
    // email
    newEmail,
    setNewEmail,
    emailCode,
    setEmailCode,
    isEmailCodeSent,
    setIsEmailCodeSent,
    isRequestingEmail,
    emailReqError,
    isVerifyingEmail,
    emailVerifyError,
    handleEmailRequest,
    handleEmailVerify,
    // delete
    deleteCode,
    setDeleteCode,
    isDeleteCodeSent,
    setIsDeleteCodeSent,
    isRequestingDeleteCode,
    deleteReqError,
    isDeleting,
    deleteError,
    performDeleteCodeReq,
    handleDeleteAccount,
    // notifications
    isUpdatingSettings,
    handleSettingsChange,
  };
};
