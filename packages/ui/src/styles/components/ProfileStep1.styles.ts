// packages/ui/src/components/ProfileStep1.styles.ts
//
// Web Dev profile frames (Personal details, Co-Traveller, Customization
// preferences, Payment methods, Privacy & data management) at 1440:
// 236px banner inset 32px, then one 12px-radius card with a 275px menu,
// a 1px divider and the content column (343px fields, 2 columns 16px apart).

export const profileStyles = {
  container: "min-h-screen bg-[#F8F9FB] font-['Inter',sans-serif] antialiased text-[#182339]",
  navbar: "h-16 bg-white border-b border-gray-100 shadow-sm flex items-center",
  navInner: "flex items-center justify-between w-full max-w-7xl mx-auto px-6",
  navLeft: "flex items-center space-x-6",
  logo: "h-10 w-auto",
  navLinks: "flex space-x-4 text-[15px] font-medium text-[#182339]",
  navLink: "hover:text-[#5113A3] transition-colors cursor-pointer",
  navRight: "flex items-center space-x-3 text-[15px] text-[#182339] font-medium",

  // Banner: x 32–1408, y 64–300, 8px radius.
  pageInner: "max-w-[1440px] mx-auto px-8 pb-[30px]",
  heroBanner: "relative h-[236px] rounded-lg overflow-hidden bg-gradient-to-r from-[#6A16CB] to-[#350B65]",
  heroBackground: "absolute inset-0 bg-cover bg-center",
  heroInner: "absolute inset-0",
  profileCard: "absolute left-16 top-8",
  avatarWrapper: "relative w-[120px] h-[120px]",
  avatarImg: "absolute inset-[3px] w-[114px] h-[114px] rounded-full object-cover bg-white",
  avatarPlaceholder:
    "absolute inset-[3px] rounded-full flex items-center justify-center bg-[#F3E8FF] text-[#7C1AEE] text-[32px] font-bold uppercase",
  progressBadge:
    "absolute left-[37px] top-[89px] w-[45px] h-5 rounded-full bg-[#BFBFBF80] flex items-center justify-center text-[13px] leading-4 font-semibold text-black/50",
  // Email and phone, centred on x=165.6 like the design.
  // Centred on x=133.6 (16 + 235.2 / 2); a long email starts 16px in rather than clipping.
  profileMeta: "absolute top-[165px] left-4 w-[235.2px] flex flex-col items-[safe_center] gap-1 text-white",
  profileEmail: "flex items-center gap-[9px] text-[13px] leading-4 font-medium whitespace-nowrap",
  profilePhone: "flex items-center gap-[9px] text-[13px] leading-4 font-medium whitespace-nowrap",
  verifiedIcon: "w-4 h-4 rounded-full bg-[#007F20] text-white flex items-center justify-center shrink-0",

  // Card: x 35–1408 (Figma draws it to 1418), y 327, 919px tall.
  mainLayout:
    "mt-[27px] ml-[3px] min-h-[919px] flex rounded-xl border border-[#ECEEF3] bg-white overflow-hidden",
  sidebar: "w-[293px] shrink-0 pl-[18px] pt-[33px] border-r border-[#CCD3E0]",
  sidebarItem: (isActive: boolean) =>
    `w-[275px] h-[45px] flex items-center gap-2 pl-4 pb-[3px] border-b border-[#CCD3E0] text-[15px] leading-5 font-medium text-[#182339] cursor-pointer ${
      isActive ? "bg-[#ECEEF3]" : "hover:bg-[#F8F9FB]"
    }`,

  contentArea: "flex-1 min-w-0 pl-[18px] pr-1 pt-4 pb-3 relative",
  headerRow: "flex justify-between items-start pr-[66px] pb-[9px]",
  sectionDivider: "-mr-1 border-t border-[#CCD3E0]",
  subHeading: "text-[18px] leading-6 font-bold text-black",
  sectionTitle: "text-[24px] leading-[30px] font-bold text-black",
  sectionSub: "mt-[3.7px] text-[15px] leading-5 text-black",
  saveBtn:
    "mt-[5px] h-11 shrink-0 whitespace-nowrap px-[16.8px] rounded-xl bg-[#7C1AEE] hover:bg-[#6B17CC] text-white text-[15px] leading-5 font-medium disabled:opacity-60",
  cancelBtn: "mt-[5px] h-11 px-1 text-[#7C1AEE] hover:text-[#6B17CC] text-[15px] leading-5 font-medium",
  headerActions: "flex items-start gap-[33px]",

  // A section: divider, 18px heading, then the 343px two-column grid.
  sectionOuter: "pb-4",
  gridForm: "mt-[11.4px] grid grid-cols-[343px_343px] gap-x-4 gap-y-[15px]",
  formHeading: "-mr-1 border-t border-[#CCD3E0] pt-[17.7px] text-[18px] leading-6 font-bold text-black",

  inputWrapper: "flex flex-col gap-[5px]",
  inputWrapperDouble: "flex flex-col gap-[5px]",
  label: "text-[15px] leading-5 font-medium text-[#182339]",
  input:
    "w-full h-10 border border-[#ADB8CD] rounded-lg px-3 text-[16px] leading-5 text-[#182339] placeholder:text-[#697691] bg-white focus:outline-none focus:border-[#7C1AEE]",
  select:
    "gv-select w-full h-10 border border-[#ADB8CD] rounded-lg pl-3 pr-10 text-[16px] leading-5 text-[#697691] bg-white focus:outline-none focus:border-[#7C1AEE] cursor-pointer",

  phoneGroup: "flex gap-2",
  phoneLeft:
    "w-[123px] h-10 shrink-0 flex items-center gap-2 pl-3 pr-4 border border-[#ADB8CD] rounded-lg bg-white text-[16px] leading-5 text-[#182339] cursor-pointer",
  phoneInput:
    "w-full h-10 border border-[#ADB8CD] rounded-lg pl-3 pr-10 text-[16px] leading-5 text-[#182339] placeholder:text-[#697691] bg-white focus:outline-none focus:border-[#7C1AEE]",

  successWrapper: "relative flex items-center",
  successInput:
    "w-full h-10 border border-[#ADB8CD] rounded-lg pl-3 pr-10 text-[16px] leading-5 text-[#182339] placeholder:text-[#697691] bg-white focus:outline-none focus:border-[#7C1AEE]",
  successIcon: "absolute right-[15px] text-[#007F20] flex items-center",

  noticeText: "-mt-[3px] mb-[8.6px] text-[15px] leading-5 text-[#182339] col-span-full",
  checkboxRow: "-mr-1 h-[63px] pb-[5px] flex items-center gap-[10px] border-t border-b border-[#CCD3E0]",
  checkbox: "w-[17px] h-[17px] ml-[1.5px] rounded-[3px] accent-[#182339] cursor-pointer",
  checkboxLabel: "text-[15px] leading-5 text-[#182339] cursor-pointer",
};
