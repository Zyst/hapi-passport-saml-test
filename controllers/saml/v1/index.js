exports.main = function (request, reply) {
    console.log(request.auth);
    return reply(`Secure page for user ${request.auth.credentials.username}. <a href="/api/sso/v1/logout">Click to logout</a>.`);
}
exports.init = function (request, reply) {
    console.log(request.auth);
    return reply('Public page');
}
/**
 * Logout
 * @function
 * @param {Object} request - A Hapi Request
 * @param {Object} reply - A Hapi Reply
 */
exports.logout = function (request, reply) {
    request.server.saml().requestLogout(request.auth.credentials, (err, url) => {
        return reply.redirect(url);
    });
};

exports.notifylogout = function (request, reply) {
    const cookieName = request.server.saml().getCookieName();
    return reply.state(cookieName, null).redirect('/');
};