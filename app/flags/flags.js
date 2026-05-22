require('dotenv').config({ quiet: true });

module.exports = {

  SQLI_FLAG: process.env.SQLI_FLAG,

  XSS_FLAG: process.env.XSS_FLAG,

  IDOR_FLAG: process.env.IDOR_FLAG,

  MASS_ASSIGNMENT_FLAG: process.env.MASS_ASSIGNMENT_FLAG

};
