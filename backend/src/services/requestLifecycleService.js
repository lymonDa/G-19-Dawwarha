const transitions = {
  draft: {
    publish: "published",
    cancel: "cancelled",
  },
  published: {
    match: "matched",
    cancel: "cancelled",
    expire: "expired",
  },
  matched: {
    accept: "accepted",
    reject: "published",
    release: "published",
    cancel: "cancelled",
  },
  accepted: {
    complete: "fulfilled",
    cancel: "cancelled",
  },
  fulfilled: {},
  cancelled: {},
  expired: {},
};

const SYSTEM_ONLY_ACTIONS = ["expire", "match"];
const TERMINAL_STATES = ["fulfilled", "cancelled", "expired"];

const makeError = (statusCode, code, message) =>
  Object.assign(new Error(message), { statusCode, code });

/**
 * Transition a request through its lifecycle state machine.
 * Single source of truth for request status transitions per MongoDB Plan Section 9.3.
 *
 * @param {import("mongoose").Document} request - Mongoose request document
 * @param {string} action - State transition action (e.g. 'publish', 'accept', 'cancel', 'expire')
 * @param {object} [actor] - Authenticated user or system actor performing the action
 * @param {object|import("mongoose").ClientSession} [options] - Options object { session } or session directly
 * @returns {Promise<import("mongoose").Document>}
 */
const transitionRequest = async (request, action, actor, options = {}) => {
  const currentStatus = request.status;

  if (TERMINAL_STATES.includes(currentStatus)) {
    throw makeError(
      409,
      "INVALID_TRANSITION",
      `Cannot transition request in terminal state: '${currentStatus}'.`
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

  const isSystem = Boolean(
    actor && (actor.role === "system" || actor === "system" || actor.isSystem === true)
  );

  // System-only actions enforcement
  if (SYSTEM_ONLY_ACTIONS.includes(action)) {
    if (!isSystem && actor?.role !== "admin") {
      throw makeError(
        403,
        "FORBIDDEN",
        `Action '${action}' can only be triggered by the system or admin.`
      );
    }
  } else if (actor && !isSystem) {
    const isAdmin = actor.role === "admin";
    const isOwner = request.requesterId && String(request.requesterId) === String(actor._id);

    if (!isAdmin && !isOwner) {
      throw makeError(
        403,
        "FORBIDDEN",
        "FORBIDDEN: You do not have permission to perform this action."
      );
    }
  }

  request.status = nextStatus;

  const session = options && options.startTransaction ? options : options?.session;
  if (session) {
    return request.save({ session });
  }

  return request.save();
};

export { transitionRequest, transitions, TERMINAL_STATES, SYSTEM_ONLY_ACTIONS };
export default { transitionRequest, transitions, TERMINAL_STATES, SYSTEM_ONLY_ACTIONS };