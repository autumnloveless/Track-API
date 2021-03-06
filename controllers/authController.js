const authDB = require("../database/controllers/auth");
const usersDB = require("../database/controllers/users");
const resetTokenDB = require("../database/controllers/resetToken");
const mailer = require("../mail/mailer");
const moment = require("moment");
jwt = require("jsonwebtoken")

exports.refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refresh_token;
    if(refreshToken == null) { return res.status(200).json({success: false}) }
    authResult = await authDB.getAuthByRefreshToken(refreshToken);
    if(!authResult.success) { return res.status(200).json({success: false}) }
    
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, token) => {
        if(err) { return res.sendStatus(403) }
        const { user } = await usersDB.getUserById(token.id)
        const { success, accessToken } = await authDB.regenerateToken(authResult.auth.id, { 
            "id": token.id, 
            "permissionLevel": token.permissionLevel 
        });
        
        res.status(success ? 200 : 400).json({ success: success, accessToken: accessToken, user: user })
    })
}

exports.login = async (req, res) => {
    const user = { 
        "id": req.user.id,
        "permissionLevel": req.user.permissionLevel
    }
    if(req.cookies?.refresh_token) { await authDB.deleteAuth(req.cookies.refresh_token) }
    const result = await authDB.generateToken(user)
    if(req.body.remember_me){
        res.cookie('refresh_token', result.refreshToken, { secure: true, sameSite: "none", httpOnly: true, path: "/api/auth", expires: moment().add(7,'days').toDate() });
    }
    res.status(result.success ? 200 : 400).json({ success: result.success, accessToken: result.accessToken, user: req.user })
}

exports.logout = async (req, res) => {
    result = await authDB.deleteAuth(req.token)
    res.status(result.success ? 200 : 400).json(result)
}

exports.forgotPassword = async (req, res) => {
    const { success, user } = await usersDB.getUserByEmail(req.body.email);
    if(!success) { return res.status(200).json({ success: true}); } // show same message if success or failure
    let { token }  = await resetTokenDB.createResetToken({ 
        userId: user.id,
        expiration: moment().add(30,'minutes').toDate()
    });

    // mail forgot password link
    const resetLink = process.env.FRONTEND_URL + '/#/reset_password/' + token.id;
    await mailer.forgotPassword(user.email, resetLink);
    return res.status(200).json({ success: true});
}

exports.resetPassword = async (req, res) => {
    // check reset token
    const { token } = await resetTokenDB.getResetTokenById(req.body.tokenId);
    // update password
    let result = await usersDB.updateUser(token.userId, { password: req.body.password });
    resetTokenDB.deleteResetToken(token.id);
    return res.status(result.success ? 200 : 400).json({ success: result.success });
}

exports.register = async (req,res) => {
    let result = await usersDB.createUser({
        "firstName": req.body.firstName,
        "lastName": req.body.lastName,
        "email": req.body.email,
        "password": req.body.password,
        "permissionLevel": 1,
    })
    if (!result.success) { return res.status(400).json(result) }
    const {success:tokenSuccess, accessToken, refreshToken } = await authDB.generateToken({ 
        id: result.user.id, 
        permissionLevel: result.user.permissionLevel 
    });

    res.cookie('refresh_token', refreshToken, { secure: true, httpOnly: true, path: "/api/token", expires: moment().add(7,'days').toDate() });
    res.status(200).json({ success: true, accessToken: accessToken, user: result.user })
}

exports.registerAdmin = async (req,res) => {
    result = await usersDB.createUser({
        "firstName": req.body.firstName,
        "lastName": req.body.lastName,
        "email": req.body.email,
        "password": req.body.password,
        "permissionLevel": 2,
    })
    res.status(result.success ? 200 : 400).json(result)
}