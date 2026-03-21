/**
 * English dictionary — default language.
 * All keys are defined here; other locale files mirror this shape.
 */
const en = {
  // ─── Common / Shared ─────────────────────────────────────
  common: {
    appName: "Kraftalis",
    copyright: `© ${new Date().getFullYear()} Kraftalis. All rights reserved.`,
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    search: "Search",
    filter: "Filter",
    sortBy: "Sort by",
    or: "OR",
    comingSoon: "Coming Soon",
    tryAgain: "Try again",
    reload: "Reload",
  },

  // ─── Navigation / Sidebar ────────────────────────────────
  nav: {
    home: "Home",
    schedule: "Schedule",
    event: "Event",
    pricingPackage: "Pricing",
    settings: "Settings",
    main: "Main",
    other: "Other",
  },

  // ─── Topbar ──────────────────────────────────────────────
  topbar: {
    openSidebar: "Open sidebar",
    searchPlaceholder: "Search...",
    searchPlaceholderLong: "Search pages, events, clients...",
    startTyping: "Start typing to search...",
    noResults: "No results for",
    tryDifferent: "Try a different search term",
    navigate: "Navigate",
    select: "Select",
  },

  // ─── Notifications ───────────────────────────────────────
  notifications: {
    title: "Notifications",
    markAllRead: "Mark all read",
    noNotifications: "No notifications",
    allCaughtUp: "You're all caught up!",
    viewAll: "View all notifications",
    welcomeTitle: "Welcome to Kraftalis!",
    welcomeMessage: "Your account has been set up successfully.",
    completeProfileTitle: "Complete your profile",
    completeProfileMessage: "Add your business details to get started.",
    justNow: "Just now",
    minutesAgo: "{count} min ago",
  },

  // ─── Profile Dropdown ────────────────────────────────────
  profileDropdown: {
    userMenu: "User menu",
    myProfile: "My Profile",
    settings: "Settings",
    signOut: "Sign Out",
    user: "User",
  },

  // ─── Dashboard / Home ────────────────────────────────────
  dashboard: {
    title: "Dashboard",
    welcomeBack: "Welcome back",
    hereIsOverview: "Here's your overview.",
    generateReports: "Generate Reports",
    totalRevenue: "Total Revenue",
    totalEvents: "Total Events",
    totalClients: "Total Clients",
    upcomingEvents: "Upcoming Events",
    eventAnalytics: "Event Analytics",
    month: "Month",
    week: "Week",
    year: "Year",
    noEventData: "No event data yet",
    createFirstEvent: "Create your first event to see analytics here",
    clientDistribution: "Client Distribution",
    noClients: "No clients yet",
    clientsAfterBookings: "Clients will appear here after bookings",
    recentBookings: "Recent Bookings",
    no: "No",
    client: "Client",
    package: "Package",
    eventDate: "Event Date",
    status: "Status",
    amount: "Amount",
    actions: "Actions",
    noBookings: "No bookings yet",
    bookingsAppearHere: "When clients book your services, they'll appear here",
    quickActions: "Quick Actions",
    active: "Active",
    confirmed: "Confirmed",
    pending: "Pending",
    cancelled: "Cancelled",
    rescheduled: "Rescheduled",
    badgeVariants: "These are available badge variants for booking statuses.",

    // Revenue overview
    revenueOverview: "Revenue Overview",
    collected: "Collected",
    outstanding: "Outstanding",
    monthlyRevenue: "Monthly Revenue",
    noRevenueData: "No revenue data yet",
    noRevenueDesc: "Revenue will appear once payments are recorded.",

    // Event pipeline
    eventPipeline: "Event Pipeline",
    inquiry: "Inquiry",
    waitingPayment: "Waiting Payment",
    ongoing: "Ongoing",
    completed: "Completed",
    noEventsInPipeline: "No events in pipeline",
    noEventsInPipelineDesc: "Create events to see your pipeline here.",

    // Active offerings
    activeOfferingsCount: "Active Offerings",
    expiringSoon: "Expiring Soon",
    pendingBookings: "Pending Bookings",

    // Upcoming events
    nextEvent: "Next Event",
    daysAway: "days away",
    tomorrow: "Tomorrow",
    today: "Today",
    viewAll: "View All",
    noUpcomingEvents: "No upcoming events",
    noUpcomingEventsDesc: "Your schedule is clear for now.",

    // Financial summary
    financialSummary: "Financial Summary",
    paidAmount: "Paid",
    unpaidAmount: "Unpaid",
    dpPaidAmount: "DP Paid",
    conversionRate: "Conversion Rate",
    avgEventValue: "Avg. Event Value",
  },

  // ─── Profile Page ────────────────────────────────────────
  profile: {
    title: "My Profile",
    subtitle: "Manage your personal information and account settings.",
    profileUpdated: "Profile updated successfully!",
    changePhoto: "Change photo (coming soon)",
    joined: "Joined",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    emailAddress: "Email Address",
    enterFullName: "Enter your full name",
    emailCannotChange: "Email cannot be changed.",
    saveChanges: "Save Changes",
    verified: "Verified",
    notVerified: "Not verified",
    role: "Role",
    accountSecurity: "Account Security",
    password: "Password",
    passwordDesc: "Change your password to keep your account secure.",
    changePassword: "Change Password",
    twoFactor: "Two-Factor Authentication",
    twoFactorDesc: "Add an extra layer of security to your account.",
    dangerZone: "Danger Zone",
    deleteAccount: "Delete Account",
    deleteAccountDesc:
      "Permanently delete your account and all associated data. This action cannot be undone.",
  },

  // ─── Auth / Login ────────────────────────────────────────
  login: {
    signInTitle: "Sign in to your account",
    continueWithGoogle: "Continue with Google",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    signIn: "Sign in",
    signingIn: "Signing in…",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
  },

  // ─── Auth / Sign Up ─────────────────────────────────────
  signup: {
    createTitle: "Create your account",
    continueWithGoogle: "Continue with Google",
    fullName: "Full Name",
    namePlaceholder: "John Doe",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    passwordHint: "Must be at least 8 characters",
    confirmPassword: "Confirm Password",
    createAccount: "Create account",
    creatingAccount: "Creating account…",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign in",
  },

  // ─── Verify Email ────────────────────────────────────────
  verifyEmail: {
    pageTitle: "Verify Email — Kraftalis",
    pageDescription: "Verify your email address",
    emailVerified: "Email verified!",
    emailVerifiedDesc:
      "Your email has been verified successfully. You can now sign in to your account.",
    signInToAccount: "Sign in to your account",
    linkExpired: "Link expired",
    linkExpiredDesc:
      "This verification link has expired. Please sign up again to receive a new verification email.",
    signUpAgain: "Sign up again",
    invalidLink: "Invalid link",
    invalidLinkDesc:
      "This verification link is invalid or has already been used.",
  },

  // ─── Error Page ──────────────────────────────────────────
  error: {
    somethingWentWrong: "Something went wrong",
  },

  // ─── Event Page (Vendor) ─────────────────────────────────
  event: {
    title: "Events",
    subtitle: "Manage all your booking events.",
    createEvent: "Create Event",
    generateLink: "Generate Booking Link",
    searchPlaceholder: "Search client, event type...",
    allStatuses: "All Statuses",
    allPayments: "All Payments",
    noEvents: "No events yet",
    noEventsDesc: "Create an event or generate a booking link to get started.",
    noMatchingEvents: "No matching events",
    noMatchingEventsDesc: "Try adjusting your search or filters.",

    // Stats
    totalEvents: "Total Events",
    upcoming: "Upcoming",
    confirmed: "Confirmed",
    revenue: "Revenue",
    thisMonth: "this month",

    // View modes
    listView: "List",
    kanbanView: "Board",

    // Table columns
    colEventDate: "Event Date",
    colClientName: "Client Name",
    colEventType: "Event Type",
    colPackage: "Package",
    colPaymentStatus: "Payment",
    colEventStatus: "Status",
    colActions: "Actions",
    colAmount: "Amount",

    // Event statuses
    statusInquiry: "Inquiry",
    statusWaitingPayment: "Waiting Payment",
    statusConfirmed: "Confirmed",
    statusOngoing: "Ongoing",
    statusCompleted: "Completed",

    // Payment statuses
    paymentUnpaid: "Unpaid",
    paymentDpPaid: "DP Paid",
    paymentPaid: "Paid",

    // Actions
    view: "View",
    edit: "Edit",

    // Kanban
    kanbanNoEvents: "No events in this stage",
    kanbanDragHint: "Drag cards to move between stages",

    // Loading
    loading: "Loading events...",
    errorLoading: "Failed to load events.",
    retry: "Retry",
  },

  // ─── Active Offerings ────────────────────────────────────
  activeOfferings: {
    title: "Active Offerings",
    subtitle: "Booking links awaiting client payment",
    noOfferings: "No active offerings",
    noOfferingsDesc: "Pending booking links will appear here.",
    expiresIn: "Expires in",
    expired: "Expired",
    days: "days",
    hours: "hours",
    minutes: "min",
    copyLink: "Copy Link",
    copied: "Copied!",
    editOffer: "Edit Offering",
    deleteOffer: "Delete Offering",
    shareWhatsApp: "Share via WhatsApp",
    viewLink: "View Booking Page",
    packageLabel: "Package",
    addOnsLabel: "Add-ons",
    totalLabel: "Total",
    confirmDeleteTitle: "Click again to confirm delete",
    confirmDeleteDesc: "This action cannot be undone.",
    deleteLabel: "Delete",
    cancelLabel: "Cancel",
  },

  // ─── Event Detail Page ───────────────────────────────────
  eventDetail: {
    backToEvents: "Back to Events",
    clientInfo: "Client Information",
    clientName: "Full Name",
    clientPhone: "Phone Number",
    clientEmail: "Email",
    eventInfo: "Event Information",
    eventType: "Event Type",
    eventDate: "Event Date",
    eventTime: "Event Time",
    eventLocation: "Location",
    packageInfo: "Package",
    packageName: "Selected Package",
    addOns: "Add-ons",
    paymentInfo: "Payment",
    paymentStatus: "Payment Status",
    totalAmount: "Total Amount",
    dpAmount: "DP Amount",
    remainingBalance: "Remaining Balance",
    notes: "Notes",
    noNotes: "No additional notes.",
    editEvent: "Edit Event",
    updateStatus: "Update Status",
    saveChanges: "Save Changes",

    // Payment tracking
    paymentProgress: "Payment Progress",
    paidOf: "paid of",
    addPayment: "Add Payment",
    paymentRecords: "Payment Records",
    noPaymentsYet: "No payments recorded yet.",
    noPaymentsDesc: "Payments from your client will appear here.",
    receiptUploaded: "Receipt uploaded",
    noReceipt: "No receipt",
    verifyPayment: "Verify",
    rejectPayment: "Reject",
    paymentVerified: "Payment verified successfully!",
    paymentRejected: "Payment rejected.",
    viewReceipt: "View Receipt",
    amountLabel: "Amount",
    typeLabel: "Type",
    dateLabel: "Date",
    statusLabel: "Status",
    receiptLabel: "Receipt",
    actionLabel: "Action",
  },

  // ─── Generate Booking Link Modal ─────────────────────────
  bookingLink: {
    // Step 1 — configure
    configTitle: "Create Booking Link",
    editTitle: "Edit Booking Link",
    configDesc:
      "Optionally pre-fill a client name and select which package & add-ons to offer before sharing the link.",
    clientNameLabel: "Client Name (optional)",
    clientNamePlaceholder: "e.g. Budi Santoso",
    selectPackageLabel: "Package (optional)",
    noPackageOption: "Let client choose from all packages",
    selectVariationLabel: "Variation",
    customPackageLabel: "Or create a custom package for this client",
    customPackageName: "Custom Package Name",
    customPackageNamePlaceholder: "e.g. Custom Wedding Shoot",
    customVariationsTitle: "Variations / Price Tiers",
    customVariationHint: "Leave empty to use a flat price.",
    customFlatPrice: "Flat Price",
    addCustomVariation: "Add Variation",
    selectAddOnsLabel: "Add-ons to offer (optional)",
    generateButton: "Generate Link",
    generating: "Generating…",
    updateLink: "Update Booking Link",
    // Step 2 — result
    modalTitle: "Booking Link Ready",
    modalDesc:
      "Share this link with your client so they can fill in their booking details.",
    copyLink: "Copy Link",
    copied: "Copied!",
    shareWhatsApp: "Share via WhatsApp",
    linkExpiry: "This link expires in 7 days.",
  },

  // ─── Create Event Modal ──────────────────────────────────
  createEventModal: {
    title: "Create New Event",
    clientName: "Client Name",
    clientNamePlaceholder: "Enter client name",
    clientPhone: "Phone Number",
    clientPhonePlaceholder: "+62...",
    clientEmail: "Email (optional)",
    clientEmailPlaceholder: "client@example.com",
    eventType: "Event Type",
    selectEventType: "Select event type",
    eventDate: "Event Date",
    eventTime: "Event Time (optional)",
    eventLocation: "Location (optional)",
    eventLocationPlaceholder: "Event venue address",
    packageName: "Package (optional)",
    packagePlaceholder: "e.g. Gold Package",
    notes: "Notes (optional)",
    notesPlaceholder: "Any additional notes...",
    creating: "Creating...",
    create: "Create Event",
  },

  // ─── Public Booking Form ─────────────────────────────────
  booking: {
    pageTitle: "Book with",
    pageSubtitle: "Please fill in your booking details below.",

    // Sections
    clientInfoTitle: "Client Information",
    eventInfoTitle: "Event Information",
    packageTitle: "Package Selection",
    addOnsTitle: "Add-ons",
    notesTitle: "Additional Notes",
    paymentTitle: "Payments",
    eventStatusTitle: "Event Status",

    // Fields
    fullName: "Full Name",
    fullNamePlaceholder: "Your full name",
    phone: "Phone Number",
    phonePlaceholder: "+62...",
    email: "Email (optional)",
    emailPlaceholder: "you@example.com",
    eventType: "Event Type",
    selectEventType: "Select event type",
    eventDate: "Event Date",
    eventTime: "Event Time (optional)",
    eventLocation: "Event Location",
    eventLocationPlaceholder: "Where will the event take place?",
    packageSelect: "Package",
    selectPackage: "Select a package",
    addOns: "Add-ons",
    addOnsPlaceholder: "e.g. Extra hours, photo booth...",
    notesPlaceholder: "Any special requests or details...",

    // Event type options
    typeWedding: "Wedding",
    typeEngagement: "Engagement",
    typeBirthday: "Birthday",
    typeGraduation: "Graduation",
    typeCorporate: "Corporate Event",
    typeOther: "Other",

    // Submit
    submitting: "Submitting...",
    submitBooking: "Submit Booking",

    // Success
    successTitle: "Booking Request Sent!",
    successMessage:
      "Your booking request has been sent to the vendor. The vendor will contact you shortly to confirm your booking.",
    close: "Close",

    // Errors
    linkExpired: "This booking link has expired.",
    linkUsed: "This booking link has already been used.",
    linkInvalid: "This booking link is invalid.",
    goHome: "Go to homepage",

    // Client portal (persistent booking link)
    portalTitle: "Your Booking",
    portalSubtitle: "Track your booking status and payment progress.",
    statusTracker: "Status",
    packageDetails: "Package Details",
    selectedAddOns: "Selected Add-ons",
    paymentHistory: "Payment History",
    uploadReceipt: "Upload Payment Receipt",
    uploadReceiptDesc: "Upload your payment proof (transfer receipt).",
    paymentAmount: "Payment Amount",
    paymentType: "Payment Type",
    paymentNote: "Note (optional)",
    paymentNotePlaceholder: "e.g. DP transfer via BCA",
    selectFile: "Select file",
    noFileSelected: "No file selected",
    uploading: "Uploading...",
    submitPayment: "Submit Payment",
    paymentSubmitted:
      "Payment receipt submitted! Waiting for vendor verification.",
    noPayments: "No payments recorded yet.",
    verified: "Verified",
    pending: "Pending",
    dpPayment: "Down Payment",
    fullPayment: "Full Payment",
    installment: "Installment",
    totalAmount: "Total Amount",
    totalPaid: "Total Paid",
    remaining: "Remaining",
    qty: "Qty",
    perUnit: "/ unit",

    // Client portal — event home
    portalWelcome: "Welcome to your event portal",
    portalWelcomeDesc:
      "Track your event status, view details, and manage payments — all in one place.",
    portalEventDetails: "Event Details",
    portalYourPackage: "Your Package",
    portalYourAddOns: "Your Add-ons",
    portalPayments: "Payments",
    portalNoPackage: "No package selected yet.",
    portalNoAddOns: "No add-ons selected.",
    portalStatusStep: "Step {current} of {total}",
    portalContactVendor: "Contact Vendor",
    portalEventDate: "Event Date",
    portalEventTime: "Time",
    portalEventLocation: "Location",
    portalEventType: "Event Type",
    portalViewReceipt: "View",
    portalUploadReceipt: "Upload Payment Receipt",
    portalPaymentSent:
      "Payment receipt submitted! Waiting for vendor verification.",
    portalIncluded: "Included",

    // Booking form — package & payment step
    stepClientInfo: "Your Info",
    stepPackage: "Package",
    stepEvent: "Event",
    stepPayment: "Payment",
    selectPackageTitle: "Choose a Package",
    selectPackageDesc: "Select the package that best suits your event.",
    packageIncludes: "Includes:",
    selectedLabel: "Selected",
    selectLabel: "Select",
    selectVariation: "Choose a variation",
    variationRequired: "Please select a variation to continue.",
    addOnsOptional: "Add-ons (optional)",
    addOnsOptionalDesc: "Enhance your package with extra services.",
    perItem: "/ item",
    added: "Added",
    add: "Add",
    dpPaymentTitle: "Down Payment",
    dpPaymentDesc: "Pay the down payment to confirm your booking.",
    dpAmountLabel: "DP Amount",
    dpAmountPlaceholder: "Enter DP amount",
    minimumDp: "Minimum DP: {amount}",
    receiptUploadTitle: "Upload Payment Receipt",
    receiptUploadDesc: "Attach your transfer receipt as proof of payment.",
    receiptLabel: "Transfer Receipt",
    dragOrClick: "Click to select or drag a file here",
    acceptedFormats: "JPG, PNG or PDF (max 5MB)",
    changeFile: "Change file",
    orderSummary: "Order Summary",
    packageLabel: "Package",
    addOnsLabel: "Add-ons",
    dpLabel: "Down Payment",
    grandTotal: "Grand Total",
    free: "Free",

    // Single-view checkout
    checkoutSubtitle: "Review your booking details and confirm payment.",
    vendorLabel: "Vendor",
    editInfo: "Edit",
    cancelEdit: "Cancel",
    eventSummaryTitle: "Event Details",
    subtotalLabel: "Package Subtotal",
    addOnsTotalLabel: "Add-ons Subtotal",
    confirmAndPay: "Confirm & Pay",
    processing: "Processing...",
  },

  // ─── Pricing & Package Page (Vendor) ─────────────────────
  pricing: {
    title: "Pricing & Packages",
    subtitle:
      "Define your service packages and add-ons for clients to choose from.",

    // Packages section
    packagesTitle: "Packages",
    addPackage: "Add Package",
    editPackage: "Edit Package",
    noPackages: "No packages yet",
    noPackagesDesc: "Create your first package to show clients your offerings.",
    packageName: "Package Name",
    packageNamePlaceholder: "e.g. Wisuda Photoshoot, Gold Package",
    packageDescription: "Description (optional)",
    packageDescPlaceholder: "Brief description shown to clients",
    activePackage: "Active (visible to clients)",

    // Variations
    variationsTitle: "Price Variations",
    inclusionsTitle: "Includes",
    variationsHint:
      "Add variations if this package has different pricing tiers (e.g. by pax, duration, scope). Leave empty to use a single flat price.",
    addVariation: "Add Variation",
    variationLabel: "Variation Name",
    variationLabelPlaceholder: "e.g. 2 People – 1 Hour, Pengantin, 100 Pax",
    variationDescription: "Details (optional)",
    variationDescPlaceholder:
      "e.g. includes unlimited edits, soft file via GDrive",
    variationPrice: "Price",
    noVariations: "Single flat price",
    flatPrice: "Flat Price",
    flatPriceHint: "Used when no variations are defined.",
    currency: "Currency",

    // Add-ons section
    addOnsTitle: "Add-ons",
    addAddOn: "Add Add-on",
    editAddOn: "Edit Add-on",
    noAddOns: "No add-ons yet",
    noAddOnsDesc: "Create add-ons that clients can add to their bookings.",
    addOnName: "Add-on Name",
    addOnNamePlaceholder: "e.g. Extra 1 hour, Photo booth",
    addOnDescription: "Description (optional)",
    addOnDescPlaceholder: "Brief description",
    addOnPrice: "Price",
    activeAddOn: "Active (available for bookings)",

    // Table columns
    colName: "Name",
    colDescription: "Description",
    colPrice: "Price",
    colStatus: "Status",
    colActions: "Actions",

    // States
    active: "Active",
    archived: "Archived",
    confirmDelete: "Confirm?",
    startingFrom: "from",
  },

  // ─── Schedule Page ───────────────────────────────────────
  schedule: {
    title: "Schedule",
    subtitle: "View and manage your upcoming events on the calendar.",

    // View toggles
    calendarView: "Calendar",
    listView: "Agenda",

    // Quick actions
    createBooking: "Create Booking",

    // Calendar navigation
    today: "Today",
    previousMonth: "Previous month",
    nextMonth: "Next month",

    // Weekday headers (short)
    sun: "Sun",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",

    // Month names
    months:
      "January,February,March,April,May,June,July,August,September,October,November,December",

    // Day detail
    eventsOnDay: "Events on this day",
    noEventsOnDay: "No events on this day.",
    noUpcoming: "No upcoming events",
    noUpcomingDesc:
      "Your schedule is clear. Events will appear here once booked.",

    // Agenda list
    upcoming: "Upcoming",
    past: "Past",
    allEvents: "All Events",
    daysAway: "days away",
    daysAgo: "days ago",
    tomorrow: "Tomorrow",
    yesterday: "Yesterday",
  },

  // ─── Settings ────────────────────────────────────────────
  settings: {
    title: "Settings",
    subtitle: "Manage application settings and master data.",
    categoriesTitle: "Service Categories",
    categoriesSubtitle:
      "Manage service categories and subcategories for your packages.",
    addCategory: "Add Category",
    editCategory: "Edit Category",
    categoryName: "Category Name",
    categoryNamePlaceholder: "e.g. Photography",
    categoryDescription: "Description",
    categoryDescPlaceholder: "Brief description of this category",
    subcategories: "Subcategories",
    addSubcategory: "Add Subcategory",
    subcategoryName: "Subcategory Name",
    subcategoryNamePlaceholder: "e.g. Pre-Wedding",
    subcategoryDescription: "Description",
    subcategoryDescPlaceholder: "Brief description",
    noCategories: "No categories yet",
    noCategoriesDesc: "Create your first service category to get started.",
    noSubcategories: "No subcategories",
    noSubcategoriesDesc: "Add subcategories to organize your services.",
    confirmDeleteCategory: "Delete this category?",
    confirmDeleteSubcategory: "Delete?",
    active: "Active",
    archived: "Archived",
  },
};

/**
 * Recursive type that converts all leaf string values to `string`.
 */
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type Dictionary = DeepStringify<typeof en>;
export default en;
