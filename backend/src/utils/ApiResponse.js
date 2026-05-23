class ApiResponse {
  constructor(res) {
    this.res = res
  }

  success(data = null, message = 'Success', statusCode = 200) {
    return this.res.status(statusCode).json({
      success: true,
      message,
      data,
    })
  }

  created(data = null, message = 'Created successfully') {
    return this.success(data, message, 201)
  }

  paginated(data, pagination, message = 'Success') {
    return this.res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    })
  }

  noContent() {
    return this.res.status(204).send()
  }
}

const respond = (res) => new ApiResponse(res)

module.exports = respond
