const fs = require("fs/promises");
const path = require("path");
const ErrorHandler = require("../Error/error");

// Класс для работы с JSON-файлами как с простенькой базой
class Data {
  constructor() {
    // Путь до папки, где будут храниться все json-файлы
    this.baseDir = path.join(__dirname, "..", "json");

    // Убеждаемся, что папка существует, если нет — создаём
    fs.mkdir(this.baseDir, { recursive: true }).catch((err) => {
      console.error("Ошибка при создании папки json:", err);
    });
  }

  // Создание json-файла (если его ещё нет)
  async create(filePath, data) {
    try {
      const fullPath = path.join(this.baseDir, filePath);

      try {
        // Проверяем, существует ли файл
        await fs.access(fullPath);
        console.log(`Файл ${filePath} уже существует, пропускаем создание.`);
        return;
      } catch {
        // Файла нет — создаём новый и записываем данные
        console.log(`Файл ${filePath} создан.`);
        return await fs.writeFile(
          fullPath,
          JSON.stringify(data, null, 2), // красиво форматируем
          "utf-8"
        );
      }
    } catch (err) {
      console.error("Ошибка при создании файла:", err);
      throw err;
    }
  }

  // Добавление нового объекта (например, пользователя) в файл
  async add(name, data) {
    const filePath = path.join(this.baseDir, name);
    console.log("add: " + name, data);

    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const jsonData = JSON.parse(fileContent);

      //Удаляем формат
      let section = name.replace(".json", "");

      if (!Array.isArray(jsonData[section])) {
        jsonData[section] = [];
      }

      // Проверка на дубликаты по уникальному полю (например, email или taskId)
      const existing = jsonData[section].find(
        (item) => item.email === data.email || item.taskId === data.taskId
      );
      if (existing) {
        throw ErrorHandler.error(
          400,
          `Объект с таким идентификатором уже существует`
        );
      }

      jsonData[section].push(data);
      jsonData.updatedAt = new Date().toISOString();

      console.log("Файл обновлён!");
      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
      return data;
    } catch (err) {
      throw ErrorHandler.error(err.code || 500, err.message);
    }
  }

  // Обновление объекта по ключу (например, email или id)
  async updateByKey(fileName, key, value, updates) {
    const filePath = path.join(this.baseDir, fileName);

    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const jsonData = JSON.parse(fileContent);

      // Проверяем, что мы работаем с задачами, а не пользователями
      const tasks = jsonData.tasks || [];
      const index = tasks.findIndex((task) => task[key] === value);

      if (index === -1) {
        throw ErrorHandler.error(
          404,
          `Задача с ${key} = "${value}" не найдена`
        );
      }

      // Объединяем старые данные с новыми
      tasks[index] = { ...tasks[index], ...updates };

      jsonData.tasks = tasks;
      jsonData.updatedAt = new Date().toISOString();

      console.log("Задача обновлена!");
      return await fs.writeFile(
        filePath,
        JSON.stringify(jsonData, null, 2),
        "utf-8"
      );
    } catch (err) {
      const errorCode = err.code || 500;
      const errorMessage = err.message || "Неизвестная ошибка";
      console.error("Ошибка при обновлении:", err);
      throw ErrorHandler.error(errorCode, errorMessage);
    }
  }

  // Получить всех пользователей из файла
  async getAll(name) {
    console.log("getAll: " + name);
    const filePath = path.join(this.baseDir, name);

    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const jsonData = JSON.parse(fileContent);

      if (!Array.isArray(jsonData.tasks)) {
        throw ErrorHandler.error(
          400,
          "Неверный формат tasks.json: поле 'tasks' должно быть массивом"
        );
      }

      console.log("jsonData:", jsonData);
      return jsonData.tasks;
    } catch (err) {
      const statusCode = Number.isInteger(err.code) ? err.code : 500;
      throw ErrorHandler.error(statusCode, err.message);
    }
  }

  // Удаление объекта из секции (например, из users)
  async delete(name, objectToDelete, section) {
    const filePath = path.join(this.baseDir, name);

    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const jsonData = JSON.parse(fileContent);

      if (!Array.isArray(jsonData[section])) {
        throw ErrorHandler.error(404, `Секция "${section}" не найдена`);
      }

      const index = jsonData[section].findIndex(
        (item) =>
          item.taskId === objectToDelete.taskId &&
          item.userId === objectToDelete.userId
      );

      if (index === -1) {
        throw ErrorHandler.error(404, `Объект не найден`);
      }

      jsonData[section].splice(index, 1);
      jsonData.updatedAt = new Date().toISOString();

      console.log(`Объект удалён из секции "${section}"!`);
      return await fs.writeFile(
        filePath,
        JSON.stringify(jsonData, null, 2),
        "utf-8"
      );
    } catch (err) {
      const errorCode = Number.isInteger(err.code) ? err.code : 500;
      const errorMessage = err.message || "Неизвестная ошибка";
      console.error("Ошибка при удалении:", err);
      throw ErrorHandler.error(errorCode, errorMessage);
    }
  }

  // Поиск одного объекта по заданному ключу и значению
  async getFind(name, where) {
    const filePath = path.join(this.baseDir, name);
    console.log(name, where);

    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const jsonData = JSON.parse(fileContent);

      // Ищем первый объект, у которого совпадает нужное поле
      return jsonData.tasks
        ? jsonData.tasks.find((task) => task[where.key] === where.value)
        : null;
    } catch (err) {
      console.error("Ошибка при поиске объекта:", err);
      return null; // Возвращаем null, если произошла ошибка
    }
  }
}

module.exports = new Data();
