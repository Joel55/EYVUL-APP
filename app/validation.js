const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,32}$/;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
  function isValidUsername(username) {
    return typeof username === 'string' && USERNAME_PATTERN.test(username);
  }
 
  function isValidEmail(email) {
    return typeof email === 'string' && email.length <= 254 && EMAIL_PATTERN.test(email);
  }
 
  function isValidPassword(password) {
    return typeof password === 'string' && password.length >= 12 && password.length <= 128;
  }
 
  function isValidComment(comment) {
    return typeof comment === 'string' &&
      comment.trim().length > 0 &&
      comment.length <= 1000;
  }
 
  module.exports = {
    isValidUsername,
    isValidEmail,
    isValidPassword,
    isValidComment
  };