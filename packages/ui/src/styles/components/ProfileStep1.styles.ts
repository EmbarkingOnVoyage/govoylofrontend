// packages/ui/src/components/ProfileStep1.styles.ts

export const profileStyles = {
  container: "min-h-screen bg-[#F4F4F6] font-sans antialiased text-[#1A1A1A]",
  navbar: "flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm",
  navLeft: "flex items-center space-x-8",
  logo: "h-8 text-[#5113A3] font-bold text-2xl tracking-wide",
  navLinks: "flex space-x-6 text-sm font-medium text-gray-600",
  navLink: "hover:text-[#5113A3] transition-colors cursor-pointer",
  navRight: "flex items-center space-x-6 text-xs text-gray-700 font-medium",
  
  heroBanner: "relative bg-gradient-to-r from-[#4E0E9C] to-[#701FD1] h-[220px] w-full overflow-hidden flex items-end px-12 pb-6",
  heroBackground: "absolute inset-0 opacity-20 bg-[url('https://unsplash.com')] bg-cover bg-center mix-blend-overlay",
  profileCard: "flex items-center space-x-4 bg-transparent z-10 translate-y-3",
  avatarWrapper: "relative w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden",
  avatarImg: "w-full h-full object-cover",
  progressBadge: "absolute bottom-0 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-700 px-2 py-0.5 rounded-full border border-gray-200 shadow-sm",
  profileMeta: "text-white mt-4",
  profileEmail: "flex items-center space-x-1 text-sm opacity-90",
  profilePhone: "flex items-center space-x-1 text-xs opacity-75 mt-1",
  verifiedIcon: "w-4 h-4 text-green-400 fill-current",

  mainLayout: "max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8",
  sidebar: "space-y-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm h-fit",
  sidebarItem: (isActive: boolean) => 
    `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
      isActive 
        ? "bg-[#F3EBFD] text-[#5113A3]" 
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`,

  contentArea: "md:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-8 relative",
  headerRow: "flex justify-between items-start mb-6",
  sectionTitle: "text-2xl font-bold text-gray-900",
  sectionSub: "text-xs text-gray-500 mt-1",
  saveBtn: "bg-[#7B2CBF] hover:bg-[#6923A3] text-white font-medium text-sm px-6 py-2.5 rounded-lg shadow-sm transition-all",

  // Outer wrapper: 3 equal columns on large screens. The form content
  // (gridForm below) only occupies the first 2 of those 3 columns, so the
  // 3rd stays intentionally blank as breathing room / a reserved future
  // panel. Collapses to a single full-width column below the lg breakpoint.
  sectionOuter: "grid grid-cols-1 lg:grid-cols-3 gap-x-5 mb-8",
  gridForm: "lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4",
  formHeading: "text-lg font-bold text-gray-900 border-t-2 border-gray-200 pt-4 mb-4 col-span-full",
  
  inputWrapper: "flex flex-col space-y-1.5",
  inputWrapperDouble: "flex flex-col space-y-1.5 lg:col-span-1 sm:col-span-2",
  label: "text-xs font-semibold text-gray-600",
  input: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#7B2CBF] focus:ring-1 focus:ring-[#7B2CBF] transition-all bg-white",
  select: "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#7B2CBF] focus:ring-1 focus:ring-[#7B2CBF] transition-all cursor-pointer",
  
  phoneGroup: "flex border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#7B2CBF] focus-within:ring-1 focus-within:ring-[#7B2CBF] bg-white transition-all",
  phoneLeft: "flex items-center gap-1.5 bg-gray-50 border-r border-gray-200 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors",
  phoneInput: "w-full px-3 py-2 text-sm text-gray-900 focus:outline-none",
  
  successWrapper: "relative flex items-center",
  successInput: "w-full border border-green-500 rounded-lg pl-3 pr-10 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white",
  successIcon: "absolute right-3 text-green-500 w-4 h-4",

  noticeText: "flex items-start gap-2 text-[11px] text-orange-700 font-medium mt-2 col-span-full bg-orange-50 border border-orange-200 rounded-lg px-3 py-2",
  checkboxRow: "flex items-center space-x-3 py-6 border-t-2 border-b-2 border-gray-200 mt-6",
  checkbox: "w-4 h-4 text-[#7B2CBF] border-gray-300 rounded focus:ring-[#7B2CBF] cursor-pointer",
  checkboxLabel: "text-xs font-medium text-gray-600 cursor-pointer"
};
