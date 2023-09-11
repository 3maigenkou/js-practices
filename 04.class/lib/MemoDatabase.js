import sqlite3 from "sqlite3";

export default class MemoDatabase {
  constructor() {
    this.db = new sqlite3.Database("memo.db", (err) => {
      if (err) {
        console.error(err.message);
        return;
      }
      this.#createTable();
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error(err.message);
      }
    });
  }

  #createTable() {
    const sql = `CREATE TABLE IF NOT EXISTS memo(
                  memo_id INTEGER PRIMARY KEY AUTOINCREMENT,
                  title Text NOT NULL,
                  content Text
                  )
                 `;
    this.db.run(sql, (err) => {
      if (err) {
        console.error(err.message);
      }
    });
  }

  findAll() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM memo", [], (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM memo WHERE memo_id = ?", [id], (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  saveMemo(title, content) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO memo (title, content) VALUES(?,?)",
        [title, content],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  deleteMemo(id) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM memo WHERE memo_id = ?", [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
