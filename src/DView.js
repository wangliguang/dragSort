import Draggable from './Draggable';
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
import OverFlowView from './OverFlowView';

const ScreenH = Dimensions.get('window').height;
const ScreenW = Dimensions.get('window').width;

const ROWNUM = 2;
const ITEM_WIDTH = 65;
const ITEM_HEIGHT = 65;

const TOUCH_ZINDEX = 99;
const DEFAULT_INDEX = 9;

// 设置初始动画
// 移动时给每个组件都找到新位置，然后执行动画
// 移动结束，将移动到的位置设置为新的其实位置

export default class DView extends React.Component {

  refDrag = new Map();

  constructor(props) {
    super(props);

    
      const dataArray = props.dataArray.map((item, index)=>{
      const newData = {}
      const left = (index % ROWNUM) * ITEM_WIDTH;
      const top = parseInt((index/ROWNUM)) * ITEM_HEIGHT;

      // console.log(left, top);

      newData.data = item;
      newData.originIndex = index;
      newData.originLeft = left;
      newData.originTop = top;
      newData.position = new Animated.ValueXY({
          x: parseInt(left+0.5),
          y: parseInt(top+0.5),
      });
      return newData
    });
    this.state = {
      dataArray,
      move: -1,
      height: Math.ceil(dataArray.length / ROWNUM) * ITEM_HEIGHT,
    };
  }

  componentDidMount() {
  }

  render() {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', height: this.state.height, width: ScreenW, position: 'relative' }}>
        
        {this.state.dataArray.map((item, index) => (
        <Draggable onMoveEnd={this.handleMoveEnd} pan={this.state.dataArray[index].position} ref={ref => this.refDrag.set(index, ref)} key={`${item.data}`} destination={{
          x: 0,
          y: ScreenH-40,
        }} onArriveDestination={() => this.handleArriveDestination(item.data)} onBeginMove={() => this.handleBeginMove(index)} onMove={this.handleOnMove}>
          {this.renderItem(item.data)}
        </Draggable>
      ))}
      </View>
    )
  }

  handleOnMove = (e, gestureState) => {
    this.isHasMove = true;
    if (!this.touchCurItem) return;
    
    let dx = gestureState.dx
    let dy = gestureState.dy
    const itemWidth = ITEM_WIDTH;
    const itemHeight = ITEM_HEIGHT;

    const rowNum = ROWNUM;
    const maxWidth = ITEM_WIDTH;
    const maxHeight = ITEM_HEIGHT;

    let left = this.touchCurItem.originLeft + dx;
    let top = this.touchCurItem.originTop + dy;

    this.touchCurItem.ref.setState({
      zIndex: TOUCH_ZINDEX,
    })

    this.state.dataArray[this.touchCurItem.index].position.setValue({
      x: left,
      y: top,
    })
    // return;

    console.log(dx, dy);

    let moveToIndex = 0
    let moveXNum = dx/ITEM_WIDTH
    let moveYNum = dy/ITEM_HEIGHT
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
    

    moveToIndex = this.touchCurItem.index+moveXNum+moveYNum*ROWNUM

    if (moveToIndex > this.state.dataArray.length-1) {
        moveToIndex = this.state.dataArray.length-1
    } else if (moveToIndex < 0) {
        moveToIndex = 0;
    }

    if (this.touchCurItem.moveToIndex != moveToIndex ) {
      this.touchCurItem.moveToIndex = moveToIndex
      this.state.dataArray.forEach((item,index)=>{

          let nextItem = null
          if (index > this.touchCurItem.index && index <= moveToIndex) {
              nextItem = this.state.dataArray[index-1]

          } else if (index >= moveToIndex && index < this.touchCurItem.index) {
              nextItem = this.state.dataArray[index+1]

          } else if (index != this.touchCurItem.index &&
              (item.position.x._value != item.originLeft ||
                  item.position.y._value != item.originTop)) {
              nextItem = this.state.dataArray[index]

          } else if ((this.touchCurItem.index-moveToIndex > 0 && moveToIndex == index+1) ||
              (this.touchCurItem.index-moveToIndex < 0 && moveToIndex == index-1)) {
              nextItem = this.state.dataArray[index]
          }
         
          if (nextItem != null) {
              Animated.timing(
                  item.position,
                  {
                      toValue: {x: parseInt(nextItem.originLeft+0.5),y: parseInt(nextItem.originTop+0.5)},
                      duration: 300,
                      // easing: Easing.out(Easing.quad),
                      useNativeDriver: false,
                  }
              ).start()
          }

      })
  }

  }

  handleArriveDestination = (str) => {
    setTimeout(() => {
      let dataArray = this.state.dataArray;
      dataArray = dataArray.filter((i) => {
      return str != i;
      });
      this.setState({ dataArray: []});
      this.setState({
        dataArray,
        move: -1,
      });
    }, 0);
  }

  // https://github.com/mochixuan/react-native-drag-sort/blob/2e3546235aec28fbd70518fc509f182205344c7a/Example/app/widget/DragSortableView.js#L10
  handleBeginMove = (move) => {
    this.touchCurItem = {
      ref: this.refDrag.get(move),
      index: move,
      originLeft: this.state.dataArray[move].originLeft,
      originTop: this.state.dataArray[move].originTop,
      moveToIndex: move,
    } 
    this.setState({
      move,
    });
  }

  handleMoveEnd = () => {
    const curIndex = this.touchCurItem.index;
    const moveToIndex = this.touchCurItem.moveToIndex;
    // console.log(curIndex, moveToIndex);
    if (curIndex == moveToIndex) {
      const curItem = this.state.dataArray[this.touchCurItem.index];
      Animated.timing(
        curItem.position,
        {
            toValue: {x: parseInt(curItem.originLeft+0.5),y: parseInt(curItem.originTop+0.5)},
            duration: 300,
            // easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }
      ).start()
    }
    this.touchCurItem = null;
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
    width: 50, 
    height: 50,
    marginRight: 15, 
    marginTop: 15,
  }
})
