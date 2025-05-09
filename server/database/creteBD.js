const Data = require("./data");
const ErrorHandler = require("../Error/error");

const users = {users: [], updatedAt: new Date().toISOString()}
const tasks = {tasks: [], updatedAt: new Date().toISOString()}

const createBD  = async () => {
  try {
    await Data.create("users.json", users)
    await Data.create("tasks.json", tasks)
  } catch (err) {
    ErrorHandler.error(err.code, err.message)
  }
};


module.exports = createBD 