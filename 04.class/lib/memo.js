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
        await this.#create();
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      this.memoDatabase.close();
      this.readlineManager.close();
    }
  }

  async #create() {
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

  async #list() {
    try {
      const memos = await this.memoDatabase.findAll();
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
      const selectedMemoId = await this.memoSelector.getSelectedMemoId(
        "Please select the memo you would like to view."
      );
      if (selectedMemoId) {
        const readingMemo = await this.memoDatabase.findById(selectedMemoId);
        console.log(readingMemo.content);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async #delete() {
    try {
      const selectedMemoId = await this.memoSelector.getSelectedMemoId(
        "Please select the memo you would like to delete."
      );
      if (selectedMemoId) {
        await this.memoDatabase.deleteMemo(selectedMemoId);
        console.log("Deleted.");
      }
    } catch (error) {
      console.error(error);
    }
  }
}
