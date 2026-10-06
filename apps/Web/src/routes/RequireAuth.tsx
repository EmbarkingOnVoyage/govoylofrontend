import React, { useEffect } from "react";
import { useAuth } from "@workspace/ui";

// Wraps a page that needs a signed-in customer (booking, My Trips). A guest
// gets the sign-in modal over a short prompt instead of a redirect, so the
// URL — and whatever was being booked — is still there once they sign in.
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, openLogin } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) openLogin();
  }, [isLoggedIn, openLogin]);

  if (isLoggedIn) return <>{children}</>;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-[#182339]">
      <h1 className="text-xl font-semibold mb-2">Sign in to continue</h1>
      <p className="text-sm text-[#4C5973] mb-6">You need to be signed in to view this page.</p>
      <button
        type="button"
        onClick={openLogin}
        className="px-6 py-2.5 rounded-lg bg-[#7C1AEE] text-white font-medium hover:opacity-90"
      >
        Log in / Sign up
      </button>
    </div>
  );
};
