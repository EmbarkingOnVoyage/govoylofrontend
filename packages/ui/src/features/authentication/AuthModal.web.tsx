import React from "react";
import { useAuth } from "./AuthContext";
import { LoginFeature } from "./LoginFeature.web";
import { OtpFeature } from "./OtpFeature.web";
import { GuestCheckoutFeature } from "./GuestCheckoutFeature.web";
import { LoginWebStyles as s } from "@workspace/ui";

export const AuthModal: React.FC = () => {
  const { isModalOpen, modalStep, allowGuest, closeModal, goToOtpStep, backToSignIn, goToGuestStep, enterGuest } = useAuth();

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
      <div className="w-full max-w-[440px]" onClick={(e) => e.stopPropagation()}>
        {modalStep === "signin" ? (
          <LoginFeature
            variant="modal"
            onNavigate={handleRule}
            onCloseModal={closeModal}
            onContinueAsGuest={allowGuest ? goToGuestStep : undefined}
          />
        ) : modalStep === "guest" ? (
          <GuestCheckoutFeature
            onStarted={() => {
              enterGuest();
              closeModal();
            }}
            onSignIn={backToSignIn}
            onCloseModal={closeModal}
          />
        ) : (
          <OtpFeature variant="modal" onNavigate={handleRule} onCloseModal={closeModal} />
        )}
      </div>
    </div>
  );
};
