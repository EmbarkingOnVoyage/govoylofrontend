import React, { useEffect } from "react";
import { useAuth } from "@workspace/ui";

// Wraps a page that needs a signed-in customer (booking, My Trips). A guest
// gets the sign-in modal over a short prompt instead of a redirect, so the
// URL — and whatever was being booked — is still there once they sign in.
// Booking pages pass allowGuest: the modal then also offers "Continue as
// guest", and a guest checkout session is enough to see them.
export const RequireAuth: React.FC<{ children: React.ReactNode; allowGuest?: boolean }> = ({ children, allowGuest = false }) => {
  const { isLoggedIn, isGuest, openLogin, openCheckoutLogin, closeModal } = useAuth();
  const allowed = isLoggedIn || (allowGuest && isGuest);
  const open = allowGuest ? openCheckoutLogin : openLogin;

  useEffect(() => {
    if (allowed) return;
    open();
    // Leaving the page (e.g. Back) without signing in shouldn't leave the
    // sign-in modal over whatever page comes next.
    return closeModal;
  }, [allowed, open, closeModal]);

  if (allowed) return <>{children}</>;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-[#182339]">
      <h1 className="text-xl font-semibold mb-2">{allowGuest ? "Log in or continue as guest" : "Sign in to continue"}</h1>
      <p className="text-sm text-[#4C5973] mb-6">
        {allowGuest
          ? "Log in to book with your saved travellers, or continue as a guest with your email and mobile number."
          : "You need to be signed in to view this page."}
      </p>
      <button
        type="button"
        onClick={() => open()}
        className="px-6 py-2.5 rounded-lg bg-[#7C1AEE] text-white font-medium hover:opacity-90"
      >
        {allowGuest ? "Continue" : "Log in / Sign up"}
      </button>
    </div>
  );
};
