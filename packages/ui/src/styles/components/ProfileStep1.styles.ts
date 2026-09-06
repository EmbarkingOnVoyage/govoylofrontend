// packages/ui/src/components/ProfileStep1.styles.ts

export const profileStyles = {
  container: "min-h-screen bg-[#F4F4F6] font-sans antialiased text-[#1A1A1A]",
  navbar: "h-16 bg-white border-b border-gray-100 shadow-sm flex items-center",
  // Shared with heroInner/mainLayout so the navbar, banner, and page content
  // below all line up on the same left/right edges at any viewport width —
  // a plain px-N on each section only coincidentally aligns them.
  navInner: "flex items-center justify-between w-full max-w-7xl mx-auto px-6",
  navLeft: "flex items-center space-x-6",
  logo: "h-10 w-auto",
  navLinks: "flex space-x-4 text-[15px] font-medium text-[#182339]",
  navLink: "hover:text-[#5113A3] transition-colors cursor-pointer",
  navRight: "flex items-center space-x-3 text-[15px] text-[#182339] font-medium",
  
  heroBanner: "relative bg-gradient-to-r from-[#6A16CB] to-[#350B65] h-[220px] w-full overflow-hidden",
  heroBackground: "absolute inset-0 bg-cover bg-center",
  heroInner: "relative z-10 max-w-7xl mx-auto px-6 h-full flex items-end pb-6",
  profileCard: "flex flex-col items-start bg-transparent",
  avatarWrapper: "relative w-[120px] h-[120px] rounded-full border-4 border-white bg-white shadow-md overflow-hidden",
  avatarImg: "w-full h-full object-cover",
  avatarPlaceholder: "w-full h-full flex items-center justify-center bg-[#7B2CBF] text-white text-2xl font-bold uppercase",
  progressBadge: "absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[13px] font-bold text-black/50",
  profileMeta: "text-white mt-3",
  profileEmail: "flex items-center space-x-2 text-[13px] font-normal text-white",
  profilePhone: "flex items-center space-x-2 text-[13px] font-normal text-white mt-1",
  verifiedIcon: "w-4 h-4 text-green-400 fill-current",

  mainLayout: "max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8",
  sidebar: "space-y-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm h-fit",
  sidebarItem: (isActive: boolean) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg text-[15px] font-medium text-[#182339] transition-colors cursor-pointer ${
      isActive
        ? "bg-[#ECEEF3]"
        : "hover:bg-gray-50"
    }`,

  contentArea: "md:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-8 relative min-h-[70vh]",
  headerRow: "flex justify-between items-start mb-1",
  sectionDivider: "border-t-2 border-gray-200",
  // Same typography as formHeading, without its own top border/divider —
  // for sub-headings that sit under a divider that's already been drawn.
  subHeading: "text-lg font-bold text-black",
  sectionTitle: "text-2xl font-bold text-black",
  sectionSub: "text-md text-gray-500 mt-1",
  saveBtn: "bg-[#7C1AEE] hover:bg-[#6B17CC] text-white font-medium text-[15px] px-6 py-2.5 rounded-lg shadow-sm transition-all",
  cancelBtn: "text-[#7C1AEE] hover:text-[#6B17CC] font-medium text-sm px-2 transition-all",
  headerActions: "flex items-center gap-4",

  // Outer wrapper: 3 equal columns on large screens. The form content
  // (gridForm below) only occupies the first 2 of those 3 columns, so the
  // 3rd stays intentionally blank as breathing room / a reserved future
  // panel. Collapses to a single full-width column below the lg breakpoint.
  sectionOuter: "grid grid-cols-1 lg:grid-cols-3 gap-x-5 mb-8",
  gridForm: "lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4",
  formHeading: "text-lg font-bold text-black border-t-2 border-gray-200 pt-4 mb-4 col-span-full",

  inputWrapper: "flex flex-col space-y-1.5",
  inputWrapperDouble: "flex flex-col space-y-1.5 lg:col-span-1 sm:col-span-2",
  label: "text-[15px] font-medium text-[#182339]",
  input: "w-full border border-[#ADB8CD] rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#7C1AEE] focus:ring-1 focus:ring-[#7C1AEE] transition-all bg-white",
  select: "w-full border border-[#ADB8CD] rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#7C1AEE] focus:ring-1 focus:ring-[#7C1AEE] transition-all cursor-pointer",

  phoneGroup: "flex border border-[#ADB8CD] rounded-lg overflow-hidden focus-within:border-[#7C1AEE] focus-within:ring-1 focus-within:ring-[#7C1AEE] bg-white transition-all",
  phoneLeft: "flex items-center gap-1.5 bg-gray-50 border-r border-gray-200 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors",
  phoneInput: "w-full px-3 py-2 text-sm text-gray-900 focus:outline-none",
  
  successWrapper: "relative flex items-center",
  successInput: "w-full border border-green-500 rounded-lg pl-3 pr-10 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white",
  successIcon: "absolute right-3 text-green-500 w-4 h-4",

  noticeText: "text-[15px] text-gray-600 font-medium mt-2 col-span-full",
  checkboxRow: "flex items-center space-x-3 py-6 border-t-2 border-b-2 border-gray-200 mt-6",
  checkbox: "w-4 h-4 text-[#7C1AEE] border-[#ADB8CD] rounded focus:ring-[#7C1AEE] cursor-pointer",
  checkboxLabel: "text-[15px] font-medium text-[#182339] cursor-pointer"
};
