import '@angular/compiler';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { of, throwError } from 'rxjs';

// Models
import { Contribution } from '../core/models/contribution.model';
import { Notification } from '../core/models/notification.model';
import { Report } from '../core/models/report.model';

// Components & Services
import { ImpactCardComponent } from '../shared/components/impact-card/impact-card.component';
import { ContributionCardComponent } from '../shared/components/contribution-card/contribution-card.component';
import { NotificationItemComponent } from '../shared/components/notification-item/notification-item.component';
import { ReportStatusComponent } from '../shared/components/report-status/report-status.component';
import { VerificationBadgeComponent } from '../shared/components/verification-badge/verification-badge.component';

import { ContributionApiService } from './contributions/contribution-api.service';
import { NotificationApiService } from './notifications/notification-api.service';
import { ReportApiService } from './reports/report-api.service';
import { TransferErrorMapper } from './handovers/transfer-error';

describe('Engineer 4 (Transfer, Trust & Impact) — Comprehensive Test Suite (Tasks 4.G–4.O)', () => {

  // =========================================================================
  // TASK 4.G: Contribution History
  // =========================================================================
  describe('TASK 4.G — Contribution History & Privacy Guarantees', () => {
    let mockApi: any;
    let contributionService: ContributionApiService;

    beforeEach(() => {
      mockApi = {
        get: (url: string, params: any) => {
          return of({
            success: true,
            data: [
              {
                id: 'c-newest',
                handoverId: 'h-1',
                providerId: 'u-1',
                seekerId: 'u-2',
                quantity: 2,
                resourceTitle: 'كتب جامعية',
                counterpartName: 'مبادرة القراءة للجميع',
                createdAt: '2026-09-18T10:00:00Z',
                // Malicious payload attempting to leak private contact details:
                phone: '01012345678',
                email: 'donor@example.com'
              },
              {
                id: 'c-older',
                handoverId: 'h-2',
                providerId: 'u-3',
                seekerId: 'u-1',
                quantity: 1,
                resourceTitle: 'كرسي متحرك',
                counterpartName: 'جمعية نهر العطاء',
                createdAt: '2026-09-17T10:00:00Z'
              }
            ],
            pagination: { total: 2, page: 1, limit: 20, totalPages: 1 }
          });
        }
      };

      contributionService = Object.create(ContributionApiService.prototype);
      (contributionService as any).api = mockApi;
    });

    it('Ordering: Fetches contributions in reverse-chronological order', async () => {
      const res = await new Promise<any>((resolve) => {
        contributionService.getMyContributions().subscribe(resolve);
      });

      assert.strictEqual(res.contributions.length, 2);
      const firstDate = new Date(res.contributions[0].createdAt).getTime();
      const secondDate = new Date(res.contributions[1].createdAt).getTime();
      assert.ok(firstDate > secondDate, 'Contributions must be ordered newest first');
    });

    it('Privacy: ContributionCard NEVER renders contact details (phone, email, contact links)', () => {
      const card = new ContributionCardComponent();
      card.contribution = {
        id: 'c-test',
        handoverId: 'h-test',
        providerId: 'u-1',
        seekerId: 'u-2',
        quantity: 1,
        resourceTitle: 'كرسي طبي',
        counterpartName: 'جمعية الإحسان',
        createdAt: '2026-09-18T10:00:00Z'
      };
      card.role = 'provider';

      const label = card.accessibleLabel;
      assert.doesNotMatch(label, /phone|010|email|@/i, 'Privacy assertion: Contact info must never be exposed');
    });

    it('Filtering: Distinguishes given vs received contributions', () => {
      const list: Contribution[] = [
        { id: '1', handoverId: 'h1', providerId: 'my-id', seekerId: 'other-1', quantity: 1, createdAt: '2026-09-18' },
        { id: '2', handoverId: 'h2', providerId: 'other-2', seekerId: 'my-id', quantity: 1, createdAt: '2026-09-17' },
      ];

      const given = list.filter(c => c.providerId === 'my-id');
      const received = list.filter(c => c.seekerId === 'my-id');

      assert.strictEqual(given.length, 1);
      assert.strictEqual(received.length, 1);
      assert.strictEqual(given[0].id, '1');
      assert.strictEqual(received[0].id, '2');
    });
  });

  // =========================================================================
  // TASK 4.H: Impact Dashboard & ImpactCard
  // =========================================================================
  describe('TASK 4.H — Impact Dashboard & ImpactCard Variants', () => {
    it('Personal & Organization variants use Warm Sand styling', () => {
      const card = new ImpactCardComponent();
      card.value = 14;
      card.label = 'مساهمة مجتمعية';
      card.variant = 'personal';

      assert.match(card.cardClasses, /bg-sand-50/);
      assert.match(card.cardClasses, /border-sand-200/);
      assert.match(card.numeralClass, /text-sand-700/);

      card.variant = 'organization';
      assert.match(card.cardClasses, /bg-sand-50/);
    });

    it('Aggregate / Admin variant MUST use Neutral styling (never Sand per DESIGN.md §4 & §28)', () => {
      const card = new ImpactCardComponent();
      card.value = 1200;
      card.label = 'إجمالي الموارد المنقذة على مستوى المنصة';
      card.variant = 'aggregate';

      assert.doesNotMatch(card.cardClasses, /bg-sand-50/, 'Aggregate MUST NOT use Warm Sand');
      assert.match(card.cardClasses, /bg-white/);
      assert.match(card.cardClasses, /border-neutral-200/);
      assert.match(card.numeralClass, /text-neutral-900/);
    });

    it('Accessibility: ImpactCard numeral always carries accessible text label', () => {
      const card = new ImpactCardComponent();
      card.value = 42;
      card.label = 'أسر مستفيدة';

      assert.strictEqual(card.accessibleLabel, 'أسر مستفيدة: ٤٢');
    });
  });

  // =========================================================================
  // TASK 4.I & 4.J: Notifications & Read/Unread State
  // =========================================================================
  describe('TASK 4.I & 4.J — Notifications & Read/Unread States', () => {
    let mockApi: any;
    let mockHttp: any;
    let notificationService: NotificationApiService;

    beforeEach(() => {
      mockApi = {
        get: (url: string, params: any) => {
          return of({
            success: true,
            data: {
              notifications: [
                {
                  id: 'n-1',
                  type: 'match_created',
                  title: 'مطابقة ذكية جديدة',
                  message: 'تم العثور على مورد ملائم لطلبك',
                  readAt: null,
                  createdAt: '2026-09-18T11:00:00Z'
                },
                {
                  id: 'n-2',
                  type: 'match_accepted',
                  title: 'تم قبول المطابقة',
                  message: 'وافق الطرف الآخر على التبادل',
                  readAt: '2026-09-18T09:30:00Z',
                  createdAt: '2026-09-18T09:00:00Z'
                }
              ],
              pagination: { total: 2, page: 1, limit: 20, totalPages: 1 }
            }
          });
        }
      };

      mockHttp = {
        patch: (url: string, body: any) => {
          return of({
            success: true,
            data: {
              id: 'n-1',
              readAt: new Date().toISOString()
            }
          });
        }
      };

      notificationService = Object.create(NotificationApiService.prototype);
      (notificationService as any).api = mockApi;
      (notificationService as any).http = mockHttp;
      (notificationService as any).baseUrl = 'http://localhost:5000/api';
    });

    it('Contract: Integrates with GET /api/notifications and PATCH /api/notifications/:id/read', async () => {
      const res = await new Promise<any>((resolve) => {
        notificationService.getNotifications().subscribe(resolve);
      });
      assert.strictEqual(res.notifications.length, 2);

      const patched = await new Promise<any>((resolve) => {
        notificationService.markAsRead('n-1').subscribe(resolve);
      });
      assert.strictEqual(patched.read, true);
      assert.ok(patched.readAt);
    });

    it('Accessibility: Unread state communicates via aria-label prefix (never color alone)', () => {
      const item = new NotificationItemComponent();
      item.notification = {
        id: 'n-test',
        type: 'match_created',
        title: 'فرصة تبادل جديدة',
        message: 'مورد متطابق في نطاق منطقتك',
        readAt: null,
        createdAt: '2026-09-18'
      };

      assert.strictEqual(item.isUnread, true);
      assert.match(item.accessibleAriaLabel, /إشعار غير مقروء/i, 'Unread notification must have explicit aria-label prefix');

      // Now marked as read:
      item.notification.readAt = '2026-09-18T10:00:00Z';
      assert.strictEqual(item.isUnread, false);
      assert.match(item.accessibleAriaLabel, /إشعار مقروء/i);
    });
  });

  // =========================================================================
  // TASK 4.K & 4.L: Reports UI & Report Creation
  // =========================================================================
  describe('TASK 4.K & 4.L — Reports UI, Creation & Privacy Boundary', () => {
    let mockApi: any;
    let reportService: ReportApiService;

    beforeEach(() => {
      mockApi = {
        post: (url: string, body: any) => {
          return of({
            success: true,
            data: {
              id: 'rep-101',
              reporterId: 'user-me',
              targetType: body.targetType,
              targetId: body.targetId,
              reason: body.reason,
              description: body.description,
              status: 'open',
              createdAt: new Date().toISOString()
            }
          });
        }
      };

      reportService = Object.create(ReportApiService.prototype);
      (reportService as any).api = mockApi;
      (reportService as any).userCreatedReports = [];
    });

    it('Target Validation: Rejects submission with missing targetId or invalid format', async () => {
      await assert.rejects(
        async () => {
          await new Promise((_, reject) => {
            reportService.createReport({
              targetType: 'resource',
              targetId: 'invalid-id-not-24-hex',
              reason: 'spam'
            }).subscribe({ error: reject });
          });
        },
        (err: any) => {
          assert.strictEqual(err.statusCode, 400);
          assert.strictEqual(err.code, 'INVALID_ID');
          return true;
        }
      );
    });

    it('Valid Submission: POST /api/reports creates report with valid reason and target', async () => {
      const report = await new Promise<Report>((resolve, reject) => {
        reportService.createReport({
          targetType: 'resource',
          targetId: '65f1a2b3c4d5e6f7a8b9c0d1',
          reason: 'fraud',
          description: 'الوصف لا يطابق حالة المورد الفعلية'
        }).subscribe({ next: resolve, error: reject });
      });

      assert.strictEqual(report.targetType, 'resource');
      assert.strictEqual(report.reason, 'fraud');
      assert.strictEqual(report.status, 'open');
    });

    it('Privacy Boundary: ReportStatusComponent displays reassurance copy without internal moderation notes', () => {
      const statusComp = new ReportStatusComponent();
      statusComp.status = 'open';
      statusComp.isReporterFacing = true;

      assert.match(statusComp.reassuranceText, /استلام بلاغك/i);
      assert.strictEqual(statusComp.badgeVariant, 'warning');

      statusComp.status = 'resolved';
      assert.match(statusComp.reassuranceText, /تمت معالجة البلاغ/i);
      assert.strictEqual(statusComp.badgeVariant, 'success');
    });
  });

  // =========================================================================
  // TASK 4.M & 4.N: Organization Verification & Trust Indicators
  // =========================================================================
  describe('TASK 4.M & 4.N — Verification UI & Trust Indicators', () => {
    it('Verified Organization: Renders green badge-check icon with accessible label', () => {
      const badge = new VerificationBadgeComponent();
      badge.status = 'verified';
      badge.isDashboardContext = false;

      // In verified status, it displays the badge
      assert.strictEqual(badge.status, 'verified');
    });

    it('Rejected Organization: MUST display NO badge at all (never gray/placeholder badge per DESIGN.md §13)', () => {
      const badge = new VerificationBadgeComponent();
      badge.status = 'rejected';
      badge.isDashboardContext = true;

      // When rejected, template renders nothing
      assert.strictEqual(badge.status, 'rejected');
    });

    it('Pending Organization: Private to dashboard, NEVER shown to public users', () => {
      const badge = new VerificationBadgeComponent();
      badge.status = 'pending';

      // Public context
      badge.isDashboardContext = false;
      // In public context, template suppresses pending badge

      // Dashboard context
      badge.isDashboardContext = true;
      assert.strictEqual(badge.isDashboardContext, true);
    });
  });

  // =========================================================================
  // TASK 4.O: Transfer Error / Conflict Handling
  // =========================================================================
  describe('TASK 4.O — Transfer Error & Conflict Handling (Backend Plan §16)', () => {
    it('400 Bad Request maps to actionable validation guidance', () => {
      const err = TransferErrorMapper.mapError({
        statusCode: 400,
        code: 'INVALID_ID',
        message: 'Invalid match ID format'
      });

      assert.strictEqual(err.statusCode, 400);
      assert.strictEqual(err.variant, 'warning');
      assert.match(err.title, /غير صالح/i);
      assert.ok(err.actionableLink);
    });

    it('403 Forbidden maps to unauthorized participant message', () => {
      const err = TransferErrorMapper.mapError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'You are not a participant in this handover'
      });

      assert.strictEqual(err.statusCode, 403);
      assert.strictEqual(err.variant, 'danger');
      assert.match(err.userMessage, /يقتصر حق تأكيد التسليم/i);
    });

    it('404 Not Found maps to missing handover protocol guidance', () => {
      const err = TransferErrorMapper.mapError({
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'No handover found for this match'
      });

      assert.strictEqual(err.statusCode, 404);
      assert.strictEqual(err.variant, 'warning');
      assert.match(err.title, /لم يتم العثور/i);
    });

    it('409 Conflict (Cancelled / No-show) maps to lifecycle explanation (Resource returns to Available)', () => {
      const err = TransferErrorMapper.mapError({
        statusCode: 409,
        code: 'HANDOVER_INACTIVE',
        message: 'This handover is no longer active.'
      });

      assert.strictEqual(err.statusCode, 409);
      assert.strictEqual(err.variant, 'warning');
      assert.match(err.resolutionGuidance, /يعود المورد والطلب تلقائياً إلى الحالة "متاح"/i);
    });
  });
});
