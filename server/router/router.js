const ErrorHandler = require("../Error/error");

class Router {
  //создаем объект для роутеров
  constructor() {
    this.routers = new Map();
  }

  //фун get, записывает в объект url и callback
  get(url, callback) {
    this.routers.set(url, { method: "GET", callback: callback });
  }

  //фун post, записывает в объект url и callback

  post(url, callback) {
    this.routers.set(url, { method: "POST", callback: callback });
  }

  //фун put, записывает в объект url и callback
  put(url, callback) {
    this.routers.set(url, { method: "PUT", callback: callback });
  }

  //фун delete, записывает в объект url и callback
  delete(url, callback) {
    this.routers.set(url, { method: "DELETE", callback: callback });
  }

  //фун handel, используеться для обработки запросов
  handel(req, res) {
    //получаем url и метод
    const { method, url } = req;

    //получаем роутер по url
    const route = this.routers.get(url);

    //проверяем есть ли такой роутер или метод
    if (!route || route.method !== method) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(ErrorHandler.error(404, "Сервер не получил ответ от пользователя")));
    }

    //вызываем callback
    try {
      if (Array.isArray(route.callback)) {
        route.callback.forEach((callback) => {
          callback(req, res);
        });
      } else {
        route.callback(req, res);
      }
    } catch (err) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(ErrorHandler.error(err.code, err.message)));
    }
  }
}
const router = new Router();

module.exports = router;
