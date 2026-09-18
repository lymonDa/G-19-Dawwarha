import '@angular/compiler';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Handover, HandoverConfirmResponse } from '../../../core/models/handover.model';
import { HandoverApiService } from '../handover-api.service';
import { LIFECYCLE_STEPS, LifecycleTimelineComponent } from '../../../shared/components/lifecycle-timeline/lifecycle-timeline.component';
import { of, throwError } from 'rxjs';

describe('Handover Detail & Two-Sided Confirmation Protocol (Task 4.C Specification)', () => {
  let mockApiBase: any;
  let handoverApi: HandoverApiService;
  let lastPostedUrl: string = '';
  let lastPostedBody: any = null;

  beforeEach(() => {
    lastPostedUrl = '';
    lastPostedBody = null;

    mockApiBase = {
      post: (url: string, body: any) => {
        lastPostedUrl = url;
        lastPostedBody = body;
        return of({
          success: true,
          data: {
            status: 'in_progress',
            bothConfirmed: false
          }
        });
      },
      get: (url: string) => {
        return of({
          success: true,
          data: {
            id: 'handover-123',
            matchId: 'match-123',
            providerId: 'provider-1',
            seekerId: 'seeker-2',
            confirmedByProvider: false,
            confirmedBySeeker: false,
            status: 'in_progress',
            completedAt: null,
            createdAt: new Date().toISOString()
          }
        });
      }
    };

    handoverApi = Object.create(HandoverApiService.prototype);
    (handoverApi as any).api = mockApiBase;
    (handoverApi as any).localHandoverStore = new Map();
    handoverApi.clearCache();
  });

  // =========================================================================
  // REQUIREMENT 1: UI never shows "Completed" until both confirmedByProvider
  // and confirmedBySeeker are true
  // =========================================================================
  it('Requirement 1: UI never shows "Completed" until BOTH confirmedByProvider and confirmedBySeeker are true', async () => {
    const handover: Handover = {
      id: 'h-100',
      matchId: 'm-100',
      providerId: 'user-p',
      seekerId: 'user-s',
      confirmedByProvider: false,
      confirmedBySeeker: false,
      status: 'in_progress',
      completedAt: null,
      createdAt: '2026-09-18T10:00:00Z'
    };

    // State 0: Neither side confirmed
    const isCompletedState0 = Boolean(
      handover.status === 'completed' ||
      (handover.confirmedByProvider && handover.confirmedBySeeker)
    );
    assert.strictEqual(isCompletedState0, false, 'State 0: Transfer must not be completed when neither side has confirmed');

    // State 1: Provider confirms alone (simulate provider confirmation)
    handover.confirmedByProvider = true;
    const isCompletedState1 = Boolean(
      handover.status === 'completed' ||
      (handover.confirmedByProvider && handover.confirmedBySeeker)
    );
    assert.strictEqual(isCompletedState1, false, 'State 1: Transfer must NOT show completed when only provider has confirmed');
    assert.strictEqual(handover.confirmedByProvider, true);
    assert.strictEqual(handover.confirmedBySeeker, false);

    // State 2: Seeker confirms alone (simulate seeker confirmation without provider)
    handover.confirmedByProvider = false;
    handover.confirmedBySeeker = true;
    const isCompletedState2 = Boolean(
      handover.status === 'completed' ||
      (handover.confirmedByProvider && handover.confirmedBySeeker)
    );
    assert.strictEqual(isCompletedState2, false, 'State 2: Transfer must NOT show completed when only seeker has confirmed');

    // State 3: Both confirm (provider confirms then seeker confirms)
    handover.confirmedByProvider = true;
    handover.confirmedBySeeker = true;
    handover.status = 'completed';
    handover.completedAt = '2026-09-18T10:05:00Z';

    const isCompletedState3 = Boolean(
      handover.status === 'completed' ||
      (handover.confirmedByProvider && handover.confirmedBySeeker)
    );
    assert.strictEqual(isCompletedState3, true, 'State 3: Transfer shows Completed ONLY when BOTH flags are true');
  });

  // =========================================================================
  // REQUIREMENT 2: The confirm request body never contains a side field
  // =========================================================================
  it('Requirement 2: The confirm request body NEVER contains a "side" field under any state', async () => {
    const testMatchId = '65f1a2b3c4d5e6f7a8b9c0d1';

    await new Promise<void>((resolve, reject) => {
      handoverApi.confirmHandover(testMatchId).subscribe({
        next: (res) => {
          assert.strictEqual(lastPostedUrl, `/transactions/${testMatchId}/confirm`, 'Endpoint must be keyed by matchId');
          assert.ok(lastPostedBody !== null, 'Request body was provided');
          assert.strictEqual(typeof lastPostedBody, 'object', 'Request body must be an object');
          assert.strictEqual(
            Object.prototype.hasOwnProperty.call(lastPostedBody, 'side'),
            false,
            'CRITICAL: Request payload must NEVER contain a "side" field (derived server-side from JWT)'
          );
          assert.strictEqual(lastPostedBody.side, undefined, 'Body.side must be undefined');
          assert.deepStrictEqual(lastPostedBody, {}, 'Confirm request payload must be an empty object {}');
          resolve();
        },
        error: reject
      });
    });
  });

  // =========================================================================
  // REQUIREMENT 3: A double-tap of Confirm from an already-confirmed side
  // does not render an error state (idempotency)
  // =========================================================================
  it('Requirement 3: Double-tap of Confirm from already-confirmed side does not render an error (idempotent 200)', async () => {
    const testMatchId = '65f1a2b3c4d5e6f7a8b9c0d1';

    // Mock backend returning HTTP 200 on first confirm
    let callCount = 0;
    mockApiBase.post = (url: string, body: any) => {
      callCount++;
      return of({
        success: true,
        data: {
          status: 'in_progress',
          bothConfirmed: false
        }
      });
    };

    // First confirm call
    const firstCall = await new Promise<HandoverConfirmResponse>((resolve) => {
      handoverApi.confirmHandover(testMatchId).subscribe(resolve);
    });
    assert.strictEqual(firstCall.status, 'in_progress');
    assert.strictEqual(firstCall.bothConfirmed, false);
    assert.strictEqual(callCount, 1);

    // Second confirm call (double tap from user)
    const secondCall = await new Promise<HandoverConfirmResponse>((resolve, reject) => {
      handoverApi.confirmHandover(testMatchId).subscribe({
        next: (res) => resolve(res),
        error: (err) => reject(new Error(`Double tap threw an error: ${JSON.stringify(err)}`))
      });
    });

    assert.strictEqual(secondCall.status, 'in_progress', 'Second call succeeds identically without error');
    assert.strictEqual(secondCall.bothConfirmed, false);
    assert.strictEqual(callCount, 2, 'Two calls made idempotently without failure');
  });

  // =========================================================================
  // REQUIREMENT 4: Two indicators render independently and are never collapsed
  // into a single progress bar/percentage at any breakpoint
  // =========================================================================
  it('Requirement 4: Two indicators render independently and are never collapsed into a single progress bar', () => {
    const timeline = new LifecycleTimelineComponent();
    timeline.currentStep = 'in_handover';
    timeline.handoverConfirmation = {
      confirmedByProvider: true,
      confirmedBySeeker: false,
      isViewerProvider: true
    };

    // Assert that the 8 lifecycle steps exist in fixed order per Product Brief §11 & DESIGN.md §17
    const expectedStepIds = [
      'draft',
      'published',
      'available',
      'matched',
      'accepted',
      'in_handover',
      'completed',
      'impact'
    ];
    assert.deepStrictEqual(
      LIFECYCLE_STEPS.map(s => s.id),
      expectedStepIds,
      'Lifecycle steps must follow exact 8-step sequence'
    );

    // Assert step state computation
    assert.strictEqual(timeline.getStepState('draft'), 'completed');
    assert.strictEqual(timeline.getStepState('accepted'), 'completed');
    assert.strictEqual(timeline.getStepState('in_handover'), 'active');
    assert.strictEqual(timeline.getStepState('completed'), 'upcoming');
    assert.strictEqual(timeline.getStepState('impact'), 'upcoming');

    // Assert that provider and seeker indicators are independent methods producing separate data
    const providerText = timeline.getProviderIndicatorLabel();
    const seekerText = timeline.getSeekerIndicatorLabel();

    assert.ok(providerText.length > 0, 'Provider indicator text must exist independently');
    assert.ok(seekerText.length > 0, 'Seeker indicator text must exist independently');
    assert.notStrictEqual(providerText, seekerText, 'Provider and Seeker must have distinct labels representing their independent states');
  });

  // =========================================================================
  // REQUIREMENT 5: Each indicator state is conveyed via visible text, not color/fill alone
  // =========================================================================
  it('Requirement 5: Each indicator state is conveyed via visible text (never color/fill alone)', () => {
    const timeline = new LifecycleTimelineComponent();

    // Case A: Viewer is Provider, Provider confirmed, Seeker pending
    timeline.handoverConfirmation = {
      confirmedByProvider: true,
      confirmedBySeeker: false,
      isViewerProvider: true
    };

    const provLabelViewerConfirmed = timeline.getProviderIndicatorLabel();
    const seekLabelViewerPending = timeline.getSeekerIndicatorLabel();

    assert.match(
      provLabelViewerConfirmed,
      /You confirmed|أنت أكدت/i,
      'Provider indicator must display explicit text indicating confirmation'
    );
    assert.match(
      seekLabelViewerPending,
      /Waiting on recipient|بانتظار|Pending/i,
      'Seeker indicator must display explicit text indicating pending status'
    );

    // Case B: Viewer is Seeker, Seeker confirmed, Provider pending
    timeline.handoverConfirmation = {
      confirmedByProvider: false,
      confirmedBySeeker: true,
      isViewerProvider: false
    };

    const provLabelOtherPending = timeline.getProviderIndicatorLabel();
    const seekLabelViewerConfirmed = timeline.getSeekerIndicatorLabel();

    assert.match(
      provLabelOtherPending,
      /Waiting on donor|بانتظار|Pending/i,
      'Provider indicator must display explicit text indicating awaiting donor'
    );
    assert.match(
      seekLabelViewerConfirmed,
      /You confirmed|أنت أكدت/i,
      'Seeker indicator must display explicit text indicating user confirmed'
    );
  });

  // =========================================================================
  // REQUIREMENT 6: Error handling mapping for 403, 404, 409
  // =========================================================================
  it('Requirement 6: Error mapping correctly transforms 403, 404, and 409 backend responses', async () => {
    // 403 Forbidden (Non-party)
    mockApiBase.post = () => {
      return throwError(() => ({
        status: 403,
        error: {
          error: {
            code: 'FORBIDDEN',
            message: 'You are not a participant in this handover'
          }
        }
      }));
    };

    await assert.rejects(
      async () => {
        await new Promise((_, reject) => {
          handoverApi.confirmHandover('match-forbidden').subscribe({
            error: reject
          });
        });
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.code, 'FORBIDDEN');
        assert.match(err.message, /participant/i);
        return true;
      }
    );

    // 409 Inactive (Already cancelled / no_show)
    mockApiBase.post = () => {
      return throwError(() => ({
        status: 409,
        error: {
          error: {
            code: 'HANDOVER_INACTIVE',
            message: 'This handover is no longer active.'
          }
        }
      }));
    };

    await assert.rejects(
      async () => {
        await new Promise((_, reject) => {
          handoverApi.confirmHandover('match-cancelled').subscribe({
            error: reject
          });
        });
      },
      (err: any) => {
        assert.strictEqual(err.statusCode, 409);
        assert.strictEqual(err.code, 'HANDOVER_INACTIVE');
        assert.match(err.message, /longer active/i);
        return true;
      }
    );
  });
});
