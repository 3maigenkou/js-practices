const sqlite3 = require("sqlite3").verbose();
const minimist = require("minimist");
const { Select } = require("enquirer");

class Memo {
  constructor(option = null) {
    this.option = option;
    this.db = new sqlite3.Database("memo.db");
    this.createTable();
    this.run();
    this.db.close();
  }

  run() {
    const option = this.memoFunction();

    if (option.l) {
      this.list();
    } else if (option.r) {
      this.read();
    } else if (option.d) {
      this.delete();
    } else {
      this.create();
    }
  }

  createTable() {
    this.db.run(
      `CREATE TABLE IF NOT EXISTS memo(
        memo_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title Text,
        content Text
        )
      `
    );
  }

  memoFunction() {
    return minimist(this.option.slice(2), {
      boolean: ["l", "r", "d"],
      unknown: (errorOption) => {
        console.error(`Unknown option: ${errorOption}`);
        process.exit(9);
      },
    });
  }

  create() {
    // INSERT INTO memo (title, content) VALUES ('?', '?');
  }

  list() {
    this.db.each("SELECT title FROM memo", (error, memo) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(memo.title);
    });
  }

  read() {
    this.db.all("SELECT * FROM memo", (error, memos) => {
      if (error) {
        console.log(error);
        return;
      }
      const prompt = new Select({
        name: "readMemo",
        message: "Choose a note you want to see:",
        choices: memos.map(memo => memo.title),
      });
      prompt.run()
        .then(answer => {
          let selectedMemo = memos.find(memo => memo.title === answer);
          console.log(selectedMemo.content);
        })
        .catch(console.error);
    });
  }

  delete() {
    // DELETE FROM memo WHERE memo_id = ?;
  }
}

new Memo(process.argv);
