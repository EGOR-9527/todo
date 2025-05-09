require("dotenv").config();
const jwt = require("jsonwebtoken");
const Data = require("../../database/creteBD");
const ErrorHandler = require("../../Error/error");

class TokenService {
  generateTokens(payload) {
    try {
      if (!process.env.JWT_ACCESS_KEY || !process.env.JWT_REFRASH_KEY) {
        console.log(
          ErrorHandler.error(500, "Секретный ключ JWT не был получен")
        );
        return null;
      }

      const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_KEY, {
        expiresIn: "15m",
      });
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRASH_KEY, {
        expiresIn: "30d",
      });

      return { accessToken, refreshToken };
    } catch (err) {
      console.log(ErrorHandler.error(500, err.message));
      return null;
    }
  }

  validateToken(token, secretKey) {
    try {
      return jwt.verify(token, secretKey);
    } catch (err) {
      console.log(ErrorHandler.error(500, err.message));
      return null;
    }
  }

  async saveToken(email, refreshToken) {
    try {
      const tokenData = await Data.getFind('users.json', { key: 'refreshToken', value: refreshToken });
      if (tokenData) {
        tokenData.refreshToken = refreshToken;
        await Data.add('users.json', tokenData);
        return tokenData;
      }

      const newUser = {
        id: Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000,
        email: email,
        refreshToken: refreshToken,
      };
      await Data.add("users.json", newUser);
      return newUser;
    } catch (err) {
      console.log(ErrorHandler.error(500, err.message));
      return null;
    }
  }

  async removeToken(refreshToken) {
    try {
      if (!refreshToken) {
        console.log(ErrorHandler.error(500, "Refresh token не определен"));
        return null;
      }

      const user = await Data.getFind('users.json', { key: 'refreshToken', value: refreshToken });
      if (user) {
        user.refreshToken = null;
        await Data.add('users.json', user);
        return "Токен пользователя успешно удален";
      } else {
        return "Пользователь с таким токеном не найден";
      }
    } catch (error) {
      console.error("Ошибка удаления токена пользователя:", error);
      throw error;
    }
  }

  async findToken(refreshToken) {
    try {
      return await Data.getFind('users.json', { key: 'refreshToken', value: refreshToken });
    } catch (error) {
      console.error("Ошибка поиска токена:", error);
      return null;
    }
  }
}

module.exports = new TokenService();
