let webmasterEmail = 'webmasters@grebelife.com';
let skybunkEmail = {
  user:"grebel_app@gmail.com",
  pass:'1234'
}

if (process.env.SKYBUNK_EMAIL_ADDR && process.env.SKYBUNK_EMAIL_PASS ) {
  skybunkEmail = {
    user:process.env.SKYBUNK_EMAIL_ADDR,
    pass:process.env.SKYBUNK_EMAIL_PASS
  }
}

if (process.env.WEBMASTER_EMAIL) {
  webmasterEmail = process.env.WEBMASTER_EMAIL;
}

module.exports = {
  postCharacterLimit: 1000,
  commentCharacterLimit: 500,
};
