var crypto = require('crypto');

var hash = crypto.createHash("sha1").update("DEFAULT").digest("hex");

console.info(hash);