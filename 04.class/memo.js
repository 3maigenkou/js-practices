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
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.db = new sqlite3.Database("memo.db", (err) => {
      if (err) {
        console.error(err.message);
        return;
      }
      this.#createTable();
    });
  }

  async run(argv = null) {
    try {
      const option = this.#parseOptions(argv);
      if (option.l) {
        await this.#list();
      } else if (option.r) {
        await this.#read();
      } else if (option.d) {
        await this.#delete();
      } else if (!process.stdin.isTTY) {
        await this.#createPipeline();
      } else {
        await this.#createQuestion();
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      this.#closeDbAndRl();
    }
  }

  #closeDbAndRl() {
    this.db.close((err) => {
      if (err) {
        console.error(err.message);
      }
    });
    this.rl.close();
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

  #parseOptions(argv) {
    return minimist(argv.slice(2), {
      boolean: ["l", "r", "d"],
      unknown: (errorOption) => {
        console.error(`Unknown option: ${errorOption}`);
        process.exit(9);
      },
    });
  }

  #insertMemo(title, content) {
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

  #getPipelineText() {
    return new Promise((resolve) => {
      let pipelineText = "";
      this.rl.on("line", (text) => {
        pipelineText += text;
      });

      this.rl.on("close", () => {
        resolve(pipelineText);
      });
    });
  }

  async #createPipeline() {
    try {
      const title = await this.#getPipelineText();
      await this.#insertMemo(title, "There is no content.");
      console.log(`Created. title:${title}`);
    } catch (err) {
      console.error(err.message);
    }
  }

  #rlQuestion(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }

  async #createQuestion() {
    try {
      const title = await this.#rlQuestion("Please enter the title.:");
      const content = await this.#rlQuestion("Please enter the content.:");
      await this.#insertMemo(title, content);
      console.log(`Created. title:${title}`);
    } catch (err) {
      console.error(err.message);
    }
  }

  #getMemoData() {
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

  async #list() {
    try {
      const memos = await this.#getMemoData();
      if (memos.length === 0) {
        console.log("There are no memos.");
        return;
      }
      memos.forEach((memo) => console.log(memo.title));
    } catch (err) {
      console.error(err.message);
    }
  }

  #select(message, choices) {
    const prompt = new Select({
      message: message,
      choices: choices,
    });
    return prompt.run();
  }

  async #getSelectedMemo(message) {
    const memos = await this.#getMemoData();
    if (memos.length === 0) {
      console.log("There are no memos.");
      return;
    }
    const selectedTitle = await this.#select(message, memos.map((memo) => memo.title));
    return memos.find((memo) => memo.title === selectedTitle);
  }

  async #read() {
    try {
      const readingMemo = await this.#getSelectedMemo("Please select the memo you would like to view.");
      if (readingMemo) {
        console.log(readingMemo.content);
      }
    } catch (error) {
      console.error(error);
    }
  }

  #deleteMemo(id) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM memo WHERE memo_id = ?", [id], (err) =>{
        if (err) {
          reject(err);
        } else{
          resolve()
        }
      })
    })
  }

  async #delete() {
    try {
      const selectedMemo = await this.#getSelectedMemo("Please select the memo you would like to delete.");
      if (selectedMemo) {
        await this.#deleteMemo(selectedMemo.memo_id);
        console.log("Deleted.");
      }
    } catch (error) {
      console.error(error);
    }
  }
}

new Memo().run(process.argv);
