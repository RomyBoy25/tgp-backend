const sendSuccess = (
  res,
  message,
  data = null,
  pagination = null,
  status = 200
) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(status).json(response);
};

const sendError = (
  res,
  status,
  message,
  error = null
) => {
  return res.status(status).json({
    success: false,
    message,
    ...(error && { error }),
  });
};

module.exports = {
  sendSuccess,
  sendError,
};