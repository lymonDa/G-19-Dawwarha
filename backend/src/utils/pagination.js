const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function getPagination(query = {}) {
  const page = Math.max(DEFAULT_PAGE, Number.parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(query.limit, 10) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPagination({ page, limit, total }) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

export default getPagination;