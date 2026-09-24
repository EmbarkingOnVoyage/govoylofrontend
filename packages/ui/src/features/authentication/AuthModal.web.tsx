import React from "react";
import { useAuth } from "./AuthContext";
import { LoginFeature } from "./LoginFeature.web";
import { OtpFeature } from "./OtpFeature.web";
import { LoginWebStyles as s } from "@workspace/ui";

export const AuthModal: React.FC = () => {
  const { isModalOpen, modalStep, closeModal, goToOtpStep, backToSignIn } = useAuth();

  if (!isModalOpen) return null;

  const handleRule = (rule: string) => {
    switch (rule) {
      case "ON_SUBMIT_SUCCESS":
        goToOtpStep();
        break;
      case "ON_BACK_TO_LOGIN":
        backToSignIn();
        break;
      case "ON_OTP_VERIFIED":
        // authContextCache.setSession(...) + AuthContext's isLoggedIn have already
        // been updated inside OtpFeature's verifyMutation via useAuth().login(...) —
        // this rule just needs to dismiss the overlay.
        closeModal();
        break;
      default:
        break;
    }
  };

  return (
    <div className={s.backdrop} onClick={closeModal}>
      <div onClick={(e) => e.stopPropagation()}>
        {modalStep === "signin" ? (
          <LoginFeature variant="modal" onNavigate={handleRule} onCloseModal={closeModal} />
        ) : (
          <OtpFeature variant="modal" onNavigate={handleRule} onCloseModal={closeModal} />
        )}
      </div>
    </div>
  );
};
