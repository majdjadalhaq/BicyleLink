import PropTypes from "prop-types";
import { useGoogleLogin } from "@react-oauth/google";
import useApi from "../../../hooks/useApi";

const GoogleLoginButton = ({ clientId, onSuccess, onError }) => {
  const { execute: executeGoogleLogin, isLoading } = useApi();
  const isClientIdPlaceholder =
    clientId === "placeholder-client-id.apps.googleusercontent.com";

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const result = await executeGoogleLogin("/users/google", {
        method: "POST",
        body: { token: tokenResponse.access_token },
      });
      if (result.success) {
        onSuccess(result.user);
      }
    } catch (err) {
      onError(err.message || "Google login failed.");
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => onError("Google login was canceled or failed."),
  });

  return (
    <div className="w-full">
      {isClientIdPlaceholder && (
        <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 text-center">
          Google Login not configured — add VITE_GOOGLE_CLIENT_ID to .env
        </div>
      )}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-[#10221C]/50 border border-gray-200 dark:border-[#10B77F]/20 rounded-2xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#10B77F]/10 hover:border-[#10B77F]/40 transition-all text-sm font-bold shadow-sm hover:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed group"
        onClick={() => login()}
        disabled={isLoading || isClientIdPlaceholder}
      >
        <div className="w-5 h-5 flex items-center justify-center bg-white rounded-full p-0.5 shadow-sm group-hover:scale-110 transition-transform">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="w-full h-full"
          />
        </div>
        {isLoading ? "Signing in..." : "Continue with Google"}
      </button>
    </div>
  );
};

GoogleLoginButton.propTypes = {
  clientId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default GoogleLoginButton;
