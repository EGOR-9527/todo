const ErrorHandler = require("../Error/error");
const userService = require("../service/userService");

class userController {
  async registration(req, res) {
    try {
      const { email, password, name } = req.body;
      console.log(email, password, name);

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
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 400;
        res.end(
          JSON.stringify(ErrorHandler.error(400, "Вы заполнили не все поля"))
        );
        return;
      }

      const data = await userService.login(email, password, name);

      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    } catch (err) {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = err.code || 500;
      res.end(JSON.stringify(ErrorHandler.error(err.code, err.message)));
    }
  }

  async logout(req, res) {
    try {
      const { userId } = req.body;
      console.log(userId);

      const data = await userService.logout(userId);
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    } catch (err) {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = err.code || 500;
      res.end(JSON.stringify(ErrorHandler.error(err.code, err.message)));
    }
  }

  async addTask(req, res) {
    try {
      const { userId, name, text } = req.body;

      if (!userId || !name || !text) {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 400;
        res.end(
          JSON.stringify(ErrorHandler.error(400, "Вы заполнили не все поля"))
        );
        return;
      }

      const data = await userService.addTask(userId, name, text);
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    } catch (err) {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = err.code || 500;
      res.end(JSON.stringify(ErrorHandler.error(err.code, err.message)));
    }
  }

  async removeTask(req, res) {
    try {
      const { userId, taskId } = req.body;
      console.log(userId, taskId);

      const data = await userService.removeTask(userId, taskId);
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    } catch (err) {
      res.setHeader("Content-Type", "application/json");

      res.statusCode = err.code || 500;
      res.end(JSON.stringify(ErrorHandler.error(res.statusCode, err.message)));
    }
  }

  async updateTask(req, res) {
    try {
      const { taskId, name, text } = req.body;

      const data = await userService.updateTask(taskId, name, text);
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    } catch (err) {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = err.code || 500;
      res.end(JSON.stringify(ErrorHandler.error(err.code, err.message)));
    }
  }

  async getByIdTask(req, res) {
    try {
      const { taskId } = req.body;
      console.log(taskId)

      const data = await userService.getByIdTask(taskId);
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    } catch (err) {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = err.code || 500;
      res.end(JSON.stringify(ErrorHandler.error(err.code, err.message)));
    }
  }

  async getAllUserTask(req, res) {
    try {
      const { userId } = req.body;

      const data = await userService.getAllUserTask(userId);
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    } catch (err) {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = err.code || 500;
      res.end(JSON.stringify(ErrorHandler.error(err.code, err.message)));
    }
  }
}

module.exports = new userController();
