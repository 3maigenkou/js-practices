import sqlite3 from "sqlite3";
import minimist from "minimist";
import enquirer from "enquirer";
const { Select } = enquirer;
import readline from "readline";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

class Memo {
  constructor(option = null) {
    this.option = option;
    this.db = new sqlite3.Database("memo.db");
    this.createTable();
    this.run();
  }

  run() {
    const option = this.memoFunction();

    if (option.l) {
      this.list();
    } else if (option.r) {
      this.read();
    } else if (option.d) {
      this.delete();
    } else if (!process.stdin.isTTY) {
      this.createPipeline();
    } else {
      this.createQuestion();
    }
  }

  createTable() {
    const sql = `CREATE TABLE IF NOT EXISTS memo(
                  memo_id INTEGER PRIMARY KEY AUTOINCREMENT,
                  title Text,
                  content Text
                  )
                 `;
    this.db.run(sql);
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

  createPipeline() {
    process.stdin.on("data", (text) => {
      const memo = text.toString();
      this.db.run("INSERT INTO memo (title) VALUES(?)", [memo]);
      console.log("Created.");
    });
  }

  createQuestion() {
    rl.question("title:", (answer1) => {
      rl.question("content:", (answer2) => {
        this.db.run("INSERT INTO memo (title, content) VALUES(?,?)", [
          answer1,
          answer2,
        ]);
        console.log("Created.");
        rl.close();
      });
    });
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
        choices: memos.map((memo) => memo.title),
      });
      prompt
        .run()
        .then((answer) => {
          let selectedMemo = memos.find((memo) => memo.title === answer);
          console.log(selectedMemo.content);
        })
        .catch(console.error);
    });
  }

  delete() {
    this.db.all("SELECT * FROM memo", (error, memos) => {
      if (error) {
        console.log(error);
        return;
      }
      const prompt = new Select({
        name: "deleteMemo",
        message: "Choose a note you want to delete:",
        choices: memos.map((memo) => memo.title),
      });
      prompt
        .run()
        .then((answer) => {
          let selectedMemo = memos.find((memo) => memo.title === answer);
          this.db.run("DELETE FROM memo WHERE memo_id = ?", [
            selectedMemo.memo_id,
          ]);
          console.log("Deleted.");
        })
        .catch(console.error);
    });
  }
}

new Memo(process.argv);
