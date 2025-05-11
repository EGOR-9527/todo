const fs = require("fs/promises");
const path = require("path");
const ErrorHandler = require("../Error/error");

// Создаю класс Data для работы с JSON-файлами как с простой базой данных
class Data {
  constructor() {
    // Определяю путь к папке, где будут храниться все JSON-файлы
    this.baseDir = path.join(__dirname, "..", "json");

    // Убеждаюсь, что папка существует, если нет — создаю её
    fs.mkdir(this.baseDir, { recursive: true }).catch((err) => {
      // Если возникла ошибка при создании папки, вывожу её в консоль
      console.error("Ошибка при создании папки json:", err);
    });
  }

  // Метод для создания JSON-файла (если его ещё нет)
  async create(filePath, data) {
    try {
      // Формирую полный путь к файлу
      const fullPath = path.join(this.baseDir, filePath);

      try {
        // Проверяю, существует ли файл
        await fs.access(fullPath);
        // Если файл существует, вывожу сообщение и выхожу из метода
        console.log(`Файл ${filePath} уже существует, пропускаем создание.`);
        return;
      } catch {
        // Если файла нет — создаю новый и записываю данные в него
        console.log(`Файл ${filePath} создан.`);
        return await fs.writeFile(
          fullPath,
          JSON.stringify(data, null, 2), // Преобразую данные в строку JSON с красивым форматированием
          "utf-8" // Указываю кодировку
        );
      }
    } catch (err) {
      // Если возникла ошибка при создании файла, вывожу её в консоль и выбрасываю дальше
      console.error("Ошибка при создании файла:", err);
      throw err;
    }
  }

  // Метод для добавления нового объекта (например, пользователя) в файл
  async add(name, data) {
    // Формирую путь к файлу
    const filePath = path.join(this.baseDir, name);
    console.log("add: " + name, data); // Логирую имя файла и данные

    try {
      // Читаю содержимое файла
      const fileContent = await fs.readFile(filePath, "utf-8");
      // Преобразую содержимое файла из JSON в объект
      const jsonData = JSON.parse(fileContent);

      // Удаляю формат из имени файла
      let section = name.replace(".json", "");

      // Если секция не является массивом, создаю пустой массив
      if (!Array.isArray(jsonData[section])) {
        jsonData[section] = [];
      }

      // Проверяю на дубликаты по уникальному полю (например, email или taskId)
      const existing = jsonData[section].find(
        (item) => item.name === data.name
      );

      // Если объект с таким именем уже существует, выбрасываю ошибку
      if (existing) {
        throw ErrorHandler.error(
          400,
          "Такое имя уже существует"
        );
      }

      // Добавляю новый объект в секцию
      jsonData[section].push(data);
      // Обновляю дату последнего изменения
      jsonData.updatedAt = new Date().toISOString();

      console.log("Файл обновлён!"); // Логирую успешное обновление
      // Записываю обновлённые данные обратно в файл
      await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
      return data; // Возвращаю добавленные данные
    } catch (err) {
      // Если возникла ошибка, выбрасываю её с кодом и сообщением
      throw ErrorHandler.error(err.code || 500, err.message);
    }
  }

  // Метод для обновления объекта по ключу (например, email или id)
  async updateByKey(fileName, key, value, updates) {
    // Формирую путь к файлу
    const filePath = path.join(this.baseDir, fileName);

    try {
      // Читаю содержимое файла
      const fileContent = await fs.readFile(filePath, "utf-8");
      // Преобразую содержимое файла из JSON в объект
      const jsonData = JSON.parse(fileContent);

      // Проверяю, что мы работаем с задачами, а не пользователями
      const tasks = jsonData.tasks || [];
      // Ищу индекс задачи по заданному ключу и значению
      const index = tasks.findIndex((task) => task[key] === value);

      // Если задача не найдена, выбрасываю ошибку
      if (index === -1) {
        throw ErrorHandler.error(
          404,
          `Задача с ${key} = "${value}" не найдена`
        );
      }

      // Объединяю старые данные с новыми
      tasks[index] = { ...tasks[index], ...updates };

      // Обновляю данные в объекте
      jsonData.tasks = tasks;
      jsonData.updatedAt = new Date().toISOString(); // Обновляю дату последнего изменения

      console.log("Задача обновлена!"); // Логирую успешное обновление
      // Записываю обновлённые данные обратно в файл
      return await fs.writeFile(
        filePath,
        JSON.stringify(jsonData, null, 2),
        "utf-8"
      );
    } catch (err) {
      // Обрабатываю ошибки, выводя их в консоль и выбрасывая дальше
      const errorCode = err.code || 500;
      const errorMessage = err.message || "Неизвестная ошибка";
      console.error("Ошибка при обновлении:", err);
      throw ErrorHandler.error(errorCode, errorMessage);
    }
  }

  // Метод для получения всех пользователей из файла
  async getAll(name) {
    console.log("getAll: " + name); // Логирую имя файла
    const filePath = path.join(this.baseDir, name); // Формирую путь к файлу

    try {
      // Читаю содержимое файла
      const fileContent = await fs.readFile(filePath, "utf-8");
      // Преобразую содержимое файла из JSON в объект
      const jsonData = JSON.parse(fileContent);

      console.log("jsonData:", jsonData); // Логирую данные
      return jsonData.tasks; // Возвращаю массив задач
    } catch (err) {
      // Обрабатываю ошибки, выбрасывая их с соответствующим кодом
      const statusCode = Number.isInteger(err.code) ? err.code : 500;
      throw ErrorHandler.error(statusCode, err.message);
    }
  }

  // Метод для удаления объекта из секции (например, из users)
  async delete(name, objectToDelete, section) {
    const filePath = path.join(this.baseDir, name); // Формирую путь к файлу

    try {
      // Читаю содержимое файла
      const fileContent = await fs.readFile(filePath, "utf-8");
      // Преобразую содержимое файла из JSON в объект
      const jsonData = JSON.parse(fileContent);

      // Проверяю, что секция является массивом
      if (!Array.isArray(jsonData[section])) {
        throw ErrorHandler.error(404, `Секция "${section}" не найдена`);
      }

      // Ищу индекс объекта для удаления
      const index = jsonData[section].findIndex(
        (item) =>
          item.taskId === objectToDelete.taskId &&
          item.userId === objectToDelete.userId
      );

      // Если объект не найден, выбрасываю ошибку
      if (index === -1) {
        throw ErrorHandler.error(404, `Объект не найден`);
      }

      // Удаляю объект из массива
      jsonData[section].splice(index, 1);
      jsonData.updatedAt = new Date().toISOString(); // Обновляю дату последнего изменения

      console.log(`Объект удалён из секции "${section}"!`); // Логирую успешное удаление
      // Записываю обновлённые данные обратно в файл
      return await fs.writeFile(
        filePath,
        JSON.stringify(jsonData, null, 2),
        "utf-8"
      );
    } catch (err) {
      // Обрабатываю ошибки, выводя их в консоль и выбрасывая дальше
      const errorCode = Number.isInteger(err.code) ? err.code : 500;
      const errorMessage = err.message || "Неизвестная ошибка";
      console.error("Ошибка при удалении:", err);
      throw ErrorHandler.error(errorCode, errorMessage);
    }
  }

  // Метод для поиска одного объекта по заданному ключу и значению
  async getFind(name, where) {
    const filePath = path.join(this.baseDir, name); // Формирую путь к файлу
    console.log("getFind: " + name, where); // Логирую имя файла и условия поиска

    let section = name.replace(".json", ""); // Удаляю расширение .json из имени файла

    try {
      // Читаю содержимое файла
      const fileContent = await fs.readFile(filePath, "utf-8");
      // Преобразую содержимое файла из JSON в объект
      const jsonData = JSON.parse(fileContent);

      // Проверяю, существует ли указанный раздел в данных
      if (!jsonData[section]) {
        throw new Error(`Секция ${section} не найдена в файле ${name}`);
      }

      // Ищу первый объект, у которого совпадает нужное поле
      return jsonData[section]
        ? jsonData[section].find((item) => item[where.key] === where.value)
        : null; // Возвращаю найденный объект или null, если не найден
    } catch (err) {
      // Обрабатываю ошибки, выводя их в консоль
      console.error("Ошибка при поиске объекта:", err);
      return null; // Возвращаю null, если произошла ошибка
    }
  }
}

// Экспортирую новый экземпляр класса Data
module.exports = new Data();