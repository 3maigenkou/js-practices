const argv = require("minimist")(process.argv.slice(2));

const today = new Date();
const year = argv.y || today.getFullYear();
const month = argv.m || today.getMonth() + 1;

const wdays = ["日", "月", "火", "水", "木", "金", "土"];

const firstDay = new Date(year, month - 1, 1);
const lastDay = new Date(year, month, 0);

let days = [];
for (let i = firstDay.getDate(); i <= lastDay.getDate(); i++) {
  days.push(new Date(year, month - 1, i));
}

console.log(`     ${month}月  ${year}`);
wdays.forEach((wday) => {
  process.stdout.write(`${wday} `);
});
process.stdout.write(`\n`);

const dayOfWeek = firstDay.getDay();
for (let i = 0; i < dayOfWeek; i++) {
  process.stdout.write(`   `);
}

days.forEach((day) => {
  if (day.getDate() < 10) {
    process.stdout.write(` ${day.getDate()} `);
  } else {
    process.stdout.write(`${day.getDate()} `);
  }
  if (day.getDay() === 6) {
    process.stdout.write(`\n`);
  }
});
