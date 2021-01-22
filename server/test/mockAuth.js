/**
 * Mock authenticator for test purposes, returns token value as uid and 
 * rejects if passed in token is null
 */
class MockAuthenticator {
    verifyIdToken(token) {
        return new Promise((resolve, reject) => {
            if (token == null) {
                reject(new Error("Unauthorized"));
            }
            else {
                resolve({
                    uid: token,
                    admin: true,
                    artist: true
                });
            }
        })
    }
}

module.exports = MockAuthenticator;