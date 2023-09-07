import MemoDatabase from "./MemoDatabase.js";
import MemoOption from "./MemoOption.js";
import ReadlineManager from "./ReadlineManager.js";
import MemoSelector from "./MemoSelector.js";

export default class Memo {
  constructor() {
    this.readlineManager = new ReadlineManager();
    this.memoDatabase = new MemoDatabase();
    this.memoOption = new MemoOption(process.argv);
    this.memoSelector = new MemoSelector();
  }

  async run() {
    try {
      const option = this.memoOption.parseOptions();
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
      this.memoDatabase.close();
      this.readlineManager.close();
    }
  }

  async #createPipeline() {
    try {
      const pipelineText = await this.readlineManager.getPipelineText();
      const title = pipelineText[0];
      const content = pipelineText.slice(1).join("\n");
      await this.memoDatabase.saveMemo(title, content);
      console.log(`Created. title:${title}`);
    } catch (err) {
      console.error(err.message);
    }
  }

  async #createQuestion() {
    try {
      const title = await this.readlineManager.rlQuestion(
        "Please enter the title.:"
      );
      const content = await this.readlineManager.rlQuestion(
        "Please enter the content.:"
      );
      await this.memoDatabase.saveMemo(title, content);
      console.log(`Created. title:${title}`);
    } catch (err) {
      console.error(err.message);
    }
  }

  async #list() {
    try {
      const memos = await this.memoDatabase.getMemoData();
      if (memos.length === 0) {
        console.log("There are no memos.");
        return;
      }
      memos.forEach((memo) => console.log(memo.title));
    } catch (err) {
      console.error(err.message);
    }
  }

  async #read() {
    try {
      const readingMemo = await this.memoSelector.getSelectedMemo(
        "Please select the memo you would like to view."
      );
      if (readingMemo) {
        console.log(readingMemo.content);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async #delete() {
    try {
      const selectedMemo = await this.memoSelector.getSelectedMemo(
        "Please select the memo you would like to delete."
      );
      if (selectedMemo) {
        await this.memoDatabase.deleteMemo(selectedMemo.memo_id);
        console.log("Deleted.");
      }
    } catch (error) {
      console.error(error);
    }
  }
}
