import React, {Component} from 'react'
import { Dimensions } from 'react-native'

import dayjs from 'dayjs'
import { observable, action, toJS, computed } from 'mobx'
import { observer } from 'mobx-react/native'
import ViewPager  from 'react-native-viewpager'

import ScheduleView from './ScheduleView'
import { getWeekMonthAndWhichWeekByDate } from '../common/WeekMonth'

const { DataSource } = ViewPager

const { width } = Dimensions.get('window')
const SCREEN_WIDTH = width // 获取屏幕宽度

class Store {
    @observable dates = [dayjs().add(-7, 'day').toDate(), dayjs().toDate(), dayjs().add(7, 'day').toDate()]
    @observable current = 1 // 保留滑动之前的页数
    @observable viewpager = null // viewpager对象
    @observable props = null // 父组件传值对象

    @computed get dataSource() {
      const dataSrc = new DataSource({
        pageHasChanged: (p1, p2) => !dayjs(p1).isSame(dayjs(p2).toDate(), 'date'),
      })
      return dataSrc.cloneWithPages
    }

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

    @action setViewPager = (viewpager, props) => {
        this.viewpager = viewpager
        this.props = props
    }

    @action scrollToMiddle = () => {
        if (this.viewpager) {
          this.viewpager.goToPage(1)
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
    }

    componentDidUpdate() {
      console.log('componentDidUpdate')
      // 在componentDidMount中不生效需要setTimeOut,
      // 并且setTimeOut的时间要设置大于网络请求时间，
      // 因此放到componentDidUpdate就可解决此问题
    }

    _renderPage = (data, pageId) => {
      console.log('_renderPage', data, pageId)
      return (
        <ScheduleView
          {...this.props}
          key={pageId}
          date={data}
        />
      )
    }

    render() {
      const { setViewPager, dataSource, changePage } = this.store
      console.log('render',toJS(dataSource))
      return (
        <ViewPager
          ref={(viewpager) => setViewPager(viewpager)}
          style={ { flex: 1 } }
          dataSource={dataSource}
          initialPage={1}
          renderPage={this._renderPage}
          onChangePage={changePage}
          isLoop={false}
          autoPlay={false}/>
      )
    }
}

export default ScheduleControl