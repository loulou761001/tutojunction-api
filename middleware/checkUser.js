// middleware
module.exports = {
  checkRole: function (req, res, next) {
    console.log("middle");
    next();
  },
};
