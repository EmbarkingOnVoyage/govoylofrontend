import React, { useState } from "react";
import { UserRound, Briefcase, Heart, LogOut } from "lucide-react";
import { useAuth } from "../../features/authentication/AuthContext";
import { useCustomerProfile } from "../../features/profile/useCustomerProfile";
import { AUTH_BASE_URL } from "@workspace/api";
import govoyloLogo from "../../assets/images/govoylo-logo.svg";
import { showComingSoon } from "../comingSoon.web";

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

// Web Dev header icons, lifted from the Figma export (20px boxes): the filled
// account glyph and the 1.67px hamburger.
const AccountIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="1228 22 20 20" aria-hidden="true">
    <path fill="#182339" fillRule="evenodd" d="M1229.78 33.4121C1228.86 27.7639 1233.76 22.8633 1239.41 23.777C1242.82 24.3584 1245.64 27.1825 1246.22 30.588C1247.14 36.2361 1242.24 41.1368 1236.59 40.2231C1233.1 39.6416 1230.36 36.8176 1229.78 33.4121ZM1237.92 37.8143H1238.17C1240.16 37.7312 1241.82 36.7345 1242.9 35.2394C1242.07 34.8241 1241.24 34.4919 1240.33 34.1596L1239.91 33.9935C1239.74 33.9104 1239.58 33.6612 1239.58 33.4951C1239.5 33.0798 1239.5 32.6645 1239.74 32.3323C1240.24 31.7508 1240.82 31.0033 1240.82 29.0929V28.7606C1240.82 27.3486 1239.58 26.1857 1238.08 26.1857H1237.67C1236.17 26.3519 1235.18 27.5978 1235.18 29.0929C1235.18 31.0033 1235.67 31.7508 1236.26 32.3323C1236.5 32.6645 1236.5 33.0798 1236.42 33.4951C1236.42 33.7443 1236.26 33.9104 1236.09 33.9935L1235.67 34.1596C1235.49 34.2326 1235.31 34.3055 1235.12 34.3793C1234.45 34.6417 1233.75 34.9153 1233.1 35.2394C1234.1 36.8176 1235.92 37.8143 1237.92 37.8143Z" />
  </svg>
);

const MenuIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="#182339">
    <rect x="1.67" y="4.17" width="16.66" height="1.67" rx="0.83" />
    <rect x="1.67" y="9.17" width="16.66" height="1.67" rx="0.83" />
    <rect x="1.67" y="14.17" width="16.66" height="1.67" rx="0.83" />
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
// 64px tall — a 40px row with the logo and product links on the left and currency,
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
      case "SAVED":
        showComingSoon("Saved trips");
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
      <div className="max-w-[1440px] mx-auto px-8 py-3 flex flex-col gap-5">
        <div className="h-10 flex items-center justify-between gap-6">
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
                <button
                  type="button"
                  onClick={() => showComingSoon("Hotels")}
                  className="py-3 text-[14px] leading-5 font-medium text-[#182339]"
                >
                  Hotels
                </button>
                <button
                  type="button"
                  onClick={() => showComingSoon("Flights + Hotels")}
                  className="py-3 text-[14px] leading-5 font-medium text-[#182339]"
                >
                  Flights+Hotels
                </button>
              </nav>
            )}
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => showComingSoon("Other currencies")}
                className="flex items-center gap-2 py-3 text-[14px] leading-5 font-medium text-[#182339]"
              >
                <IndiaFlag />
                INR
              </button>
              <button
                type="button"
                onClick={() => showComingSoon("Help & support")}
                className="py-3 text-[14px] leading-5 font-medium text-[#182339]"
              >
                Help &amp; support
              </button>
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
                  <AccountIcon />
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
              <MenuIcon />
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
