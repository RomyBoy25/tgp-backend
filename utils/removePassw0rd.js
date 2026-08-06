const removePassword = (user) => {
  const data = user.toObject();
  delete data.password;
  return data;
};

module.exports = removePassword;