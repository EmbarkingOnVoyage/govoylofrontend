import React, { useState } from "react";
import { Menu, UserRound, Briefcase, Heart, LogOut, CircleUserRound } from "lucide-react";
import { useAuth } from "../../features/authentication/AuthContext";
import { useCustomerProfile } from "../../features/profile/useCustomerProfile";
import { AUTH_BASE_URL } from "@workspace/api";
import govoyloLogo from "../../assets/images/govoylo-logo.svg";

// India flag for the currency switch (Figma uses a flag image; an emoji flag
// doesn't render on Windows).
const IndiaFlag: React.FC = () => (
  <svg width="20" height="12" viewBox="0 0 30 18" aria-hidden="true" className="rounded-[2px] border border-[rgba(37,42,49,0.15)]">
    <rect width="30" height="6" fill="#FF9933" />
    <rect y="6" width="30" height="6" fill="#FFFFFF" />
    <rect y="12" width="30" height="6" fill="#138808" />
    <circle cx="15" cy="9" r="2.2" fill="none" stroke="#000080" strokeWidth="0.8" />
  </svg>
);

interface MenuBarProps {
  onNavigate?: (rule: string) => void;
  // The Flights / Hotels / Flights+Hotels links. The home page leaves them out
  // (its hero has the same tabs).
  showProductLinks?: boolean;
  // Extra content inside the white header block, below the top row — the
  // results page's search bar (Web Dev "NavigationBar").
  children?: React.ReactNode;
}

// Web Dev "NavigationBar (Desktop)": white, 12px/32px padding, soft shadow;
// a 44px row with the logo and product links on the left and currency,
// help, account and menu on the right (Inter 14–15px medium).
export const MenuBar: React.FC<MenuBarProps> = ({ onNavigate, showProductLinks = true, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, openLogin, logout } = useAuth();
  const { data: profile } = useCustomerProfile();

  const handleAction = (target: "LOGIN" | "PROFILE" | "BOOKINGS" | "SAVED" | "SIGNOUT" | "FLIGHTS") => {
    setIsOpen(false);

    if (target === "LOGIN") {
      openLogin();
      return;
    }

    if (!onNavigate) return;
    switch (target) {
      case "PROFILE":
        onNavigate("ON_NAVIGATE_TO_PROFILE");
        break;
      case "FLIGHTS":
        onNavigate("ON_NAVIGATE_TO_FLIGHTS");
        break;
      case "BOOKINGS":
        onNavigate("ON_NAVIGATE_TO_MY_TRIPS");
        break;
      case "SIGNOUT":
        logout();
        onNavigate("ON_NAVIGATE_TO_SIGN_IN");
        break;
      default:
        break;
    }
  };

  const initials = `${profile?.firstName?.[0] ?? ""}${profile?.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const menuItems = [
    { key: "PROFILE" as const, icon: UserRound, label: "My account" },
    { key: "BOOKINGS" as const, icon: Briefcase, label: "My Trips" },
    { key: "SAVED" as const, icon: Heart, label: "Saved" },
    { key: "SIGNOUT" as const, icon: LogOut, label: "Sign out" },
  ];

  return (
    <header className="relative z-30 bg-white shadow-[0px_2px_12px_rgba(27,50,73,0.08)] font-['Inter',sans-serif]">
      <div className="max-w-[1440px] mx-auto px-8 py-3 flex flex-col gap-4">
        <div className="h-11 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 min-w-0">
            <button type="button" onClick={() => handleAction("FLIGHTS")} aria-label="GoVoylo home" className="shrink-0">
              <img src={govoyloLogo} alt="goVoylo" className="h-10 w-auto" />
            </button>
            {showProductLinks && (
              <nav className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleAction("FLIGHTS")}
                  className="py-3 text-[15px] leading-5 font-medium text-[#7C1AEE]"
                >
                  Flights
                </button>
                <span className="py-3 text-[14px] leading-5 font-medium text-[#182339]">Hotels</span>
                <span className="py-3 text-[14px] leading-5 font-medium text-[#182339]">Flights+Hotels</span>
              </nav>
            )}
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 py-3 text-[14px] leading-5 font-medium text-[#182339]">
                <IndiaFlag />
                INR
              </span>
              <span className="py-3 text-[14px] leading-5 font-medium text-[#182339] cursor-pointer">Help &amp; support</span>
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-label="Account"
                  className="relative w-8 h-8 rounded-full bg-white"
                >
                  {profile?.profileImageUrl ? (
                    <img src={`${AUTH_BASE_URL}${profile.profileImageUrl}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-[#F3E8FF] text-[#7C1AEE] text-[12px] font-semibold flex items-center justify-center">
                      {initials}
                    </span>
                  )}
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#D21C1C]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAction("LOGIN")}
                  className="flex items-center gap-2 py-3 text-[14px] leading-5 font-medium text-[#182339]"
                >
                  <CircleUserRound size={20} strokeWidth={1.75} />
                  Log in/Sign up
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => (isLoggedIn ? setIsOpen(!isOpen) : handleAction("LOGIN"))}
              aria-label="Menu"
              className="w-11 h-11 p-3 rounded-[3px] text-[#182339] hover:bg-[#F8F9FB]"
            >
              <Menu size={20} strokeWidth={2} />
            </button>
            {isOpen && isLoggedIn && (
              <div className="absolute right-0 top-full mt-2 w-[194px] bg-white shadow-xl rounded-2xl p-2 z-50 flex flex-col text-[15px] font-medium text-[#182339]">
                {menuItems.map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleAction(key)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg"
                  >
                    <Icon size={20} strokeWidth={2} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {children}
      </div>
    </header>
  );
};
