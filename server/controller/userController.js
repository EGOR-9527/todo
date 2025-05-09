const ErrorHandler = require("../Error/error");
const userService = require("../service/userService");

class userController {
  async registration(req, res) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 400;
        res.end(
          JSON.stringify(ErrorHandler.error(400, "Вы заполнили не все поля"))
        );
        return;
      }

      const data = await userService.registration(email, password, name);
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    } catch (err) {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = err.code || 500;
      res.end(JSON.stringify(ErrorHandler.error(err.code, err.message)));
    }
  }

  async login(req, res) {
    try {
      // Логика для логина
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({ message: "Login successful" }));
    } catch (err) {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = err.code || 500;
      res.end(JSON.stringify(ErrorHandler.error(err.code, err.message)));
    }
  }

  async logout(req, res) {
    try {
      // Логика для логаута
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify({ message: "Logout successful" }));
    } catch (err) {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = err.code || 500;
      res.end(JSON.stringify(ErrorHandler.error(err.code, err.message)));
    }
  }
}

module.exports = new userController();
