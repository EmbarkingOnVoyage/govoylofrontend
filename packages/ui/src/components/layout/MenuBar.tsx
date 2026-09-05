import React, { useState } from "react";
import { profileStyles as s } from "../../styles/components/ProfileStep1.styles";
import { useAuth } from "../../features/authentication/AuthContext";

interface MenuBarProps {
  onNavigate?: (rule: string) => void;
}
export const MenuBar: React.FC<MenuBarProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, openLogin, logout } = useAuth();

  const handleAction = (
    target: "LOGIN" | "PROFILE" | "BOOKINGS" | "SAVED" | "SIGNOUT",
  ) => {
    setIsOpen(false); // Close dropdown immediately on select

    if (target === "LOGIN") {
      openLogin();
      return;
    }

    if (!onNavigate) return;
    switch (target) {
      case "PROFILE":
        onNavigate("ON_NAVIGATE_TO_PROFILE");
        break;

      case "SIGNOUT":
        logout();
        onNavigate("ON_NAVIGATE_TO_SIGN_IN");
        break;

      default:
        console.log(`Action execution fallthrough on option item: ${target}`);
    }
  };

  return (
    <nav className={s.navbar}>
      <div className={s.navLeft}>
        <div className={s.logo}>govoylo</div>
        <div className={s.navLinks}>
          <span className={s.navLink}>Flight</span>
          <span className={s.navLink}>Hotel</span>
          <span className={s.navLink}>Cabs</span>
        </div>
      </div>
      <div className={`${s.navRight} relative`}>
        <span className="cursor-pointer flex items-center">🇺🇸 USD</span>
        <span className="cursor-pointer">Help & support</span>
        {!isLoggedIn && (
          <span
            className="cursor-pointer flex items-center space-x-1 hover:opacity-80 transition-opacity"
            onClick={() => handleAction("LOGIN")}>
            <span>👤</span>
            <span>Log in/Sign up</span>
          </span>
        )}
        {isLoggedIn && (
          <>
            <span
              className="cursor-pointer text-lg px-2 select-none hover:bg-gray-50 rounded-md transition-colors"
              onClick={() => setIsOpen(!isOpen)}>
              ☰
            </span>
            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl p-2 z-50 flex flex-col text-sm text-gray-700">
                <button
                  onClick={() => handleAction("PROFILE")}
                  className="flex items-center space-x-3 w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors font-medium">
                  <span className="text-gray-500">👤</span>
                  <span>My account</span>
                </button>
                <button
                  onClick={() => handleAction("BOOKINGS")}
                  className="flex items-center space-x-3 w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors font-medium">
                  <span className="text-gray-500">🧳</span>
                  <span>Bookings</span>
                </button>
                <button
                  onClick={() => handleAction("SAVED")}
                  className="flex items-center space-x-3 w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors font-medium">
                  <span className="text-gray-500">🤍</span>
                  <span>Saved</span>
                </button>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={() => handleAction("SIGNOUT")}
                  className="flex items-center space-x-3 w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors font-medium">
                  <span>🚪</span>
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
};
