const fs = require("fs/promises");
const path = require("path");
const ErrorHandler = require("../Error/error");

// Тут я написал класс который позволит легко взаимодействовать с json
class Data {
  constructor() {
    this.baseDir = path.join(__dirname, "..", "json");
    fs.mkdir(this.baseDir, { recursive: true }).catch((err) => {
      console.error("Ошибка при создании папки json:", err);
    });
  }

  //фун создания json
  async create(filePath, data) {
    try {
      const fullPath = path.join(this.baseDir, filePath);

      // Проверяем, существует ли файл
      try {
        await fs.access(fullPath);
        console.log(`Файл ${filePath} уже существует, пропускаем создание.`);
        return;
      } catch {
        // Файл не существует — создаём
        await fs.writeFile(fullPath, JSON.stringify(data, null, 2), "utf-8");
        console.log(`Файл ${filePath} создан.`);
      }
    } catch (err) {
      console.error("Ошибка при создании файла:", err);
      throw err;
    }
  }

  //фун добавление новый объект
  async add(name, data) {
    //получаем полный путь к папке
    const filePath = path.join(this.baseDir, name);

    try {
      //читаем json
      const fileContent = await fs.readFile(filePath, "utf-8");
      //парсим json
      const jsonData = JSON.parse(fileContent);

      //добавляем новый объект
      jsonData.users.push(data);
      //обнавляем updatedAt
      jsonData.updatedAt = new Date().toISOString();

      //Сохраняем обнавленный объект в файл
      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
      console.log("Файл обновлён!");
    } catch (err) {
      ErrorHandler.error(err.code || 500, err.message);
    }
  }

  //фун получение всех данных определенного json
  async getAll(name) {
    // получаем полный путь к json
    const filePath = path.join(this.baseDir, name);

    try {
      //читаем json
      const fileContent = await fs.readFile(filePath, "utf-8");
      //парсим json
      const jsonData = JSON.parse(fileContent);
      //отправляем данные
      return jsonData.users;
    } catch (err) {
      ErrorHandler.error(err.code || 500, err.message);
    }
  }

  //фун фильтрация данных
  async getFind(name, where) {
    // получаем полный путь к json
    const filePath = path.join(this.baseDir, name);

    try {
      //читаем json
      const fileContent = await fs.readFile(filePath, "utf-8");
      //парсим json
      const jsonData = JSON.parse(fileContent);

      //фильтруем данные
      return jsonData.users.find((user) => user[where.key] === where.value);
    } catch (err) {
      ErrorHandler.error(err.code || 500, err.message);
    }
  }
}

module.exports = new Data();
