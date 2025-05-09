require("dotenv").config();
const tokenService = require("../service/token/tokenService");
const ErrorHandler = require("../Error/error");

const authMiddleware = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const refreshToken = req.headers["x-refresh-token"]; // Получаем refreshToken из заголовка
    console.log("Заголовок Authorization:", authHeader);
    console.log("Заголовок X-Refresh-Token:", refreshToken);

    if (!authHeader) {
      throw ErrorHandler.error(401, "Токен доступа отсутствует");
    }

    const [bearer, accessToken] = authHeader.split(" ");
    if (bearer !== "Bearer" || !accessToken) {
      throw ErrorHandler.error(401, "Неверный формат токена доступа");
    }

    if (!refreshToken) {
      throw ErrorHandler.error(401, "Токен обновления отсутствует");
    }

    let userData;
    try {
      userData = tokenService.validateToken(process.env.JWT_ACCESS_KEY, accessToken);
      console.log("Access Token валиден:", userData);
    } catch (accessError) {
      console.log("Access Token истек или недействителен:", accessError.message);

      // Пытаемся валидировать refreshToken
      userData = tokenService.validateToken(process.env.JWT_REFRASH_KEY, refreshToken);
      if (!userData) {
        throw ErrorHandler.error(401, "Недействительный токен обновления");
      }

      const tokenFromDb = await tokenService.findToken(refreshToken);
      if (!tokenFromDb) {
        throw ErrorHandler.error(401, "Токен обновления не найден в БД");
      }

      const tokens = await tokenService.generateTokens({
        userId: userData.userId,
        email: userData.email,
        orgId: userData.orgId,
      });
      console.log("Новые токены сгенерированы");

      // Отправляем новый refreshToken и новый accessToken в заголовках
      res.setHeader("New-Access-Token", tokens.accessToken); // отправка нового accessToken
      res.setHeader("X-Refresh-Token", tokens.refreshToken); // отправка нового refreshToken
      req.user = userData;
      console.log("Токены обновлены, новый Access Token и Refresh Token отправлены");

      // Отправляем ответ с информацией о том, что токены обновлены
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: "Токены обновлены" }));
    }

    req.user = userData;
    console.log("Аутентификация успешна");

    // Если аутентификация успешна, отправляем ответ
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: "Аутентификация успешна", userData }));
  } catch (err) {
    console.error("Ошибка аутентификации:", err.message);

    // Отправляем ошибку с кодом состояния и сообщением
    res.writeHead(err.status || 500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      message: err.message || "Ошибка аутентификации",
    }));
  }
};

module.exports = authMiddleware;
