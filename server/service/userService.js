const ErrorHandler = require("../Error/error");
const Data = require("../database/data");
const bcrypt = require('bcrypt');

class userService {
  async registration(email, password, name) {
    try {
      // Проверка, есть ли пользователь
      const user = await Data.getFind("users.json", { key: "email", value: email });

      if (user) {
        throw ErrorHandler.error(400, "Пользователь с таким email уже существует");
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Создаём нового пользователя
      const newUser = {
        id: Date.now(),
        email,
        password,
        name,
      };

      await Data.add("users.json", newUser);

      return {
        message: "Пользователь успешно зарегистрирован",
        user: newUser,
      };
    } catch (err) {
      throw ErrorHandler.error(err.code || 500, err.message);
    }
  }
}

module.exports = new userService();
