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

const transitionRequest = (request, action, actor) => {
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

  return request.save();
};

export {
  transitionRequest,
};