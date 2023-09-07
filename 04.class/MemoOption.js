import minimist from "minimist";

export default class MemoOption {
  constructor(argv = null) {
    this.argv = argv
  }

  parseOptions() {
    return minimist(this.argv.slice(2), {
      boolean: ["l", "r", "d"],
      unknown: (errorOption) => {
        console.error(`Unknown option: ${errorOption}`);
        process.exit(9);
      },
    });
  }
}
