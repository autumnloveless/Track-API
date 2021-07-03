const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const usersDB = require('../database/controllers/users');

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) { return res.sendStatus(403) }
      req.user = user;
      next();
  })
}

exports.loginMatch = async (req, res, next) => {
  result = await usersDB.getUserByEmail(req.body.email);
  if (!result.success) { return res.status(400).json({ "success": false, "error": "Invalid email or password"}); }
  if (await bcrypt.compare(req.body.password, result.user.password)){
    req.user = {
      id: result.user.id,
      email: result.user.email,
      permissionLevel: result.user.permissionLevel,
      provider: 'email',
      firstName: result.user.firstName,
      lastName: result.user.lastName
    };
    return next();
  } else {
    return res.status(400).json({ "success": false, "error": "Invalid email or password"});
  }
}

exports.minRole = (requiredPermissionLevel) => async (req, res, next) => {
  if(req.user.permissionLevel >= requiredPermissionLevel){
    return next();
  } else {
    return res.status(403).json({ success: false });
  }
}

exports.isAllowed = (user, targetId) => {
  return (user?.permissionLevel > 2 || user?.id == targetId)
}