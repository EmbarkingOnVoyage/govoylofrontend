import React, { useState } from "react";
import { Menu, UserRound, Briefcase, Heart, LogOut } from "lucide-react";
import { profileStyles as s } from "../../styles/components/ProfileStep1.styles";
import { useAuth } from "../../features/authentication/AuthContext";
import govoyloLogo from "../../assets/images/govoylo-logo.svg";

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
      <div className={s.navInner}>
      <div className={s.navLeft}>
        <img src={govoyloLogo} alt="goVoylo" className={s.logo} />
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
              className="cursor-pointer p-2.5 select-none hover:bg-gray-50 rounded-md transition-colors text-[#182339] flex items-center"
              onClick={() => setIsOpen(!isOpen)}>
              <Menu size={20} strokeWidth={2} />
            </span>
            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-[194px] bg-white shadow-xl rounded-2xl p-2 z-50 flex flex-col text-[15px] font-medium text-[#182339]">
                <button
                  onClick={() => handleAction("PROFILE")}
                  className="flex items-center space-x-3 w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <UserRound size={20} strokeWidth={2} />
                  <span>My account</span>
                </button>
                <button
                  onClick={() => handleAction("BOOKINGS")}
                  className="flex items-center space-x-3 w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <Briefcase size={20} strokeWidth={2} />
                  <span>Bookings</span>
                </button>
                <button
                  onClick={() => handleAction("SAVED")}
                  className="flex items-center space-x-3 w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <Heart size={20} strokeWidth={2} />
                  <span>Saved</span>
                </button>
                <button
                  onClick={() => handleAction("SIGNOUT")}
                  className="flex items-center space-x-3 w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <LogOut size={20} strokeWidth={2} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </nav>
  );
};
