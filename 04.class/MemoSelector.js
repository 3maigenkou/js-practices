import enquirer from "enquirer";
const { Select } = enquirer
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




  async getSelectedMemo(message) {
    const memos = await this.memoDatabase.getMemoData();
    if (memos.length === 0) {
      console.log("There are no memos.");
      return;
    }
    const selectedTitle = await this.select(
      message,
      memos.map((memo) => memo.title)
    );
    return memos.find((memo) => memo.title === selectedTitle);
  }

}
