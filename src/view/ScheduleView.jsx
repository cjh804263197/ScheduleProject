/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react'
import { ScrollView, View, Text, Dimensions } from 'react-native'
import { Grid, Button } from 'antd-mobile-rn'
import { observer } from 'mobx-react/native'
import { toJS } from 'mobx'

import ScheduleStore from '../mobx/ScheduleStore'

const { height, width } = Dimensions.get('window')
global.SCREEN_WIDTH = width // 获取屏幕宽度
global.SCREEN_HEIGHT = height // 获取屏幕高度

@observer
class ScheduleView extends Component {
  constructor(props) {
    super(props)
    this.store = new ScheduleStore()
  }

  componentDidMount() {
    const { initData } = this.store
    initData(this.props.startIndex)
  }

  componentWillReceiveProps(props) {
    const { insertArrangedDataInScheduleData, setFlageDate } = this.store
    setFlageDate(props.date)
    insertArrangedDataInScheduleData(props.arrangedData)
  }

  _renderItem = (el, index) => {
    if (el.text) { // 左侧时间栏
      return (
        <View style={ { flex: 1, alignItems: 'center', justifyContent: 'center' } } >
          <Text>{el.text}</Text>
        </View>
      )
    } else if (el.arranged) {
      return (
        <View style={ { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: el.color } } >
          <Text style={ { flexWrap: 'nowrap' } } numberOfLines={1}>{el.name}</Text>
        </View>
      )
    } else {
      return null
    }
  }

  _itemClick = (el, index) => {
    const {  column } = this.store
    const { onArrangedClick, onUnarrangClick } = this.props
    if (!(index % column)) { // 点击的是标题
      console.log('这是标题点击无效')
    } else if (el.arranged) { // 点击的是已排课
      console.log('已排课：', toJS(el))
      onArrangedClick(toJS(el))
    } else { // 点击的是未排课
      console.log('未排课：', toJS(el))
      onUnarrangClick(el.date)
    }
  }

  render() {
    const { datas, getTitles, column } = this.store
    return (
      <View style={ {flex: 1} }>
        <ScheduleHeader week={getTitles} />
        <ScrollView style={{width: global.SCREEN_WIDTH}}>
          <Grid
            data={datas}
            columnNum={column}
            renderItem={this._renderItem}
            onClick={this._itemClick}
          />
        </ScrollView>
      </View>
    )
  }
}

/**
 * 课表头组件
 * @param {*} props 父组件传值
 */
const ScheduleHeader = (props) => (
  <View style={ { width: global.SCREEN_WIDTH, height: global.SCREEN_WIDTH / 8, flexDirection: 'row' } }>
    {
      props.week.map((item, index) => (
        <ScheduleHeaderItem
          key={index}
          value={item.value}
          today={item.today}
          index={index}
        />
      ))
    }
  </View>
)

/**
 * 课表头Item组件
 * @param {*} props 父组件传值
 */
const ScheduleHeaderItem = (props) => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return (
    <View style={ { width: global.SCREEN_WIDTH / 8, height: global.SCREEN_WIDTH / 8, alignItems: 'center', justifyContent: 'center' } }>
      {
        props.index ? (
          <View>
          {
            props.today ? (
              <View style={ { alignItems: 'center' } }>
                <Text style={ { color: '#23AFF9' } }>{props.value}</Text>
                <Text style={ { color: '#23AFF9' } }>{days[props.index - 1]}</Text>
              </View>
            ) : (
              <View style={ { alignItems: 'center' } }>
                <Text>{props.value}</Text>
                <Text>{days[props.index - 1]}</Text>
              </View>
            )
          }
          </View>
        ) : (
          <Text>{props.value}月</Text>
        )
      }
    </View>
  )
}

export default ScheduleView
