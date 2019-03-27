import dayjs from 'dayjs'

/**
 * 给定月的周月开始结束日期
 * @param {*} year 年份
 * @param {*} month 周月
 */
const getWeekMonthDateRange = (year, month) => {
  // 自然月起始日期和星期
  const mStartDate = dayjs(new Date(year, month - 1, 1))
  // console.log(`自然月开始日期:${mStartDate.format('YYYY-MM-DD HH:mm:ss')}`)
  const mStartDay = mStartDate.day() === 0 ? 7 : mStartDate.day()
  // console.log(`自然月开始日期星期:${mStartDay}`)
  // 获取当月的天数
  const monthDay = mStartDate.daysInMonth()
  // console.log(`自然月天数:${monthDay}`)
  // 自然月截止日期和星期
  const mEndDate = dayjs(new Date(year, month - 1, monthDay))
  // console.log(`自然月截止日期:${mEndDate.format('YYYY-MM-DD HH:mm:ss')}`)
  const mEndDay = mEndDate.day() === 0 ? 7 : mEndDate.day()
  // console.log(`自然月截止日期星期:${mEndDay}`)

  let [wmStartDate, wmEndDate] = [null, null]
  if (mStartDay <= 4) {
    wmStartDate = mStartDate.subtract(mStartDay - 1, 'day')
  } else {
    wmStartDate = mStartDate.add(8 - mStartDay, 'day')
  }
  if (mEndDay >= 4) {
    wmEndDate = mEndDate.add(7 - mEndDay, 'day')
  } else {
    wmEndDate = mEndDate.subtract(mEndDay, 'day')
  }
  // console.log(`${year}年${month}周月开始日期:${wmStartDate.format('YYYY-MM-DD HH:mm:ss')},截止日期:${wmEndDate.format('YYYY-MM-DD HH:mm:ss')}`)
  return { startDate: wmStartDate.toDate(), endDate: wmEndDate.toDate() }
}

/**
 * 根据日期获取该日期所属的周月以及属于该周月的第几周
 * @param {Date} date 日期 若传new Date(year, month, day),请注意month是实际月份减一
 * @param {String} date 日期 格式为 YYYY-MM-DD
 */
const getWeekMonthAndWhichWeekByDate = (date) => {
  const aimDate = dayjs(date)
  // 取出传入日期的年、月
  const year = aimDate.year()
  // console.log(`自然年:${year}`)
  const month = aimDate.month() + 1
  // console.log(`自然月:${month}`)
  const day = aimDate.date()
  // console.log(`自然日:${day}`)
  // 获取年月的周月范围
  const { startDate, endDate } = getWeekMonthDateRange(year, month)
  // console.log(`${year}年${month}周月开始日期:${dayjs(startDate).format('YYYY-MM-DD HH:mm:ss')},截止日期:${dayjs(endDate).format('YYYY-MM-DD HH:mm:ss')}`)
  let [numWeekYear, numWeekMonth, thWeekMonth] = [0, 0, 0]
  if (aimDate.isBefore(dayjs(startDate))) {
    // console.log('isBefore')
    numWeekMonth = (month - 1) < 1 ? 12 : month - 1
    numWeekYear = (month - 1) < 1 ? year - 1 : year
    // 获取上一周月的日期范围
    const wmStartDate = getWeekMonthDateRange(numWeekYear, numWeekMonth).startDate
    // console.log(`${year}年${numWeekMonth}周月开始日期:${dayjs(wmStartDate).format('YYYY-MM-DD HH:mm:ss')}`)
    // console.log(`${dayjs(wmStartDate).format('YYYY-MM-DD HH:mm:ss')}...${aimDate.format('YYYY-MM-DD HH:mm:ss')}`)
    // console.log(`相差天数:${dayjs(wmStartDate).diff(aimDate, 'day')}`)
    thWeekMonth = parseInt(Math.abs(aimDate.diff(dayjs(wmStartDate), 'day')) / 7, 10) + 1
  } else if (aimDate.isAfter(dayjs(endDate))) {
    numWeekMonth = (month + 1) > 12 ? (month + 1) - 12 : (month + 1)
    numWeekYear = (month + 1) > 12 ? year + 1 : year
    thWeekMonth = parseInt(aimDate.diff(dayjs(endDate).add(1, 'day'), 'day') / 7, 10) + 1
  } else {
    // console.log('is')
    numWeekYear = year
    numWeekMonth = month
    thWeekMonth = parseInt(Math.abs(aimDate.diff(dayjs(startDate), 'day')) / 7, 10) + 1
  }
  return { numWeekYear, numWeekMonth, thWeekMonth }
}

/**
 * 获取下一周的日期范围
 */
const getNextWeekDateRange = () => {
  const now = dayjs(new Date())
  const day = now.day() ? now.day() : 7
  const startDate = now.add(8 - day, 'day')
  const endDate = startDate.add(6, 'day')
  return { startDate: startDate.toDate(), endDate: endDate.toDate() }
}

const getCurrentWeekDateRange = () => {
  // Todo 获取当前周的 开始时间与结束时间
  const dayTime = 24*60*60*1000
  const now = dayjs(new Date())
  const startDate = new Date(now.startOf('week').toDate().getTime() + dayTime)
  const endDate = new Date(now.endOf('week').toDate().getTime() + dayTime)
  return { startDate, endDate }
}

/**
 * [getDaysInWeekMonth 根据周月开始和结束时间计算这个月的总天数]
 * @param  {[Date]} startDate [周月开始时间]
 * @param  {[Date]} endDate   [周月结束时间]
 * @return {[Number]}         [周月总天数]
 */
const _getDaysInWeekMonth = (startDate, endDate) => dayjs(endDate).diff(dayjs(startDate), 'days') + 1

/**
 * [getDaysArrayInWeekMonth 根据周月开始时间和周月天数构造一个周月数组]
 * @param  {[Date]}    startDate         [周月开始时间]
 * @param  {[Number]}  daysInWeekMonth   [周月天数]
 * @return {[Array]}                     [周月数组]
 */
const getDaysArrayInWeekMonth = (startDate, endDate) => {
  const daysInWeekMonth = _getDaysInWeekMonth(startDate, endDate)
  const weekMonth = []
  const nowYear = new Date(startDate).getFullYear()
  const nowMonth = new Date(startDate).getMonth()
  const startDay = new Date(startDate).getDate()
  for (let i = 0; i < daysInWeekMonth; i++) {
    const date = new Date(nowYear, nowMonth, startDay + i)

    const { numWeekYear, numWeekMonth, thWeekMonth } = getWeekMonthAndWhichWeekByDate(date)
    weekMonth.push(
      {
        weekYear: numWeekYear,
        weekMonth: numWeekMonth,
        weekDay: dayjs(date).date(),
        thWeekMonth,
        startDate,
        endDate,
        timestamp: dayjs(date).valueOf().toString(),
        dateString: dayjs(date).format('YYYY-MM-DD'),
      },
    )
  }
  return weekMonth
}

const getDaysArray = (numWeekYear, numWeekMonth) => {
  // 获取所在周月开始和结束日期
  const { startDate, endDate } = getWeekMonthDateRange(numWeekYear, numWeekMonth)
  // 根据周月开始和结束日期获取由日期组成的数组
  const daysArray = getDaysArrayInWeekMonth(startDate, endDate)
  return daysArray
}

export {
  getCurrentWeekDateRange,
  getWeekMonthDateRange,
  getWeekMonthAndWhichWeekByDate,
  getNextWeekDateRange,
  getDaysArray,
}

export default {
  getCurrentWeekDateRange,
  getWeekMonthDateRange,
  getWeekMonthAndWhichWeekByDate,
  getNextWeekDateRange,
  getDaysArray,
}
