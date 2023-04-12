const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    y: 'year',
    m: 'month'
  }
})
const today = new Date()
const year = argv.y || today.getFullYear()
const month = argv.m || today.getMonth() + 1
const wday = ['日', '月', '火', '水', '木', '金', '土']
const firstDay = new Date(year, month - 1, 1)
const lastDay = new Date(year, month, 0)
const dayOfWeek = firstDay.getDay()
const firstDayStr = firstDay
  .getDate()
  .toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
const lastDayStr = lastDay
  .getDate()
  .toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
const days = []
for (let i = firstDayStr; i <= lastDayStr; i++) {
  days.push(i)
}
for (let i = 0; i <= dayOfWeek; i++) {
  days.unshift(' ')
}

console.log(`     ${month}月  ${year}`)
for (let i = 0; i < wday.length; i++) {
  process.stdout.write(`${wday[i]}  `)
}

for (let i = 0; i < days.length; i++) {
  if (i % 7 === 0 && days[i] < 10) {
    process.stdout.write(` ${days[i]}\n`)
  } else if (days[i] < 10) {
    process.stdout.write(` ${days[i]}  `)
  } else if (i % 7 === 0) {
    process.stdout.write(`${days[i]}\n`)
  } else {
    process.stdout.write(`${days[i]}  `)
  }
}
