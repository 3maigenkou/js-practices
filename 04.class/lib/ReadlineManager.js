import readline from "readline";

export default class ReadlineManager {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  close() {
    this.rl.close((err) => {
      if (err) {
        console.error(err.message);
      }
    });
  }

  getPipelineText() {
    return new Promise((resolve) => {
      let pipelineText = [];
      this.rl.on("line", (text) => {
        pipelineText.push(text);
      });

      this.rl.on("close", () => {
        resolve(pipelineText);
      });
    });
  }

  rlQuestion(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }
}
