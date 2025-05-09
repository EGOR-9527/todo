const router = require("./router");
const userController = require("../controller/userController");

// Тут все роутеры
router.post("/login", userController.login);

// Тут запускается обработка роутеров
const startRouters = (req, res) => {
    router.handle(req, res);
};

module.exports = startRouters;
