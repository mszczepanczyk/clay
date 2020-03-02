const normalizeUrl = require('normalize-url')

function normalize (url) {
  try {
    return normalizeUrl(url, {
      removeTrailingSlash: true,
      stripHash: true,
      stripProtocol: true,
      stripWWW: true
    })
  } catch {
    return url
  }
}

function isSocial (url) {
  const socialRegexps = [
    /^(https?:\/\/)?(mobile\.|www\.)?twitter.com\/.+$/,
    /^(https?:\/\/)?(www\.)?linkedin.com\/in\/.+$/,
    /^(https?:\/\/)?(www\.)?facebook.com\/.+$/
  ]
  return socialRegexps.some(regexp => regexp.test(url))
}

module.exports = {
  isSocial, normalize
}
