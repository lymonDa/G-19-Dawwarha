import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { orgVerifiedGuard } from './core/guards/org-verified.guard';

export const appRoutes: Routes = [
  // 1. PUBLIC ROUTES (Wrapped in PublicLayout)
  {
    path: '',
    loadComponent: () =>
      import('./layout/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/landing/landing.component').then(m => m.LandingComponent),
        title: 'دَوَّرها — منصة تدوير وتوزيع الموارد الحضرية'
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/static/about/about.component').then(m => m.AboutComponent),
        title: 'عن دوّرها — معايير الأمان والشفافية'
      },
      {
        path: 'how-it-works',
        loadComponent: () =>
          import('./features/static/how-it-works/how-it-works.component').then(m => m.HowItWorksComponent),
        title: 'كيف تعمل المنصة — دورة التدوير الموثقة'
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
        title: 'تسجيل الدخول — دَوَّرها'
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        title: 'إنشاء حساب جديد — دَوَّرها'
      },
      {
        path: 'resources',
        loadComponent: () =>
          import('./features/resources/resource-list/resource-list.component').then(m => m.ResourceListComponent),
        title: 'تصفح الموارد المتاحة — دَوَّرها'
      },
      {
        path: 'resources/:id',
        loadComponent: () =>
          import('./features/resources/resource-detail/resource-detail.component').then(m => m.ResourceDetailComponent),
        title: 'تفاصيل المورد — دَوَّرها'
      },
      {
        path: 'organizations/:id',
        loadComponent: () =>
          import('./features/organizations/org-profile/org-profile.component').then(m => m.OrgProfileComponent),
        title: 'الملف التعريفي للجمعية — دَوَّرها'
      }
    ]
  },

  // 2. AUTHENTICATED APP ROUTES (Wrapped in AppLayout, Guarded)
  {
    path: '',
    loadComponent: () =>
      import('./layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'لوحة التحكم — دَوَّرها'
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
        title: 'الملف الشخصي — دَوَّرها'
      },
      {
        path: 'resources/create',
        loadComponent: () =>
          import('./features/resources/resource-create/resource-create.component').then(m => m.ResourceCreateComponent),
        title: 'عرض مورد جديد — دَوَّرها'
      },
      {
        path: 'resources/mine',
        loadComponent: () =>
          import('./features/resources/my-resources/my-resources.component').then(m => m.MyResourcesComponent),
        title: 'مواردي المعروضة — دَوَّرها'
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./features/requests/request-list/request-list.component').then(m => m.RequestListComponent),
        title: 'قوائم الاحتياجات — دَوَّرها'
      },
      {
        path: 'requests/create',
        loadComponent: () =>
          import('./features/requests/request-form/request-form.component').then(m => m.RequestFormComponent),
        title: 'تسجيل طلب احتياج — دَوَّرها'
      },
      {
        path: 'requests/mine',
        loadComponent: () =>
          import('./features/requests/my-requests/my-requests.component').then(m => m.MyRequestsComponent),
        title: 'طلباتي المسجلة — دَوَّرها'
      },
      {
        path: 'requests/:id/edit',
        loadComponent: () =>
          import('./features/requests/request-form/request-form.component').then(m => m.RequestFormComponent),
        title: 'تعديل طلب الاحتياج — دَوَّرها'
      },
      {
        path: 'requests/:id',
        loadComponent: () =>
          import('./features/requests/request-detail/request-detail.component').then(m => m.RequestDetailComponent),
        title: 'تفاصيل طلب الاحتياج — دَوَّرها'
      },
      {
        path: 'matches',
        loadComponent: () =>
          import('./features/matches/match-list/match-list.component').then(m => m.MatchListComponent),
        title: 'المطابقات الذكية — دَوَّرها'
      },
      {
        path: 'matches/:id',
        loadComponent: () =>
          import('./features/matches/match-detail/match-detail.component').then(m => m.MatchDetailComponent),
        title: 'تفاصيل المطابقة — دَوَّرها'
      },
      {
        path: 'handovers/:matchId',
        loadComponent: () =>
          import('./features/handovers/handover-detail/handover-detail.component').then(m => m.HandoverDetailComponent),
        title: 'تأكيد التسليم والاستلام — دَوَّرها'
      },
      {
        path: 'contributions',
        loadComponent: () =>
          import('./features/contributions/contributions-list/contributions-list.component').then(m => m.ContributionsListComponent),
        title: 'سجل الأثر والمساهمات — دَوَّرها'
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications-list/notifications-list.component').then(m => m.NotificationsListComponent),
        title: 'التنبيهات والإشعارات — دَوَّرها'
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports-list/reports-list.component').then(m => m.ReportsListComponent),
        title: 'سجل البلاغات — دَوَّرها'
      },
      {
        path: 'organizations/register',
        loadComponent: () =>
          import('./features/organizations/org-register/org-register.component').then(m => m.OrgRegisterComponent),
        title: 'تسجيل منظمة جديدة — دَوَّرها'
      },
      {
        path: 'organizations/dashboard',
        canActivate: [orgVerifiedGuard],
        loadComponent: () =>
          import('./features/organizations/org-dashboard/org-dashboard.component').then(m => m.OrgDashboardComponent),
        title: 'لوحة تحكم المنظمة — دَوَّرها'
      },
      {
        path: 'organizations/verification',
        loadComponent: () =>
          import('./features/organizations/org-verification/org-verification.component').then(m => m.OrgVerificationComponent),
        title: 'توثيق الحساب الرسمي — دَوَّرها'
      }
    ]
  },

  // 3. ADMIN OPERATIONAL ROUTES (Wrapped in AdminLayout, Role Guarded)
  {
    path: 'admin',
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, roleGuard(['admin'])],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'لوحة الإدارة والمراقبة — دَوَّرها'
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
        title: 'إدارة المستخدمين — دَوَّرها'
      },
      {
        path: 'organizations',
        loadComponent: () =>
          import('./features/admin/admin-organizations/admin-organizations.component').then(m => m.AdminOrganizationsComponent),
        title: 'مراجعة توثيق الجمعيات — دَوَّرها'
      },
      {
        path: 'resources',
        loadComponent: () =>
          import('./features/admin/admin-resources/admin-resources.component').then(m => m.AdminResourcesComponent),
        title: 'الموارد المنشورة — دَوَّرها'
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./features/admin/admin-requests/admin-requests.component').then(m => m.AdminRequestsComponent),
        title: 'طلبات الاحتياج — دَوَّرها'
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/admin/admin-reports/admin-reports.component').then(m => m.AdminReportsComponent),
        title: 'البلاغات والرقابة — دَوَّرها'
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/admin-categories/admin-categories.component').then(m => m.AdminCategoriesComponent),
        title: 'إدارة التصنيفات — دَوَّرها'
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'التحليلات ومؤشرات الأداء — دَوَّرها'
      }
    ]
  },

  // 4. WILDCARD NOT FOUND
  {
    path: '**',
    loadComponent: () =>
      import('./features/static/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'الصفحة غير موجودة 404 — دَوَّرها'
  }
];
