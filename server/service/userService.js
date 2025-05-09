const TokenService = require("./token/tokenService");
const bcrypt = require("bcrypt");
const Data = require("../database/data");

class userService {
  async registration(email, password, name) {
    try {
      // Проверка, есть ли пользователь
      const user = await Data.getFind("users.json", {
        key: "email",
        value: email,
      });

      if (user) {
        throw ErrorHandler.error(
          400,
          "Пользователь с таким email уже существует"
        );
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const token = await TokenService.generateTokens({
        email,
        name,
      });

      // Создаём нового пользователя
      const newUser = {
        userId: Date.now().toString(),
        email: email,
        password: hashedPassword,
        name: name,
        refreshToken: token.refreshToken,
      };

      await Data.add("users.json", newUser);

      return newUser;
    } catch (err) {
      throw ErrorHandler.error(err.code || 500, err.message);
    }
  }

  async login(email, password, name) {
    try {
      // Проверка, есть ли пользователь
      const user = await Data.getFind("users.json", {
        key: "email",
        value: email,
      });

      if (!user) {
        throw ErrorHandler.error(400, "Пользователь не существует");
      }

      const hashedPassword = user.password;

      const match = await bcrypt.compare(password, hashedPassword);

      if (!match) {
        throw ErrorHandler.error(400, "Неправильный пароль");
      }

      const token = await TokenService.generateTokens({
        email,
        name,
      });

      await Data.updateByKey("users.json", "email", email, {
        refreshToken: token.refreshToken,
      });

      return {
        message: "Вы успешно вошли",
        accessToken: token.accessToken,
      };
    } catch (err) {
      throw ErrorHandler.error(err.code || 500, err.message);
    }
  }

  async logout(userId) {
    try {
      const user = await Data.getFind("users.json", {
        key: "userId",
        value: userId,
      });

      console.log(user);

      if (!user) {
        throw ErrorHandler.error(404, "Пользователь не найден");
      }

      if (!user.refreshToken) {
        throw ErrorHandler.error(400, "Токен обновления отсутствует");
      }

      const result = await TokenService.removeToken(user.refreshToken);

      return result;
    } catch (err) {
      throw ErrorHandler.error(err.code || 500, err.message);
    }
  }

  async addTask(userId, name, text) {
    try {
      console.log(userId, name, text);

      // Сначала получаем все задачи из файла
      const existingTasks = await Data.getAll("tasks.json");
      console.log("existingTasks:", existingTasks);

      // Проверяем, есть ли уже задача с таким же name и userId
      const taskExists = existingTasks.some(
        (task) => task.name === name && task.userId === userId
      );

      if (taskExists) {
        // Если такая задача уже есть, выбрасываем ошибку
        throw ErrorHandler.error(
          400,
          "Задача с таким названием для этого пользователя уже существует"
        );
      }

      // Если задачи нет, добавляем новую
      const data = await Data.add("tasks.json", {
        taskId: Date.now().toString(),
        name: name,
        text: text,
        userId: userId,
      });

      return data;
    } catch (err) {
      throw ErrorHandler.error(err.code || 500, err.message);
    }
  }

  async removeTask(userId, taskId) {
    try {
      const data = await Data.delete(
        "tasks.json",
        {
          taskId,
          userId,
        },
        "tasks"
      );
      return data;
    } catch (err) {
      throw ErrorHandler.error(err.code || 500, err.message);
    }
  }

  async updateTask(taskId, name, text) {
    try {
      const updates = {};
      if (name) updates.name = name;
      if (text) updates.text = text;

      if (Object.keys(updates).length > 0) {
        const data = await Data.updateByKey(
          "tasks.json",
          "taskId",
          taskId,
          updates
        );
        console.log("updateByKey: ", data);
        return data;
      } else {
        throw ErrorHandler.error(400, "Не указаны данные для обновления");
      }
    } catch (err) {
      throw ErrorHandler.error(err.code || 500, err.message);
    }
  }

  async getByIdTask(taskId) {
    try {
      const task = await Data.getFind("tasks.json", {
        key: "taskId",
        value: taskId,
      });

      if (!task) {
        throw ErrorHandler.error(
          404,
          `Задача с taskId = "${taskId}" не найдена`
        );
      }

      return task;
    } catch (err) {
      throw ErrorHandler.error(err.code || 500, err.message);
    }
  }

  async getAllUserTask(userId) {
    try {
      const tasks = await Data.getAll("tasks.json");
      return tasks.filter((task) => task.userId === userId);
    } catch (err) {
      throw ErrorHandler.error(err.code || 500, err.message);
    }
  }
}

module.exports = new userService();
