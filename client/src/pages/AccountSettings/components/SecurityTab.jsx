import PropTypes from "prop-types";
import SecurityChangePassword from "./SecurityChangePassword";
import SecurityChangeEmail from "./SecurityChangeEmail";
import SecurityDeleteAccount from "./SecurityDeleteAccount";

const SecurityTab = (props) => {
  return (
    <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
      <SecurityChangePassword
        user={props.user}
        passwordCode={props.passwordCode}
        setPasswordCode={props.setPasswordCode}
        newPassword={props.newPassword}
        setNewPassword={props.setNewPassword}
        isPasswordCodeSent={props.isPasswordCodeSent}
        setIsPasswordCodeSent={props.setIsPasswordCodeSent}
        isChangingPassword={props.isChangingPassword}
        passwordError={props.passwordError}
        isRequestingPassCode={props.isRequestingPassCode}
        passReqError={props.passReqError}
        performPassCodeReq={props.performPassCodeReq}
        handlePasswordChange={props.handlePasswordChange}
      />

      <SecurityChangeEmail
        user={props.user}
        newEmail={props.newEmail}
        setNewEmail={props.setNewEmail}
        emailCode={props.emailCode}
        setEmailCode={props.setEmailCode}
        isEmailCodeSent={props.isEmailCodeSent}
        setIsEmailCodeSent={props.setIsEmailCodeSent}
        isRequestingEmail={props.isRequestingEmail}
        emailReqError={props.emailReqError}
        isVerifyingEmail={props.isVerifyingEmail}
        emailVerifyError={props.emailVerifyError}
        handleEmailRequest={props.handleEmailRequest}
        handleEmailVerify={props.handleEmailVerify}
      />

      <SecurityDeleteAccount
        deleteCode={props.deleteCode}
        setDeleteCode={props.setDeleteCode}
        isDeleteCodeSent={props.isDeleteCodeSent}
        setIsDeleteCodeSent={props.setIsDeleteCodeSent}
        isRequestingDeleteCode={props.isRequestingDeleteCode}
        deleteReqError={props.deleteReqError}
        isDeleting={props.isDeleting}
        deleteError={props.deleteError}
        performDeleteCodeReq={props.performDeleteCodeReq}
        handleDeleteAccount={props.handleDeleteAccount}
      />
    </div>
  );
};

SecurityTab.propTypes = {
  user: PropTypes.object,
  success: PropTypes.string,
  passwordCode: PropTypes.string,
  setPasswordCode: PropTypes.func,
  newPassword: PropTypes.string,
  setNewPassword: PropTypes.func,
  isPasswordCodeSent: PropTypes.bool,
  setIsPasswordCodeSent: PropTypes.func,
  isChangingPassword: PropTypes.bool,
  passwordError: PropTypes.string,
  isRequestingPassCode: PropTypes.bool,
  passReqError: PropTypes.string,
  performPassCodeReq: PropTypes.func,
  handlePasswordChange: PropTypes.func,
  newEmail: PropTypes.string,
  setNewEmail: PropTypes.func,
  emailCode: PropTypes.string,
  setEmailCode: PropTypes.func,
  isEmailCodeSent: PropTypes.bool,
  setIsEmailCodeSent: PropTypes.func,
  isRequestingEmail: PropTypes.bool,
  emailReqError: PropTypes.string,
  isVerifyingEmail: PropTypes.bool,
  emailVerifyError: PropTypes.string,
  handleEmailRequest: PropTypes.func,
  handleEmailVerify: PropTypes.func,
  deleteCode: PropTypes.string,
  setDeleteCode: PropTypes.func,
  isDeleteCodeSent: PropTypes.bool,
  setIsDeleteCodeSent: PropTypes.func,
  isRequestingDeleteCode: PropTypes.bool,
  deleteReqError: PropTypes.string,
  isDeleting: PropTypes.bool,
  deleteError: PropTypes.string,
  performDeleteCodeReq: PropTypes.func,
  handleDeleteAccount: PropTypes.func,
};

export default SecurityTab;
