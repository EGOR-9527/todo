const router = require("./router");
const userController = require("../controller/userController");
const ErrorHandler = require("../Error/error");
const authMiddleware = require("../middlewares/authMiddleware")

// Тут все роутеры
router.post("/registration", (req, res) =>
  userController.registration(req, res)
);
router.post("/login", (req, res) => userController.login(req, res));
router.post("/logout", (req, res) => userController.logout(req, res));
router.post("/addtask", (req, res) => [userController.addTask(req, res), authMiddleware(req, res)]);

router.post("/getallusertask", (req, res) =>
  [userController.getAllUserTask(req, res), authMiddleware(req, res)]
);

router.post("/getbyidtask", (req, res) => [userController.getByIdTask(req, res), authMiddleware(req, res)]);

router.delete("/removetask", (req, res) => [userController.removeTask(req, res), authMiddleware(req, res)]);
router.put("/updatetask", (req, res) => [userController.updateTask(req, res), authMiddleware(req, res)]);

const startRouters = (req, res) => {
  let body = "";

  // Сразу отсекаем GET-запросы — им тело обычно не нужно
  if (req.method === "GET") {
    req.body = {};
    return router.handle(req, res);
  }

  // Слушаем тело
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      if (body && req.headers["content-type"] === "application/json") {
        req.body = JSON.parse(body);
      } else {
        req.body = {};
      }

      router.handel(req, res);
    } catch (err) {
      res.statusCode = err.code;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(ErrorHandler.error(err.code, err.message)));
    }
  });

  req.on("error", (err) => {
    res.statusCode = err.code;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(ErrorHandler.error(err.code, err.message)));
  });
};

module.exports = startRouters;
