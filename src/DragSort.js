import Draggable from './DragItem';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

const ScreenH = Dimensions.get('window').height;
const ScreenW = Dimensions.get('window').width;

const COLUMN_NUM = 3;

/* 思路：使用动画transform，不想使用定位
 * 1. 初始时,将数据源转化为如下格式
      1) 原始内容(data) 
      2) 算出每项位置(originX/originY)，
      3) 每项transfrom动画的x/y都置为0 
      4) 初始下标originIndex
 * 2. 渲染时，新数据源属性做如下分配
      1) 收集每个item的ref引用
      2）将transAnimated赋值给拖拽组件
      3）将新构造的数据源中originIndex给到onMove事件，不要使用map中的index,因为每次排序该值都不会变
 * 2. 开始拖拽，将如下属性赋值给this.touchCurItem
      1) 拖拽item引用(ref)
      2）拖拽item的下标(index)
      3）将要到达的位置(moveToIndex)，初始为0
 * 3. 拖拽中，不断计算所有item(除拖拽项)将要到达的位置，然后用动画移动
      1) 将改项的zIndex属性置顶
      2) 向四个方向移动一半位置就触发排序
      3）动画实现的相对偏移量
 * 4. 拖拽结束
      1) 通过flattenOffset重置所有item的偏移量 // https://future-challenger.gitbooks.io/react-native-animation/flattenoffset.html
      2）判断移动是否达到移动标准，若是：动画方式返回原位置，否：动画偏移到新位置
      3）重新计算数据源中的每个属性
      4) 将touchCurItem置null
 * 
 * 注意点：
 *  1）3-1)中性能上应该使用setNativeProps，但实验RN版本中改方法已经取消
 */

export default class extends React.Component {

  refDrag = new Map();

  touchCurItem = {
    ref: null,
    index: 0,
    moveToIndex: 0,
  }

  constructor(props) {
    super(props);

      this.itemW = this.props.itemW + this.props.itemMargin;
      this.itemH = this.props.itemH + this.props.itemMargin;

      const dataArray = props.dataArray.map((item, index)=>{
        const newData = {}
        const translateX = (index % COLUMN_NUM) * this.itemW;
        const translateY = parseInt((index/COLUMN_NUM)) * this.itemW;

        newData.data = item;
        newData.originIndex = index;
        newData.originX = translateX;
        newData.originY = translateY;
        newData.transAnimated = new Animated.ValueXY({
          x: parseInt(0+0.5),
          y: parseInt(0+0.5),
        });
        return newData
    });
    this.state = {
      dataArray,
      move: -1,
    };
  }

  render() {
    return (
      <View style={[{ flexDirection: 'row', flexWrap: 'wrap', width: 315 }, this.props.style]}>
        {this.state.dataArray.map((item, index) => (
          <Draggable 
            ref={ref => this.refDrag.set(index, ref)} 
            pan={this.state.dataArray[index].transAnimated} 
            key={`${item.data}`} 
            destination={{
              x: 0,
              y: ScreenH-40,
            }} 
            onMoveStart={() => this.handleMoveStart(item.originIndex)} 
            onMoveEnd={this.handleMoveEnd} 
            onMove={this.handleMove}
            onArriveDestination={() => this.handleArriveDestination(item.data)} 
          >
            {this.renderItem(item.data)}
          </Draggable>
      ))}
      </View>
    )
  }


  handleMove = (e, gestureState) => {
    if (!this.touchCurItem) return;
    // 偏移量
    let translateX = gestureState.dx;
    let translateY = gestureState.dy;

    this.state.dataArray[this.touchCurItem.index].transAnimated.setOffset({
      x: translateX,
      y: translateY
    });
    
    let moveXNum = translateX/this.itemW
    let moveYNum = translateY/this.itemH;

    // 向四个方向移动一半位置就触发排序
    if (moveXNum > 0) {
        moveXNum = parseInt(moveXNum+0.5)
    } else if (moveXNum < 0) {
        moveXNum = parseInt(moveXNum-0.5)
    }
    if (moveYNum > 0) {
        moveYNum = parseInt(moveYNum+0.5)
    } else if (moveYNum < 0) {
        moveYNum = parseInt(moveYNum-0.5)
    }

    let moveToIndex = this.touchCurItem.index + moveXNum + moveYNum * COLUMN_NUM;

    if (moveToIndex > this.state.dataArray.length-1) {
        moveToIndex = this.state.dataArray.length-1
    } else if (moveToIndex < 0) {
        moveToIndex = 0;
    }

    if (this.touchCurItem.moveToIndex != moveToIndex ) {
      this.touchCurItem.moveToIndex = moveToIndex
      this.state.dataArray.forEach((item,index)=>{
          let nextItem = null

          if (index > this.touchCurItem.index && index <= moveToIndex) { // 向右拖拽
              nextItem = this.state.dataArray[index-1]
          } else if (index >= moveToIndex && index < this.touchCurItem.index) { // 向左拖拽
              nextItem = this.state.dataArray[index+1]
          } else if (index != this.touchCurItem.index &&
            (item.transAnimated.x._value != item.originX ||
                item.transAnimated.y._value != item.originY)) { // 处理不松开时左右滑动
            nextItem = this.state.dataArray[index]
          } 

          // 暂时不知有啥用
          // else if ((this.touchCurItem.index > moveToIndex && moveToIndex == index+1) ||
          //     (this.touchCurItem.index < moveToIndex && moveToIndex == index-1)) {
          //     nextItem = this.state.dataArray[index]
          // }
          
          if (nextItem != null) {
              Animated.timing(
                  item.transAnimated,
                  {
                      toValue: {x: parseInt(nextItem.originX+0.5 - item.originX),y: parseInt(nextItem.originY+0.5 - item.originY)},
                      duration: 300,
                      easing: Easing.out(Easing.quad),
                      useNativeDriver: false,
                  }
              ).start()
          }
      })
  }

  }

  handleArriveDestination = (str) => {
    
    let dataArray = this.state.dataArray;
    dataArray = dataArray.filter((i) => {
      return str != i.data;
    });
    this.setState({
      dataArray: [...dataArray],
      move: -1,
    });
  }

  handleMoveStart = (move) => {
    this.touchCurItem = {
      ref: this.refDrag.get(move),
      index: move,
      moveToIndex: 0,
    }
    this.setState({
      move,
    });
  }

  handleMoveEnd = () => {
    this.state.dataArray.forEach((item, index) => {
      item.transAnimated.flattenOffset();
    })

    const curIndex = this.touchCurItem.index;
    const moveToIndex = this.touchCurItem.moveToIndex;
    const curItem = this.state.dataArray[this.touchCurItem.index];
    const moveToItem = this.state.dataArray[moveToIndex];

    let translateX = 0;
    let translateY = 0;

    if (curIndex != moveToIndex) {
      translateX = parseInt(moveToItem.originX - curItem.originX+0.5);
      translateY = parseInt(moveToItem.originY - curItem.originY+0.5); 
    }
    Animated.timing(
      curItem.transAnimated,
      {
          toValue: {x: translateX,y: translateY},
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
      }
    ).start()
    this.touchCurItem = null;
    this.changePosition(curIndex, moveToIndex);

  }

  // 每次排序结束，按照新的排序整理dataArray
  changePosition(startIndex,endIndex) {

    let isCommon = true
    if (startIndex > endIndex) {
        isCommon = false
        let tempIndex = startIndex
        startIndex = endIndex
        endIndex = tempIndex
    }

    const newDataArray = [...this.state.dataArray].map((item,index)=>{
        let newIndex = null;
        if (isCommon) {
            if (endIndex > index && index >= startIndex) {
                newIndex = index+1
            } else if (endIndex == index) {
                newIndex = startIndex
            }
        } else {
            if (endIndex >= index && index > startIndex) {
                newIndex = index-1
            } else if (startIndex == index) {
                newIndex = endIndex
            }
        }

        if (newIndex != null) {
            const newItem = {...this.state.dataArray[newIndex]}
            newItem.originX = item.originX
            newItem.originY = item.originY
            newItem.originIndex = item.originIndex;
            newItem.transAnimated = new Animated.ValueXY({
                x: 0,
                y: 0,
            })
            item = newItem
        }

        return item
    })
    
    this.setState({
      dataArray: newDataArray
    });

  }

  renderItem = (str, index = -1) => {
    return (
      <TouchableOpacity style={[STYLE.item, { backgroundColor: 'red' }]}>
        <Text>{str}</Text>
      </TouchableOpacity>
    )
  }
}

const STYLE = StyleSheet.create({
  item: {
    width: 90, 
    height: 90,
    marginRight: 15, 
    marginTop: 15,
  }
})
