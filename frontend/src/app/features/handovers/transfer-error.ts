/**
 * Transfer Error & Conflict Mapping Utility
 * Authoritative source: Backend Implementation Plan §16 & DESIGN.md §22
 *
 * Implements complete UI treatment for Transfer-domain errors:
 * - Handover confirmation conflicts
 * - Report operations
 * - Transfer-domain lifecycle constraints
 */

export interface FormattedTransferError {
  statusCode: number;
  code: string;
  title: string;
  userMessage: string;
  resolutionGuidance: string;
  variant: 'danger' | 'warning' | 'info';
  actionableLink?: {
    label: string;
    url: string;
  };
}

export class TransferErrorMapper {
  /**
   * Maps backend HTTP errors to user-understandable, accessible error models.
   */
  static mapError(error: any): FormattedTransferError {
    const statusCode: number = error?.statusCode || error?.status || 500;
    const rawCode: string = error?.code || error?.error?.code || '';
    const rawMessage: string = error?.message || error?.error?.message || '';

    // 1. 400 Bad Request / Validation
    if (statusCode === 400) {
      if (rawCode === 'INVALID_ID' || rawMessage.includes('Invalid match ID') || rawMessage.includes('Invalid resource ID')) {
        return {
          statusCode: 400,
          code: 'INVALID_ID',
          title: 'معرف المعاملة غير صالح',
          userMessage: 'الرابط المستخدم للوصول إلى عملية التسليم غير صحيح أو يحتوي على رمز غير معتمد.',
          resolutionGuidance: 'يرجى مراجعة قائمة المطابقات الذكية واختيار العملية من الرابط المعتمد.',
          variant: 'warning',
          actionableLink: { label: 'العودة للمطابقات', url: '/matches' }
        };
      }

      if (rawMessage.includes('Cannot report yourself') || rawCode === 'SELF_REPORT') {
        return {
          statusCode: 400,
          code: 'SELF_REPORT',
          title: 'إجراء غير مسموح',
          userMessage: 'لا يمكن تقديم بلاغ ضد حسابك الشخصي.',
          resolutionGuidance: 'يرجى التأكد من اختيار العضو أو المورد المطلوب الإبلاغ عنه.',
          variant: 'warning'
        };
      }

      return {
        statusCode: 400,
        code: rawCode || 'VALIDATION_ERROR',
        title: 'بيانات غير صالحة',
        userMessage: rawMessage || 'البيانات المدخلة لا تستوفي شروط المنصة.',
        resolutionGuidance: 'يرجى التحقق من صحة الحقول وإعادة المحاولة.',
        variant: 'warning'
      };
    }

    // 2. 403 Forbidden (Non-party or unauthorized action)
    if (statusCode === 403) {
      return {
        statusCode: 403,
        code: 'FORBIDDEN',
        title: 'غير مصرح بتأكيد هذه المعاملة',
        userMessage: 'يقتصر حق تأكيد التسليم والاستلام حصرياً على الطرفين الفعليين (المانح والمستفيد) المعينين في هذه المطابقة.',
        resolutionGuidance: 'إذا كنت طرفاً في هذا التبادل، يرجى التأكد من تسجيل الدخول بالحساب الصحيح المسجل في العملية.',
        variant: 'danger',
        actionableLink: { label: 'تسجيل الدخول', url: '/login' }
      };
    }

    // 3. 404 Not Found (Missing handover or match)
    if (statusCode === 404) {
      return {
        statusCode: 404,
        code: 'NOT_FOUND',
        title: 'لم يتم العثور على سجل التسليم',
        userMessage: 'لا يوجد بروتوكول تسليم مسجل لهذه المطابقة. قد تكون المطابقة قيد المعالجة أو لم يتم قبولها بعد.',
        resolutionGuidance: 'تأكد من إتمام قبول المطابقة من قبل الطرفين قبل الانتقال إلى بروتوكول التسليم.',
        variant: 'warning',
        actionableLink: { label: 'مراجعة المطابقات', url: '/matches' }
      };
    }

    // 4. 409 Conflict (Handover inactive, cancelled, no-show, or transition conflict)
    if (statusCode === 409) {
      if (rawCode === 'HANDOVER_INACTIVE' || rawMessage.includes('no longer active')) {
        return {
          statusCode: 409,
          code: 'HANDOVER_INACTIVE',
          title: 'عملية التسليم غير نشطة حالياً',
          userMessage: 'تم إيقاف هذه العملية سابقاً بسبب إلغائها أو الإبلاغ عن عدم حضور أحد الطرفين.',
          resolutionGuidance: 'وفقاً لقواعد دورة حياة الموارد (Product Brief §11): يعود المورد والطلب تلقائياً إلى الحالة "متاح" لتكرار المطابقة.',
          variant: 'warning',
          actionableLink: { label: 'تصفح الموارد المتاحة', url: '/resources' }
        };
      }

      return {
        statusCode: 409,
        code: rawCode || 'CONFLICT',
        title: 'تعارض في حالة المعاملة',
        userMessage: rawMessage || 'الحالة الحالية للمورد أو الطلب لا تسمح بهذا الانتقال.',
        resolutionGuidance: 'يرجى تحديث الصفحة لمشاهدة أحدث حالة متزامنة مع الخادم.',
        variant: 'warning'
      };
    }

    // 5. Default 500 / Network Error
    return {
      statusCode,
      code: 'SERVER_ERROR',
      title: 'حدث خطأ غير متوقع',
      userMessage: 'تعذر استكمال العملية نظراً لمشكلة في الاتصال بالخادم.',
      resolutionGuidance: 'يرجى التحقق من اتصال الإنترنت أو المحاولة بعد لحظات.',
      variant: 'danger'
    };
  }
}
