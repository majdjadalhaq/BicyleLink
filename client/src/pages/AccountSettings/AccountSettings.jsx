import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/form/InputField";
import SubmitButton from "../../components/form/SubmitButton";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import styles from "./AccountSettings.module.css";

const AccountSettings = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  // Change Password State
  const [passwordCode, setPasswordCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordCodeSent, setIsPasswordCodeSent] = useState(false);

  // Change Email State
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [isEmailCodeSent, setIsEmailCodeSent] = useState(false);

  // Delete Account State
  const [deleteCode, setDeleteCode] = useState("");
  const [isDeleteCodeSent, setIsDeleteCodeSent] = useState(false);
  const [success, setSuccess] = useState("");

  // --- Handlers for Success ---
  const onPasswordChanged = () => {
    setPasswordCode("");
    setNewPassword("");
    setIsPasswordCodeSent(false);
    setSuccess("Password updated successfully!");
    setTimeout(() => setSuccess(""), 5000);
  };

  const onEmailVerified = (data) => {
    if (data?.user) {
      login(data.user);
    }
    setNewEmail("");
    setEmailCode("");
    setIsEmailCodeSent(false);
    setSuccess("Email updated successfully!");
    setTimeout(() => setSuccess(""), 5000);
  };

  const onDeleted = async () => {
    await logout();
    navigate("/login");
  };

  // --- useFetch Hooks for actions ---
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

  // --- Generic Security Code Requests ---
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

  // --- Form Submissions ---
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
        "Are you absolutely sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      performDelete({
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: deleteCode }),
      });
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Account Settings</h1>
      {success && <div className={styles.success}>{success}</div>}
      {passwordError && (
        <div className={styles.error}>{passwordError.toString()}</div>
      )}
      {emailVerifyError && (
        <div className={styles.error}>{emailVerifyError.toString()}</div>
      )}
      {deleteError && (
        <div className={styles.error}>{deleteError.toString()}</div>
      )}

      {/* Change Password Section */}
      <section className={styles.section}>
        <h2>Change Password</h2>
        {!isPasswordCodeSent ? (
          <div>
            <p className={styles.hint}>
              To change your password, we need to send a security code to your
              current email address.
            </p>
            {passReqError && (
              <div className={styles.error}>{passReqError.toString()}</div>
            )}
            <button
              type="button"
              onClick={() => performPassCodeReq({ method: "POST" })}
              disabled={isRequestingPassCode}
              className={styles.requestBtn}
            >
              {isRequestingPassCode ? "Sending..." : "Request Security Code"}
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange}>
            <p className={styles.hint}>
              A 6-digit code has been sent to {user?.email}.
            </p>
            <InputField
              name="passwordCode"
              value={passwordCode}
              onChange={setPasswordCode}
              placeholder="Enter 6-digit Security Code"
            />
            <InputField
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="New Password"
            />
            {passwordError && (
              <div className={styles.error}>{passwordError.toString()}</div>
            )}
            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setIsPasswordCodeSent(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <SubmitButton isLoading={isChangingPassword}>
                Update Password
              </SubmitButton>
            </div>
          </form>
        )}
      </section>

      {/* Change Email Section */}
      <section className={styles.section}>
        <h2>Change Email Address</h2>
        <p className={styles.hint}>
          Current Email: <strong>{user?.email}</strong>
        </p>

        {!isEmailCodeSent ? (
          <form onSubmit={handleEmailRequest}>
            <InputField
              name="newEmail"
              type="email"
              value={newEmail}
              onChange={setNewEmail}
              placeholder="New Email Address"
            />
            {emailReqError && (
              <div className={styles.error}>{emailReqError.toString()}</div>
            )}
            <SubmitButton isLoading={isRequestingEmail}>
              Verify New Email
            </SubmitButton>
          </form>
        ) : (
          <form onSubmit={handleEmailVerify}>
            <p className={styles.hint}>
              A 6-digit code has been sent to {newEmail}.
            </p>
            <InputField
              name="emailCode"
              value={emailCode}
              onChange={setEmailCode}
              placeholder="Enter 6-digit Code"
            />
            {emailVerifyError && (
              <div className={styles.error}>{emailVerifyError.toString()}</div>
            )}
            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setIsEmailCodeSent(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <SubmitButton isLoading={isVerifyingEmail}>
                Verify & Update Email
              </SubmitButton>
            </div>
          </form>
        )}
      </section>

      {/* Danger Zone: Delete Account */}
      <section className={`${styles.section} ${styles.dangerZone}`}>
        <h2 className={styles.dangerTitle}>Danger Zone</h2>
        <p className={styles.hint}>
          Once you delete your account, there is no going back. Please be
          certain.
        </p>

        {!isDeleteCodeSent ? (
          <div>
            <p className={styles.hint}>
              To proceed with deletion, request a security code to verify your
              identity.
            </p>
            {deleteReqError && (
              <div className={styles.error}>{deleteReqError.toString()}</div>
            )}
            <button
              type="button"
              onClick={() => performDeleteCodeReq({ method: "POST" })}
              disabled={isRequestingDeleteCode}
              className={`${styles.requestBtn} ${styles.dangerRequestBtn}`}
            >
              {isRequestingDeleteCode
                ? "Sending..."
                : "Request Security Code to Delete"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleDeleteAccount}>
            <p className={styles.hint}>
              A 6-digit code has been sent to your email. Enter it below to
              irrevocably delete your account.
            </p>
            <InputField
              name="deleteCode"
              value={deleteCode}
              onChange={setDeleteCode}
              placeholder="Enter 6-digit Security Code"
            />
            {deleteError && (
              <div className={styles.error}>{deleteError.toString()}</div>
            )}
            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setIsDeleteCodeSent(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <SubmitButton
                isLoading={isDeleting}
                buttonClass={styles.dangerBtn}
              >
                Confirm Deletion
              </SubmitButton>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default AccountSettings;
