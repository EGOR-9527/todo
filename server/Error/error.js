//Обработка ошибок
class ErrorHandler {
  //фун для добавленя ошибок
  error(code, message) {
    if (typeof code === "number" || !Number.isInteger(code)) {
      throw new Error("Error code must be an integer");
    }

    if (typeof message !== "string" || message.trim() === "") {
      throw new Error("Error message must be a non-empty string");
    }

    console.log(code, message);
    return { code, message };
  }
}

module.exports = new ErrorHandler();
