import { useLocation, Link } from "react-router-dom";
import TEST_ID from "./VerifyCode.testid";

const VerifyCode = () => {
  const location = useLocation();
  const email = location.state?.email || "";

  return (
    <div data-testid={TEST_ID.container}>
      <h1 data-testid={TEST_ID.title}>Verify Your Email</h1>
      <p data-testid={TEST_ID.message}>
        A verification code has been sent to <strong>{email}</strong>.
        <br />
        Please check your email (or the server console in development mode) for
        the 5-digit code.
      </p>
      <p>
        <em>
          Note: Email verification feature is under development. For now, check
          the backend server console for your verification code.
        </em>
      </p>
      <p>
        <Link to="/signup">Back to Signup</Link>
      </p>
    </div>
  );
};

export default VerifyCode;
