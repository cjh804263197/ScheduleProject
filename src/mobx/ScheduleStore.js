import { observable, action, computed } from 'mobx'
import dayjs from 'dayjs'

import { getWeekMonthAndWhichWeekByDate } from '../common/WeekMonth'

class ScheduleStore {
    @observable datas = []
    @observable flageDate = dayjs().startOf('date').toDate()
    @observable startIndex = 6 // 默认为6 表示从早晨6点开始计算

    constructor() {
        this.column = 8 // 表示课表的列数
    }

    @computed get row() {
        return 24 - this.startIndex
    }
  
    @computed get startWeekDay() {
      return dayjs(this.flageDate).startOf('week').add(1, 'day').toDate()
    }
  
    @computed get weekDays() {
      return Array.from(new Array(7)).map((item, index) => {
        return {
          date: dayjs(this.startWeekDay).add(index, 'day').toDate(),
          value: dayjs(this.startWeekDay).add(index, 'day').date(),
          today: dayjs(this.startWeekDay).add(index, 'day').valueOf() === dayjs().startOf('date').valueOf()
        }
      })
    }
  
    @computed get getTitles() {
      const { numWeekMonth } = getWeekMonthAndWhichWeekByDate(this.flageDate)
      return [{ value: numWeekMonth }, ...this.weekDays]
    }

    @action initData = (startIndex = 6) => {
        this.startIndex = startIndex
        this.initScheduleData()
    }
  
    /**
     * 生成课表数据(最初始状态)
     */
    @action initScheduleData = () => {
      this.datas = Array.from(new Array(this.row * this.column)).map((item, index) => {
        if (index % this.column) { // 非时间栏展示数据
          // 获取格子所对应的日期
          const date = this.weekDays[(index % this.column) - 1].date
          // 获取格子所对应的的时间段
          const hour = parseInt(index / this.column) + this.startIndex
          return {
            arranged: false, // 是否排课 true(已排) false(未排)
            date: dayjs(date).add(hour, 'hour').toDate(),
            duration: 1
          }
        } else { // 左侧时间栏展示时间段
          return { text: `${parseInt(index / this.column) + this.startIndex}:00` }
        }
        // return index % 8 ? { date: dayjs(this.weekDays[(index % 8) - 1].date).add(parseInt(index/8) + 6, 'hour').toDate(), duration: 1 } : { text: `${parseInt(index/8) + 6}:00` }
      })
    }

    @action insertArrangedDataInScheduleData = (arrangedData) => {
        if (Array.isArray(arrangedData)) { // 必须是数组
            // console.log('insertArrangedDataInScheduleData', dayjs(this.startWeekDay).format('YYYY-MM-DD HH:mm:ss'), dayjs(this.startWeekDay).add(7, 'day').format('YYYY-MM-DD HH:mm:ss'))
            const startOfWeek = dayjs(this.startWeekDay)
            const endOfWeek = dayjs(this.startWeekDay).add(7, 'day')
            if (arrangedData.length&&arrangedData.every(dta => dayjs(dta.classStartDate).isAfter(startOfWeek)&&dayjs(dta.classStartDate).isBefore(endOfWeek))) {
              arrangedData.forEach(item => {
                // 首先计算出该节课日期的星期数,该星期数的值就是列数
                let col = dayjs(item.classStartDate).day() || 7
                let r = dayjs(item.classStartDate).hour() - this.startIndex
                console.log('index=', r * this.column + col)
                this.datas[ r * this.column + col] = {...item, arranged: true }
              })
            } else { // 若为空数组，则直接返回最初始状态
                this.initScheduleData()
            }
        }
    }

    @action setFlageDate = (value) => {
        if (dayjs(value).isValid()&&!dayjs(value).isSame(this.flageDate, 'date')) {
          this.flageDate = dayjs(value).toDate()
          this.initScheduleData()
        }
    }
}

export default ScheduleStore