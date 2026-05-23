/**
 * Executes a mongoose query with pagination.
 * Accepts a pre-built query and a separate count filter to avoid
 * cloning issues when skip/limit are applied.
 */
const paginate = async (Model, filter, queryBuilder, page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page) || 1)
  const l = Math.min(50, Math.max(1, parseInt(limit) || 10))
  const skip = (p - 1) * l

  const [data, total] = await Promise.all([
    queryBuilder.skip(skip).limit(l),
    Model.countDocuments(filter),
  ])

  return {
    data,
    pagination: {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
      hasNext: p * l < total,
      hasPrev: p > 1,
    },
  }
}

module.exports = paginate
