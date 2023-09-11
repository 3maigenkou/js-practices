import enquirer from "enquirer";
const { Select } = enquirer;
import MemoDatabase from "./MemoDatabase.js";

export default class MemoSelector {
  constructor() {
    this.memoDatabase = new MemoDatabase();
  }

  select(message, choices) {
    const prompt = new Select({
      message: message,
      choices: choices,
    });
    return prompt.run();
  }

  async getSelectedMemoId(message) {
    const memos = await this.memoDatabase.findAll();
    if (memos.length === 0) {
      console.log("There are no memos.");
      return;
    }
    const selectedTitle = await this.select(
      message,
      memos.map((memo) => memo.title)
    );
    const memo = memos.find((memo) => memo.title === selectedTitle);
    return memo.memo_id;
  }
}
