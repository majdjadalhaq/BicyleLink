import PropTypes from "prop-types";
import { useGoogleLogin } from "@react-oauth/google";
import useApi from "../../../hooks/useApi";

const GoogleSignupButton = ({ onSuccess, onError }) => {
  const { execute: executeGoogleSignup, isLoading } = useApi();

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const result = await executeGoogleSignup("/users/google", {
        method: "POST",
        body: { token: tokenResponse.access_token },
      });
      if (result.success) {
        onSuccess(result.user, true);
      }
    } catch (err) {
      onError(err.message || "Google signup failed.");
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => onError("Google signup was canceled or failed."),
  });

  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-[#10221C]/50 border border-gray-200 dark:border-[#10B77F]/20 rounded-2xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#10B77F]/10 hover:border-[#10B77F]/40 transition-all text-sm font-bold shadow-sm hover:shadow-glow disabled:opacity-40 disabled:cursor-not-allowed group"
      onClick={() => login()}
      disabled={isLoading}
    >
      <div className="w-5 h-5 flex items-center justify-center bg-white rounded-full p-0.5 shadow-sm group-hover:scale-110 transition-transform">
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google logo"
          className="w-full h-full"
        />
      </div>
      {isLoading ? "Signing up..." : "Continue with Google"}
    </button>
  );
};

GoogleSignupButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default GoogleSignupButton;
