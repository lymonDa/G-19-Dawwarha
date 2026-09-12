const transitions = {
  draft: {
    publish: "published",
    cancel: "cancelled",
  },
  published: {
    markAvailable: "available",
    match: "matched",
    markUnavailable: "unavailable",
    cancel: "cancelled",
    expire: "expired",
  },
  available: {
    match: "matched",
    markUnavailable: "unavailable",
    cancel: "cancelled",
    expire: "expired",
  },
  matched: {
    accept: "accepted",
    reject: "available",
    release: "available",
    markUnavailable: "unavailable",
    cancel: "cancelled",
  },
  accepted: {
    startHandover: "in_handover",
    cancel: "cancelled",
  },
  in_handover: {
    complete: "completed",
    cancel: "cancelled",
  },
  completed: {
    logImpact: "impact_recorded",
  },
  unavailable: {
    reopen: "available",
    cancel: "cancelled",
  },
  impact_recorded: {},
  cancelled: {},
  expired: {},
};

const SYSTEM_ONLY_ACTIONS = [
  "expire",
  "match",
  "logImpact",
  "markAvailable",
  "release",
  "startHandover",
];

const TERMINAL_STATES = ["impact_recorded", "cancelled", "expired"];

const makeError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });

/**
 * Transition a resource through its lifecycle state machine.
 * Single source of truth for resource status transitions per MongoDB Plan Section 9.2.
 *
 * @param {import("mongoose").Document} resource - Mongoose resource document
 * @param {string} action - State transition action (e.g. 'cancel', 'publish')
 * @param {object} [actor] - Authenticated user performing the action
 * @param {object} [options] - Options such as { session }
 * @returns {Promise<import("mongoose").Document>}
 */
export async function transitionResource(resource, action, actor, options = {}) {
  const currentStatus = resource.status;

  if (TERMINAL_STATES.includes(currentStatus)) {
    throw makeError(
      409,
      "INVALID_TRANSITION",
      `Cannot transition resource in terminal state: '${currentStatus}'.`
    );
  }

  const allowedActions = transitions[currentStatus];
  const nextStatus = allowedActions ? allowedActions[action] : undefined;

  if (!nextStatus) {
    throw makeError(
      409,
      "INVALID_TRANSITION",
      `Invalid transition: ${currentStatus} -> ${action}`
    );
  }

  // System-only actions enforcement (cannot be manually triggered by regular users or admins)
  if (SYSTEM_ONLY_ACTIONS.includes(action)) {
    const isSystem = Boolean(
      actor && (actor.role === "system" || actor === "system" || actor.isSystem === true)
    );
    if (!isSystem) {
      throw makeError(
        403,
        "FORBIDDEN",
        `Action '${action}' can only be triggered by the system.`
      );
    }
  } else if (actor) {
    const isAdmin = actor.role === "admin";
    const isOwner = resource.providerId && String(resource.providerId) === String(actor._id);

    if (!isAdmin && !isOwner) {
      throw makeError(
        403,
        "FORBIDDEN",
        "You don't have permission to transition this resource."
      );
    }
  }

  resource.status = nextStatus;

  if (options.session) {
    return resource.save({ session: options.session });
  }

  return resource.save();
}

export const transitionResourceStatus = transitionResource;

export default {
  transitions,
  transitionResource,
  transitionResourceStatus,
};
