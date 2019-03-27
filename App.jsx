/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react'
import { View, Dimensions } from 'react-native'
import { observer } from 'mobx-react/native'
import { observable, action, computed, runInAction, toJS } from 'mobx'
import dayjs from 'dayjs'

import { groupColorData, colors, scheduleData } from './src/data/ScheduleData'
import ScheduleControl from './src/view/ScheduleControl'

const { height, width } = Dimensions.get('window')
global.SCREEN_WIDTH = width // 获取屏幕宽度
global.SCREEN_HEIGHT = height // 获取屏幕高度

class Store {

  @observable originDatas = [] // 原始排课记录数据

  @observable groupColor = groupColorData // 存储现有分组所对应颜色

  @computed get scheduleColor() {
    const color = {}
    this.groupColor.forEach(item => {
      color[item.groupId] = item.color
    })
    this.originDatas.forEach(item => {
      // 当前组没有已分配的颜色，则向颜色库中(过滤掉已分配颜色)的第一个颜色
      if (!color[item.groupId]) color[item.groupId] = colors.filter(item => !Object.keys(color).map(key => color[key]).some(val => val === item))[0]
    })
    return color
  }

  @computed get scheduleDatas() {
    // 累积处理，将服务端返回的排课信息（一条排课信息为2个小时）变为1小时一条排课信息
    return this.originDatas.reduce((acc, cur) => {
      // 首先确定当前排课信息的颜色
      let color = this.scheduleColor[cur.groupId]
      const cloneCur = JSON.parse(JSON.stringify(cur))
      // 第一节排课对象
      let first = { ...cur, duration: 1, classEndDate: dayjs(cur.classEndDate).add(-1, 'hour').toDate(), color }
      // 第二节排课对象
      let seconde = { ...cloneCur, duration: 1, classStartDate: dayjs(cloneCur.classStartDate).add(1, 'hour').toDate(), color }
      return [...acc, first, seconde]
    }, [])
  }

  @action fetchScheduleData = (year, month, week) => {
    setTimeout(() => {
      runInAction(() => {
        if (year === 2019 && month === 3 && week === 3) {
          this.originDatas = scheduleData
        } else {
          this.originDatas = []
        }
      })
    }, 2000)
  }
}

@observer
class App extends Component {
  constructor(props) {
    super(props)
    this.store = new Store()
  }

  componentDidMount() {
    
  }

  // 周改变事件
  _weekChange = ({year, month, week}) => {
    console.log('_weekChange', year, month, week)
    const { fetchScheduleData } = this.store
    fetchScheduleData(year, month, week)
  }

  // 已排课Item点击事件
  _arragedClick = (item) => {
    console.log('_arragedClick', item)
  }

  // 未排课Item点击事件
  _unarrandClick = (item) => {
    console.log('_unarrandClick', item)
  }

  render() {
    const { scheduleDatas } = this.store
    return (
      <View style={ {flex: 1} }>
        <ScheduleControl
          startIndex={6} // 课表开始时间 6就代表从6点开始
          arrangedData={scheduleDatas} // 已排课数据
          onWeekChange={this._weekChange} // 周改变事件
          onArrangedClick={this._arragedClick} // 已排课Item点击事件
          onUnarrangClick={this._unarrandClick} // 未排课Item点击事件
        />
      </View>
    )
  }
}

export default App
