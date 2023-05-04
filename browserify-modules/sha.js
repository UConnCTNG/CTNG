// https://github.com/emn178/js-sha256

// Does what the name implies
window.createHash = function(msg) {
  var sha256 = require('js-sha256');
  return sha256(msg)
}