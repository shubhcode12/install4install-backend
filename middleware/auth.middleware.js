const admin = require("firebase-admin");

const authMiddleware = async (req, res, next) => {
    try {
        const authToken = req.headers.authorization.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(authToken);
        req.userData = decodedToken;
        console.log(decodedToken);
        next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized" });
    }
};

module.exports = authMiddleware;
