const generateMessageObject = ({ message, userName }) => {
  const date = new Date();
  return {
    message,
    createdAt: date.getTime(),
    userName,
  };
};

module.exports = { generateMessageObject };
