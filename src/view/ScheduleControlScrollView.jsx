import React, {Component} from 'react'
import { ScrollView, Dimensions } from 'react-native'

import dayjs from 'dayjs'
import { observable, action, toJS } from 'mobx'
import { observer } from 'mobx-react/native'

import ScheduleView from './ScheduleView'
import { getWeekMonthAndWhichWeekByDate } from '../common/WeekMonth'

const { width } = Dimensions.get('window')
const SCREEN_WIDTH = width // 获取屏幕宽度

class Store {
    @observable dates = [dayjs().add(-7, 'day').toDate(), dayjs().toDate(), dayjs().add(7, 'day').toDate()]
    @observable current = 1 // 保留滑动之前的页数
    @observable scrollview = null // ScrollView对象
    @observable props = null // 父组件传值对象

    @action changePage = (current) => {
        if(this.current - current > 0) { // 右滑
          // 一定要将这句代码放到this.scrollRight()的前面，否则出现无法无限滑动的功能
          this.current = current
          this.scrollRight()
        } else if (this.current - current < 0) { // 左滑
           // 一定要将这句代码放到this.scrollLeft()的前面，否则出现无法无限滑动的功能
          this.current = current
          this.scrollLeft()
        }
        
    }

    @action scrollRight = () => {
        const cloneArr = JSON.parse(JSON.stringify(this.dates))
        const last = cloneArr.pop()
        cloneArr.unshift(dayjs(last).add(-21, 'day').toDate())
        this.dates = cloneArr
        this.scrollToMiddle()
    }

    @action scrollLeft = () => {
        const cloneArr = JSON.parse(JSON.stringify(this.dates))
        const first = cloneArr.shift()
        cloneArr.push(dayjs(first).add(21, 'day').toDate())
        this.dates = cloneArr
        this.scrollToMiddle()
    }

    @action setScrollView = (value, props) => {
        this.scrollview = value
        this.props = props
    }

    @action scrollToMiddle = () => {
        if (this.scrollview) {
          this.scrollview.scrollTo({ y: 0, x: SCREEN_WIDTH, animated: false })
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
      const { scrollToMiddle } = this.store
      setTimeout(() => scrollToMiddle(), 0)
    }

    componentDidUpdate() {
      console.log('componentDidUpdate')
      // 在componentDidMount中不生效需要setTimeOut,
      // 并且setTimeOut的时间要设置大于网络请求时间，
      // 因此放到componentDidUpdate就可解决此问题
    }

    _onAnimationEnd = (e) => {
      //求出偏移量
      let offsetX = e.nativeEvent.contentOffset.x
      //求出当前页数
      let pageIndex = Math.floor(offsetX / SCREEN_WIDTH)
      this.store.changePage(pageIndex)
    }

    render() {
      const { setScrollView, dates, scrollToMiddle } = this.store
      console.log('render',toJS(dates))
      return (
        <ScrollView
          style={ { flex: 1 } }
          ref={(r) => {
              setScrollView(r, this.props)
            }
          }
          //水平方向
          horizontal={true}
          //当值为true时显示滚动条
          showsHorizontalScrollIndicator={false}
          //当值为true时，滚动条会停在滚动视图的尺寸的整数倍位置。这个可以用在水平分页上
          pagingEnabled={true}
          //滑动完一贞
          onMomentumScrollEnd={(e)=>{this._onAnimationEnd(e)}}
          //开始拖拽
          // onScrollBeginDrag={(e)=>console.log('开始拖拽', e)}
          //结束拖拽
          // onScrollEndDrag={()=>{}}
        >
          {
            dates.map((val, index) => (
              // <View key={index} style={{ alignItems: 'center', justifyContent: 'center', width: SCREEN_WIDTH, height: SCREEN_HEIGHT} } key={index}>
              //     <Text style={ { fontSize: 20 } }>{dayjs(val).format('YYYY-MM-DD HH:mm:ss')}</Text>
              // </View>
              <ScheduleView
                {...this.props}
                key={index}
                date={val}
              />
            ))
          }
        </ScrollView>
      )
    }
}

export default ScheduleControl