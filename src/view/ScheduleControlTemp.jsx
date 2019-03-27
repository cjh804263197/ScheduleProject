import React, {Component} from 'react'
import { ScrollView, View, Text } from 'react-native'
import { Carousel, Button } from 'antd-mobile-rn'
import dayjs from 'dayjs'
import { observable, action, computed, toJS } from 'mobx'
import { observer } from 'mobx-react/native'

import { colors } from '../data/ScheduleData'

class Store {
    @observable dates = [dayjs().add(-7, 'day').toDate(), dayjs().toDate(), dayjs().add(7, 'day').toDate()]
    @observable current = 1
    @observable carousel = null

    @action changePage = (current) => {
        console.log(`last=${toJS(this.current)},current=${current}`)
        if(this.current - current > 0) {
            console.log('右滑了')
            this.scrollRight()
            this.current = current
        } else if (this.current - current < 0) {
            console.log('左滑了')
            this.scrollLeft()
            this.current = current
        }
        
    }

    @action scrollRight = () => {
        const cloneArr = JSON.parse(JSON.stringify(this.dates))
        const last = cloneArr.pop()
        cloneArr.unshift(dayjs(last).add(-21, 'day').toDate())
        this.dates = cloneArr
        this.updateIndex()
    }

    @action scrollLeft = () => {
        const cloneArr = JSON.parse(JSON.stringify(this.dates))
        const first = cloneArr.shift()
        cloneArr.push(dayjs(first).add(21, 'day').toDate())
        this.dates = cloneArr
        this.updateIndex()
    }

    @action setCarousel = (value) => {
        console.log('setCarousel', this.carousel)
        if (this.carousel) return
        this.carousel = value
        console.log('赋值了', this.carousel)
    }

    @action updateIndex = () => {
        console.log('updateIndex', this.carousel)
        if (this.carousel) {
            console.log('carousel', this.carousel)
            this.carousel.updateIndex({x: 360, y: 0})
            this.carousel.scrollviewRef.scrollTo({y:0, x:360, animated:false})
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
        setTimeout(() => this.store.updateIndex(), 1000)
    }
    
    beforeChange = (...aguments) => {
        console.log('beforeChange', aguments)
        // this.store.setCarousel(aguments[2])
    }

    afterChange = (current) => {
        console.log('afterChange', current)
        this.store.changePage(current)
    }

    btnClick = () => {
        const { updateIndex } =this.store
        updateIndex()
    }

    render() {
        const { dates, updateIndex, setCarousel } =this.store
        console.log('render',toJS(dates))
        return (
            <View style={{ flex: 1 }}>
                <View style={ { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'} }>
                    <Button type="primary" onClick={() => {}}>上一页</Button>
                    <Button type="primary" onClick={this.btnClick}>下一页</Button>
                </View>
                <Carousel
                    ref={ref => setCarousel(ref)}
                    selectedIndex={1}
                    onScrollBeginDrag={this.beforeChange}
                    afterChange={this.afterChange}
                    >
                    {
                        dates.map((val, index) => (
                            <View key={index} style={{flexGrow: 1, alignItems: 'center', justifyContent: 'center', height: global.SCREEN_HEIGHT - 100, backgroundColor: colors[index]}} key={index}>
                                <Text style={ { fontSize: 20 } }>{dayjs(val).format('YYYY-MM-DD HH:mm:ss')}</Text>
                            </View>
                        ))
                    }
                </Carousel>
            </View>
        )
    }
}

export default ScheduleControl