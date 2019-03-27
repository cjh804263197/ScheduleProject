import React, {Component} from 'react'
import { ScrollView, View, Text, Dimensions } from 'react-native'

import dayjs from 'dayjs'
import { observable, action, toJS } from 'mobx'
import { observer } from 'mobx-react/native'
import Swiper from 'react-native-swiper'

import ScheduleView from './ScheduleView'
import { getWeekMonthAndWhichWeekByDate } from '../common/WeekMonth'

const { width } = Dimensions.get('window')
const SCREEN_WIDTH = width // 获取屏幕宽度

class Store {
    @observable dates = [dayjs().add(-7, 'day').toDate(), dayjs().toDate(), dayjs().add(7, 'day').toDate()]
    @observable current = 1 // 保留滑动之前的页数
    @observable swiper = null // ScrollView对象
    @observable props = null // 父组件传值对象

    @action changePage = (current) => {
        console.log('changePage', toJS(this.current), current)
        if(this.current - current > 0) { // 右滑
          // 一定要将这句代码放到this.scrollRight()的前面，否则出现无法无限滑动的功能
          this.scrollRight()
        } else if (this.current - current < 0) { // 左滑
           // 一定要将这句代码放到this.scrollLeft()的前面，否则出现无法无限滑动的功能
          this.scrollLeft()
        }
        
    }

    @action scrollRight = () => {
        const cloneArr = this.dates.slice(0)
        const last = cloneArr.pop()
        cloneArr.unshift(dayjs(last).add(-21, 'day').toDate())
        this.dates = cloneArr
        this.scrollToMiddle()
    }

    @action scrollLeft = () => {
        const cloneArr = this.dates.slice(0)
        const first = cloneArr.shift()
        cloneArr.push(dayjs(first).add(21, 'day').toDate())
        this.dates = cloneArr
        this.scrollToMiddle()
    }

    @action setSwiper = (value, props) => {
        console.log('setSwiper', value)
        if (this.swiper) return
        this.swiper = value
        this.props = props
    }

    @action scrollToMiddle = () => {
        if (this.swiper) {
          this.swiper.scrollBy(0, false)
          this.current = 1
          const { numWeekYear, numWeekMonth, thWeekMonth } = getWeekMonthAndWhichWeekByDate(this.dates[1])
          this.props.onWeekChange({ year: numWeekYear, month: numWeekMonth, week: thWeekMonth })
        }
    }
}

@observer
class ScheduleControl extends Component {
    constructor(props) {
      super(props)
      this.store = new Store()
    }

    componentDidMount() {
    //   const { scrollToMiddle } = this.store
    //   setTimeout(() => scrollToMiddle(), 0)
    }

    componentDidUpdate() {
      console.log('componentDidUpdate')
      // 在componentDidMount中不生效需要setTimeOut,
      // 并且setTimeOut的时间要设置大于网络请求时间，
      // 因此放到componentDidUpdate就可解决此问题
    }

    _onIndexChanged = (index) => {
      this.store.changePage(pageIndex)
    }

    render() {
      const { setSwiper, dates, changePage } = this.store
      console.log('render',toJS(dates))
      return (
        <Swiper
          style={ { flex: 1 } }
          ref={(r) => {
                setSwiper(r, this.props)
            }
          }
          //水平方向
          horizontal={true}
          //不循环
          loop={true}
          // 初始index
          index={1}
          //滑动完一贞
          onIndexChanged={changePage}
        >
          {
            dates.map((val, index) => (
            //   <View key={index} style={{ alignItems: 'center', justifyContent: 'center', width: SCREEN_WIDTH, height: SCREEN_HEIGHT} } key={index}>
            //       <Text style={ { fontSize: 20 } }>{dayjs(val).format('YYYY-MM-DD HH:mm:ss')}</Text>
            //   </View>
              <ScheduleView
                {...this.props}
                key={index}
                date={val}
              />
            ))
          }
        </Swiper>
      )
    }
}

export default ScheduleControl