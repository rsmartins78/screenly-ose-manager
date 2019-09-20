module.exports = {
  async Login(req, res) {
    res.render("index", { page: "Login", menuId: "login" });
  },
  async Home(req, res) {
    res.render("home", { page: "Home", menuId: "home" });
  },
  async Redirect(req, res) {
    res.redirect("/home");
  },
  async Assets(req, res) {
    res.render("assets", { page: "Assets", menuId: "assets" });
  },
  async Users(req, res) {
    res.render("users", { page: "Users", menuId: "users" });
  }
};
