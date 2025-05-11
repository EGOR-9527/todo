require("dotenv").config();
const http = require("http");
const startRouters = require("./router/index");
const createBD = require("./database/creteBD");
const ErrorHandler = require("./Error/error");

const PORT = process.env.PORT;

// Создаём HTTP сервер
const server = http.createServer(async (req, res) => {
  try {
    // Устанавливаем CORS-заголовки
    res.setHeader("Access-Control-Allow-Origin", process.env.URL_CLIENT); // Можно указать конкретный домен вместо "*"
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Обрабатываем обычные запросы
    await startRouters(req, res);
  } catch (err) {
    console.error(
      "Произошла ошибка при настройке базы данных или работе с маршрутизатором:",
      err
    );
    res.setHeader("Content-Type", "application/json");
    res.statusCode = err.code || 500;
    res.end(JSON.stringify(ErrorHandler.error(err.code, err.message)));
  }
});

const start = async () => {
  try {
    await createBD();
    server.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Ошибка при старте сервера:", err);
    process.exit(1);
  }
};

start();
