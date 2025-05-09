require("dotenv").config();
const http = require("http");
const startRouters = require("./router/index");
const createBD = require("./database/creteBD");
const ErrorHandler = require("./Error/error");

const server = http.createServer(async (req, res) => {
  try {
    // Обрабатываем запросы через роутеры
    startRouters(req, res);
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

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    // Создаём базу данных
    await createBD();

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Ошибка при старте сервера:", err);
    process.exit(1);
  }
};

start();
