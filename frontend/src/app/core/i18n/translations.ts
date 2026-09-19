export interface TranslationDictionary {
  // Brand
  BRAND_NAME: string;
  BRAND_NAME_AR: string;
  BRAND_TAGLINE: string;
  
  // Navigation
  NAV_RESOURCES: string;
  NAV_REQUESTS: string;
  NAV_HOW_IT_WORKS: string;
  NAV_ABOUT: string;
  NAV_LOGIN: string;
  NAV_REGISTER: string;
  NAV_DASHBOARD: string;
  NAV_PROFILE: string;
  NAV_MY_RESOURCES: string;
  NAV_MY_REQUESTS: string;
  NAV_MATCHES: string;
  NAV_CONTRIBUTIONS: string;
  NAV_NOTIFICATIONS: string;
  NAV_ORG_DASHBOARD: string;
  NAV_ADMIN: string;
  NAV_LOGOUT: string;
  LANG_TOGGLE: string;
  
  // Landing Page
  HERO_PILL: string;
  HERO_TITLE_1: string;
  HERO_TITLE_HIGHLIGHT: string;
  HERO_TITLE_2: string;
  HERO_SUBTITLE: string;
  HERO_CTA_BROWSE: string;
  HERO_CTA_OFFER: string;
  HERO_STAT_TRANSFERS: string;
  HERO_REDISTRIBUTION_RATE: string;
  HERO_FULFILLED: string;
  HERO_UNITS_COUNT: string;
  HERO_UNITS_LABEL: string;
  HERO_UNITS_DESC: string;
  HERO_ACTIVE_AREAS: string;
  LOOP_TITLE: string;
  LOOP_SUBTITLE: string;
  LOOP_STEP1_TITLE: string;
  LOOP_STEP1_DESC: string;
  LOOP_STEP2_TITLE: string;
  LOOP_STEP2_DESC: string;
  LOOP_STEP3_TITLE: string;
  LOOP_STEP3_DESC: string;
  LOOP_STEP4_TITLE: string;
  LOOP_STEP4_DESC: string;
  
  // Auth
  LOGIN_TITLE: string;
  LOGIN_SUBTITLE: string;
  EMAIL_LABEL: string;
  PASSWORD_LABEL: string;
  REMEMBER_ME: string;
  FORGOT_PASSWORD: string;
  SIGN_IN_BTN: string;
  DONT_HAVE_ACCOUNT: string;
  CREATE_ACCOUNT_LINK: string;
  DEMO_ACCOUNTS: string;
  DEMO_PROVIDER: string;
  DEMO_ORG: string;
  DEMO_ADMIN: string;
  
  // Forgot Password
  FORGOT_TITLE: string;
  FORGOT_SUBTITLE: string;
  SEND_RESET_LINK_BTN: string;
  BACK_TO_LOGIN: string;
  FORGOT_SUCCESS_TITLE: string;
  FORGOT_SUCCESS_DESC: string;
  TRY_ANOTHER_EMAIL: string;

  // Reset Password
  RESET_TITLE: string;
  RESET_SUBTITLE: string;
  NEW_PASSWORD_LABEL: string;
  CONFIRM_PASSWORD_LABEL: string;
  RESET_PASSWORD_BTN: string;
  RESET_SUCCESS_TITLE: string;
  RESET_SUCCESS_DESC: string;
  RESET_INVALID_TOKEN: string;

  // Change Password
  CHANGE_PASSWORD_TITLE: string;
  CURRENT_PASSWORD_LABEL: string;
  UPDATE_PASSWORD_BTN: string;
  PASSWORD_CHANGED_SUCCESS: string;
  
  // Register
  REGISTER_TITLE: string;
  REGISTER_SUBTITLE: string;
  ROLE_INDIVIDUAL: string;
  ROLE_ORGANIZATION: string;
  NAME_LABEL_USER: string;
  NAME_LABEL_ORG: string;
  PHONE_LABEL: string;
  SIGN_UP_BTN: string;
  ALREADY_HAVE_ACCOUNT: string;
  SIGN_IN_LINK: string;
  
  // Footer
  FOOTER_DESC: string;
  FOOTER_LINKS_HEADER: string;
  FOOTER_ORGS_HEADER: string;
  FOOTER_COPYRIGHT: string;

  // Admin Console
  ADMIN_TITLE: string;
  ADMIN_CONSOLE_VERSION: string;
  ADMIN_BACK_TO_APP: string;
  ADMIN_SIGN_OUT: string;
  ADMIN_CONTROL_MONITORING: string;
  ADMIN_NAV_DASHBOARD: string;
  ADMIN_NAV_USERS: string;
  ADMIN_NAV_ORGANIZATIONS: string;
  ADMIN_NAV_RESOURCES: string;
  ADMIN_NAV_REQUESTS: string;
  ADMIN_NAV_REPORTS: string;
  ADMIN_NAV_CATEGORIES: string;
  ADMIN_MOBILE_NAV_TITLE: string;
  ADMIN_USERS_TITLE: string;
  ADMIN_USERS_SUBTITLE: string;
  ADMIN_ORGS_TITLE: string;
  ADMIN_ORGS_SUBTITLE: string;
  ADMIN_SEARCH_USERS_PLACEHOLDER: string;
  ADMIN_FILTER_ALL: string;
  ADMIN_FILTER_PENDING: string;
  ADMIN_FILTER_VERIFIED: string;
  ADMIN_RETRY: string;
  ADMIN_NO_USERS: string;
  ADMIN_NO_ORGS: string;
  URGENCY_HIGH: string;
  URGENCY_MEDIUM: string;
  URGENCY_LOW: string;
}

export const translations: Record<'ar' | 'en', TranslationDictionary> = {
  ar: {
    BRAND_NAME: 'Dawwarha',
    BRAND_NAME_AR: 'دَوَّرها',
    BRAND_TAGLINE: 'منصة تدوير وتوزيع الموارد الحضرية',
    
    NAV_RESOURCES: 'تصفح الموارد',
    NAV_REQUESTS: 'تصفح الطلبات',
    NAV_HOW_IT_WORKS: 'كيف تعمل المنصة',
    NAV_ABOUT: 'عن دوّرها',
    NAV_LOGIN: 'تسجيل الدخول',
    NAV_REGISTER: 'إنشاء حساب',
    NAV_DASHBOARD: 'لوحة التحكم',
    NAV_PROFILE: 'الملف الشخصي',
    NAV_MY_RESOURCES: 'مواردي المعروضة',
    NAV_MY_REQUESTS: 'طلباتي',
    NAV_MATCHES: 'المطابقات الذكية',
    NAV_CONTRIBUTIONS: 'الأثر والمساهمات',
    NAV_NOTIFICATIONS: 'التنبيهات',
    NAV_ORG_DASHBOARD: 'لوحة المنظمة',
    NAV_ADMIN: 'لوحة الإدارة العامة',
    NAV_LOGOUT: 'تسجيل الخروج',
    LANG_TOGGLE: 'English',
    
    HERO_PILL: 'بنية تحتية لتنسيق وإعادة توزيع الموارد الحضرية',
    HERO_TITLE_1: 'الفائض لديك، هو',
    HERO_TITLE_HIGHLIGHT: 'حاجة حقيقية لغيرك',
    HERO_TITLE_2: 'في نفس الحي.',
    HERO_SUBTITLE: 'أجهزة طبية، مستلزمات تعليمية، أثاث ومعدات مكتبية، ووجبات صالحة تظل غير مستغلة لا لعدم الحاجة إليها، بل بسبب انفصال العرض عن الطلب. دوّرها تمد جسراً ذكياً بين المتبرعين والجمعيات المعتمدة عبر مطابقة جغرافية موثوقة وتسليم ثنائي مؤكد.',
    HERO_CTA_BROWSE: 'تصفح الموارد المتاحة',
    HERO_CTA_OFFER: 'أعرض فائضاً للمجتمع',
    HERO_STAT_TRANSFERS: 'أكثر من 1,400 عملية تسليم مؤكدة عبر القاهرة والجيزة',
    HERO_REDISTRIBUTION_RATE: 'معدل إعادة التوزيع النشط',
    HERO_FULFILLED: '98.4% مكتمل',
    HERO_UNITS_COUNT: '3,840',
    HERO_UNITS_LABEL: 'عنصر ومورد مجتمعي',
    HERO_UNITS_DESC: 'سجل شفاف بدون فاقد. كل عملية تتضمن مطابقة جغرافية، وتأكيداً ثنائياً من الطرفين قبل إغلاق الطلب وتوثيق الأثر.',
    HERO_ACTIVE_AREAS: 'المناطق النشطة: المعادي · الدقي · مدينة نصر · الجيزة',
    LOOP_TITLE: 'كيف تعمل منصة دَوَّرها؟',
    LOOP_SUBTITLE: 'دورة التدوير الموثقة',
    LOOP_STEP1_TITLE: 'عرض المورد الفائض',
    LOOP_STEP1_DESC: 'يقوم المانح أو المؤسسة بتسجيل المورد، وتحديد التصنيف والكمية والموقع الجغرافي ونافذة الاستلام المتاحة.',
    LOOP_STEP2_TITLE: 'تسجيل طلب الاحتياج',
    LOOP_STEP2_DESC: 'تحدد الجمعيات الموثقة أو الأفراد احتياجاتهم المحددة مع درجة الإلحاح لتلبية متطلبات المستفيدين الحقيقيين.',
    LOOP_STEP3_TITLE: 'المطابقة المفسّرة',
    LOOP_STEP3_DESC: 'يقوم النظام بحساب نسبة التوافق بناءً على 5 معايير واضحة ومعلنة: التصنيف، الموقع، الكمية، الإلحاح، والإتاحة.',
    LOOP_STEP4_TITLE: 'التأكيد الثنائي والأثر',
    LOOP_STEP4_DESC: 'لا تُعتبر المعاملة منتهية إلا بعد تأكيد التسليم من المانح والاستلام من المستفيد، ليُسجل الأثر في السجل المجتمعي.',
    
    LOGIN_TITLE: 'تسجيل الدخول إلى دَوَّرها',
    LOGIN_SUBTITLE: 'أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك وإدارة الموارد والطلبات.',
    EMAIL_LABEL: 'البريد الإلكتروني',
    PASSWORD_LABEL: 'كلمة المرور',
    REMEMBER_ME: 'تذكرني على هذا الجهاز',
    FORGOT_PASSWORD: 'نسيت كلمة المرور؟',
    SIGN_IN_BTN: 'تسجيل الدخول',
    DONT_HAVE_ACCOUNT: 'ليس لديك حساب بعد؟',
    CREATE_ACCOUNT_LINK: 'إنشاء حساب جديد',
    DEMO_ACCOUNTS: 'حسابات تجريبية سريعة للمعاينة:',
    DEMO_PROVIDER: 'مانح (Provider)',
    DEMO_ORG: 'جمعية (Org)',
    DEMO_ADMIN: 'مشرف (Admin)',
    
    // Forgot Password
    FORGOT_TITLE: 'نسيت كلمة المرور؟',
    FORGOT_SUBTITLE: 'أدخل بريدك الإلكتروني المسجل في دَوَّرها وسنرسل لك رابطاً آمناً لتعيين كلمة مرور جديدة.',
    SEND_RESET_LINK_BTN: 'إرسال رابط الاستعادة',
    BACK_TO_LOGIN: 'العودة لتسجيل الدخول',
    FORGOT_SUCCESS_TITLE: 'تم إرسال تعليمات الاستعادة',
    FORGOT_SUCCESS_DESC: 'إذا كان البريد الإلكتروني مسجلاً لدينا، ستتلقى رابطاً صالحاً لمدة 15 دقيقة لتعيين كلمة المرور.',
    TRY_ANOTHER_EMAIL: 'تجربة بريد إلكتروني آخر',

    // Reset Password
    RESET_TITLE: 'تعيين كلمة المرور الجديدة',
    RESET_SUBTITLE: 'يرجى إدخال وتأكيد كلمة المرور الجديدة لحسابك.',
    NEW_PASSWORD_LABEL: 'كلمة المرور الجديدة',
    CONFIRM_PASSWORD_LABEL: 'تأكيد كلمة المرور الجديدة',
    RESET_PASSWORD_BTN: 'تحديث كلمة المرور',
    RESET_SUCCESS_TITLE: 'تم تغيير كلمة المرور بنجاح',
    RESET_SUCCESS_DESC: 'تم تحديث كلمة المرور الخاصة بك. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.',
    RESET_INVALID_TOKEN: 'رابط استعادة كلمة المرور غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.',

    // Change Password
    CHANGE_PASSWORD_TITLE: 'تغيير كلمة المرور',
    CURRENT_PASSWORD_LABEL: 'كلمة المرور الحالية',
    UPDATE_PASSWORD_BTN: 'حفظ كلمة المرور الجديدة',
    PASSWORD_CHANGED_SUCCESS: 'تم تحديث كلمة المرور بنجاح.',
    
    REGISTER_TITLE: 'إنشاء حساب في دَوَّرها',
    REGISTER_SUBTITLE: 'انضم إلى شبكة إعادة توزيع الموارد الحضرية — اعرض فائضاً أو سجّل احتياجات المجتمع.',
    ROLE_INDIVIDUAL: 'فرد (مانح / مستفيد)',
    ROLE_ORGANIZATION: 'منظمة مجتمع مدني / جمعية',
    NAME_LABEL_USER: 'الاسم الكامل',
    NAME_LABEL_ORG: 'اسم ممثل المنظمة',
    PHONE_LABEL: 'رقم الهاتف',
    SIGN_UP_BTN: 'إنشاء الحساب',
    ALREADY_HAVE_ACCOUNT: 'لديك حساب بالفعل؟',
    SIGN_IN_LINK: 'تسجيل الدخول',
    
    FOOTER_DESC: 'منصة رقمية موثوقة لإعادة توجيه وتدوير الموارد الفائضة والأجهزة والمستلزمات إلى الفئات الأكثر احتياجاً والجمعيات الأهلية، بنظام مطابق ذكي وتوثيق تسليم ثنائي.',
    FOOTER_LINKS_HEADER: 'روابط هامة',
    FOOTER_ORGS_HEADER: 'الجمعيات والمنظمات',
    FOOTER_COPYRIGHT: '© 2026 دَوَّرها (Dawwarha). مشروع تخرج NTI - جميع الحقوق محفوظة.',

    ADMIN_TITLE: 'دَوَّرها · العمليات الإدارية',
    ADMIN_CONSOLE_VERSION: 'الإصدار 1.0',
    ADMIN_BACK_TO_APP: 'العودة للمنصة',
    ADMIN_SIGN_OUT: 'تسجيل الخروج',
    ADMIN_CONTROL_MONITORING: 'التحكم والمتابعة',
    ADMIN_NAV_DASHBOARD: 'لوحة المؤشرات والتحليلات',
    ADMIN_NAV_USERS: 'المستخدمون والحسابات',
    ADMIN_NAV_ORGANIZATIONS: 'المنظمات والتوثيق',
    ADMIN_NAV_RESOURCES: 'الموارد المعروضة',
    ADMIN_NAV_REQUESTS: 'طلبات الاحتياج',
    ADMIN_NAV_REPORTS: 'البلاغات والرقابة',
    ADMIN_NAV_CATEGORIES: 'إدارة التصنيفات',
    ADMIN_MOBILE_NAV_TITLE: 'قائمة الإدارة',
    ADMIN_USERS_TITLE: 'إدارة المستخدمين والحسابات',
    ADMIN_USERS_SUBTITLE: 'عرض وإدارة أدوار المستخدمين والمنظمات، وتعليق الحسابات المخالفة.',
    ADMIN_ORGS_TITLE: 'قائمة توثيق واعتماد المنظمات',
    ADMIN_ORGS_SUBTITLE: 'فحص وثائق التسجيل الرسمية وشهادات الإشهار لمنح شارة التوثيق المعتمدة.',
    ADMIN_SEARCH_USERS_PLACEHOLDER: 'البحث بالاسم أو البريد الإلكتروني...',
    ADMIN_FILTER_ALL: 'الكل',
    ADMIN_FILTER_PENDING: 'قيد المراجعة',
    ADMIN_FILTER_VERIFIED: 'موثقة',
    ADMIN_RETRY: 'إعادة المحاولة',
    ADMIN_NO_USERS: 'لم يتم العثور على مستخدمين يطابقون معايير البحث.',
    ADMIN_NO_ORGS: 'لا توجد منظمات تطابق التصفية الحالية.',
    URGENCY_HIGH: 'أولوية قصوى',
    URGENCY_MEDIUM: 'أولوية متوسطة',
    URGENCY_LOW: 'أولوية عادية'
  },
  en: {
    BRAND_NAME: 'Dawwarha',
    BRAND_NAME_AR: 'دَوَّرها',
    BRAND_TAGLINE: 'Civic Resource Redistribution Infrastructure',
    
    NAV_RESOURCES: 'Browse Resources',
    NAV_REQUESTS: 'Browse Requests',
    NAV_HOW_IT_WORKS: 'How It Works',
    NAV_ABOUT: 'About Dawwarha',
    NAV_LOGIN: 'Log In',
    NAV_REGISTER: 'Get Started',
    NAV_DASHBOARD: 'Dashboard',
    NAV_PROFILE: 'Profile',
    NAV_MY_RESOURCES: 'My Resources',
    NAV_MY_REQUESTS: 'My Requests',
    NAV_MATCHES: 'Matches',
    NAV_CONTRIBUTIONS: 'Impact & Contributions',
    NAV_NOTIFICATIONS: 'Notifications',
    NAV_ORG_DASHBOARD: 'Org Dashboard',
    NAV_ADMIN: 'Admin Console',
    NAV_LOGOUT: 'Sign Out',
    LANG_TOGGLE: 'العربية',
    
    HERO_PILL: 'Civic Infrastructure for Resource Redistribution',
    HERO_TITLE_1: 'Someone has what',
    HERO_TITLE_HIGHLIGHT: 'someone else needs',
    HERO_TITLE_2: 'in the same neighborhood.',
    HERO_SUBTITLE: 'Medical equipment, school supplies, office furniture, and usable food sit idle not because nobody needs them, but because supply and demand exist in isolated silos. Dawwarha bridges civic donors and verified grassroots recipients through transparent, location-aware matching and dual-confirmed handovers.',
    HERO_CTA_BROWSE: 'Find a Resource',
    HERO_CTA_OFFER: 'Offer a Resource',
    HERO_STAT_TRANSFERS: '1,420+ transfers coordinated across Cairo & Giza',
    HERO_REDISTRIBUTION_RATE: 'Live Redistribution Rate',
    HERO_FULFILLED: '98.4% Fulfilled',
    HERO_UNITS_COUNT: '3,840',
    HERO_UNITS_LABEL: 'verified physical units',
    HERO_UNITS_DESC: 'Logged into our zero-loss civic ledger. Every transfer involves a counterpart token and audited custody sign-off.',
    HERO_ACTIVE_AREAS: 'Active in Maadi, Dokki, Nasr City & Giza',
    LOOP_TITLE: 'The Dawwarha Circulation Loop',
    LOOP_SUBTITLE: 'Deterministic Handover Architecture',
    LOOP_STEP1_TITLE: 'Resource Listed',
    LOOP_STEP1_DESC: 'Donor details quantity, current status, safety checklist, and 6-48h pickup availability window.',
    LOOP_STEP2_TITLE: 'Demand Registered',
    LOOP_STEP2_DESC: 'Verified community organizations or individuals log specific demand with urgency rating.',
    LOOP_STEP3_TITLE: 'Explainable Matching',
    LOOP_STEP3_DESC: 'System computes transparent match score based on 5 clear signals: category, proximity, quantity, urgency, window.',
    LOOP_STEP4_TITLE: 'Two-Sided Handover',
    LOOP_STEP4_DESC: 'Transfer is only finalized when both provider and seeker independently confirm custody transfer.',
    
    LOGIN_TITLE: 'Sign In to Dawwarha',
    LOGIN_SUBTITLE: 'Enter your work or volunteer email and password to access your dashboard.',
    EMAIL_LABEL: 'Email Address',
    PASSWORD_LABEL: 'Password',
    REMEMBER_ME: 'Keep this device signed in',
    FORGOT_PASSWORD: 'Forgot password?',
    SIGN_IN_BTN: 'Sign In',
    DONT_HAVE_ACCOUNT: "Don't have an account?",
    CREATE_ACCOUNT_LINK: 'Create account',
    DEMO_ACCOUNTS: 'Quick demo accounts for testing:',
    DEMO_PROVIDER: 'Donor (Provider)',
    DEMO_ORG: 'Organization (Seeker)',
    DEMO_ADMIN: 'Admin Operator',
    
    // Forgot Password
    FORGOT_TITLE: 'Forgot your password?',
    FORGOT_SUBTITLE: "Enter the email associated with your Dawwarha account and we'll help you get back in.",
    SEND_RESET_LINK_BTN: 'Send Reset Link',
    BACK_TO_LOGIN: 'Back to Sign In',
    FORGOT_SUCCESS_TITLE: 'Reset Instructions Sent',
    FORGOT_SUCCESS_DESC: 'If an active account matches that email, instructions to reset access are on the way (valid for 15 minutes).',
    TRY_ANOTHER_EMAIL: 'Try another email address',

    // Reset Password
    RESET_TITLE: 'Set New Password',
    RESET_SUBTITLE: 'Please enter and confirm your new secure password.',
    NEW_PASSWORD_LABEL: 'New Password',
    CONFIRM_PASSWORD_LABEL: 'Confirm New Password',
    RESET_PASSWORD_BTN: 'Update Password',
    RESET_SUCCESS_TITLE: 'Password Reset Successfully',
    RESET_SUCCESS_DESC: 'Your password has been updated. You can now sign in with your new credentials.',
    RESET_INVALID_TOKEN: 'The password reset link is invalid or has expired. Please request a new one.',

    // Change Password
    CHANGE_PASSWORD_TITLE: 'Change Password',
    CURRENT_PASSWORD_LABEL: 'Current Password',
    UPDATE_PASSWORD_BTN: 'Update Password',
    PASSWORD_CHANGED_SUCCESS: 'Password updated successfully.',
    
    REGISTER_TITLE: 'Create a Dawwarha Account',
    REGISTER_SUBTITLE: 'Join the civic resource redistribution network — offer surplus or register community needs.',
    ROLE_INDIVIDUAL: 'Individual (Donor / Seeker)',
    ROLE_ORGANIZATION: 'Civil Organization / NGO',
    NAME_LABEL_USER: 'Full Name',
    NAME_LABEL_ORG: 'Organization Representative Name',
    PHONE_LABEL: 'Phone Number',
    SIGN_UP_BTN: 'Create Account',
    ALREADY_HAVE_ACCOUNT: 'Already have an account?',
    SIGN_IN_LINK: 'Sign In',
    
    FOOTER_DESC: 'Civic infrastructure for urban surplus recovery and community reallocation with transparent rule-based matching and two-sided custody sign-offs.',
    FOOTER_LINKS_HEADER: 'Platform Links',
    FOOTER_ORGS_HEADER: 'Organizations',
    FOOTER_COPYRIGHT: '© 2026 Dawwarha (دَوَّرها). NTI Graduation Project. All rights reserved.',

    ADMIN_TITLE: 'Dawwarha · Operations',
    ADMIN_CONSOLE_VERSION: 'Console v1.0',
    ADMIN_BACK_TO_APP: 'Back to App',
    ADMIN_SIGN_OUT: 'Sign Out',
    ADMIN_CONTROL_MONITORING: 'Control & Monitoring',
    ADMIN_NAV_DASHBOARD: 'Dashboard & Analytics',
    ADMIN_NAV_USERS: 'Users & Accounts',
    ADMIN_NAV_ORGANIZATIONS: 'Organizations & Verification',
    ADMIN_NAV_RESOURCES: 'Listed Resources',
    ADMIN_NAV_REQUESTS: 'Demand Requests',
    ADMIN_NAV_REPORTS: 'Reports & Moderation',
    ADMIN_NAV_CATEGORIES: 'Manage Categories',
    ADMIN_MOBILE_NAV_TITLE: 'Admin Navigation',
    ADMIN_USERS_TITLE: 'User & Account Management',
    ADMIN_USERS_SUBTITLE: 'View and edit user and organization roles, suspend violating accounts.',
    ADMIN_ORGS_TITLE: 'Organization Verification Queue',
    ADMIN_ORGS_SUBTITLE: 'Review supporting documents and official registration certificates to grant the Verified Badge.',
    ADMIN_SEARCH_USERS_PLACEHOLDER: 'Search by name or email...',
    ADMIN_FILTER_ALL: 'All',
    ADMIN_FILTER_PENDING: 'Pending Review',
    ADMIN_FILTER_VERIFIED: 'Verified',
    ADMIN_RETRY: 'Retry',
    ADMIN_NO_USERS: 'No users found matching your search.',
    ADMIN_NO_ORGS: 'No organizations match the current filter.',
    URGENCY_HIGH: 'High urgency',
    URGENCY_MEDIUM: 'Medium urgency',
    URGENCY_LOW: 'Low urgency'
  }
};
