const transitions = {
  draft: {
    publish: "published",
  },

  published: {
    match: "matched",
    cancel: "cancelled",
    expire: "expired",
  },

  matched: {
    accept: "accepted",
    cancel: "cancelled",
  },

  accepted: {
    complete: "fulfilled",
  },
};

const transitionRequest = (request, action, actor, session = null) => {
  
  if (
    actor.role !== "admin" &&
    String(request.requesterId) !== String(actor._id)
  ) {
    const error = new Error("FORBIDDEN: You do not have permission to perform this action.");
    error.statusCode = 403;
    return Promise.reject(error);
  }

  const currentStatus = request.status;
  const nextStatus =
    transitions[currentStatus] &&
    transitions[currentStatus][action];

  if (!nextStatus) {
    return Promise.reject(
      new Error(
        `Invalid transition: ${currentStatus} -> ${action}`
      )
    );
  }

  request.status = nextStatus;

  if (session) {
    return request.save({ session });
  }

  return request.save();
};

export { transitionRequest };