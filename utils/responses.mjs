export const response = async (statusCode, data) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify({
      data,
    }),
  };
};
