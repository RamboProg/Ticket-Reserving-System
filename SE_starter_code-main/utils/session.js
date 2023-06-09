module.exports = {
  getSessionToken(req) {
    //console.log(req.headers.cookie)
    console.log("ye");
    if (!req.headers.cookie) {
      console.log("no cookie");
      return null;
    }
    const cookies = req.headers.cookie.split(';')
      .map(function (cookie) { return cookie.trim() })
      .filter(function (cookie) { return cookie.includes('session_token') })
      .join('');
      console.log("cookies");

    const sessionToken = cookies.slice('session_token='.length);
    if (!sessionToken) {
      return null;
    }
    
    return sessionToken;
  }
}