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

const COLUMN_NUM = 3;
const ITEM_WIDTH = 105;
const ITEM_HEIGHT = 105;

const TOUCH_ZINDEX = 99;
const DEFAULT_INDEX = 9;

/* 思路：使用动画transform，不想使用定位
 * 1. 初始时算出每个项目的位置，并赋值给originX与originY，将对应的transfrom动画的x/y都置为0，将初始下标赋值给originIndex
 * 2. 
 */
// 移动时给每个组件都找到新位置，然后执行动画
// 移动结束，将移动到的位置设置为新的其实位置

export default class DView extends React.Component {

  refDrag = new Map();

  touchCurItem = {
    ref: null,
    index: 0,
    moveToIndex: 0,
    translateX: 0,
    translateY: 0,
  }

  constructor(props) {
    super(props);

      const dataArray = props.dataArray.map((item, index)=>{
        const newData = {}
        const translateX = (index % COLUMN_NUM) * ITEM_WIDTH;
        const translateY = parseInt((index/COLUMN_NUM)) * ITEM_HEIGHT;

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
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: ScreenW }}>
        {this.state.dataArray.map((item, index) => (
          <Draggable 
            ref={ref => this.refDrag.set(index, ref)} 
            pan={this.state.dataArray[index].transAnimated} 
            key={`${item.data}`} 
            destination={{
              x: 0,
              y: ScreenH-40,
            }} 
            onMoveEnd={this.handleMoveEnd} 
            onBeginMove={() => this.handleBeginMove(index)} 
            onMove={this.handleOnMove}
            onArriveDestination={() => this.handleArriveDestination(item.data)} 
          >
            {this.renderItem(item.data)}
          </Draggable>
      ))}
      </View>
    )
  }


  handleOnMove = (e, gestureState) => {
    if (!this.touchCurItem) return;
    
    // 偏移量
    let translateX = gestureState.dx;
    let translateY = gestureState.dy;

    this.touchCurItem.ref.setState({
      zIndex: TOUCH_ZINDEX,
    })

    const curItem = this.state.dataArray[this.touchCurItem.index].transAnimated.setOffset({
      x: translateX,
      y: translateY
    });

    
    let moveXNum = translateX/ITEM_WIDTH
    let moveYNum = translateY/ITEM_HEIGHT

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
          if (index > this.touchCurItem.index && index <= moveToIndex) {
              nextItem = this.state.dataArray[index-1]

          } else if (index >= moveToIndex && index < this.touchCurItem.index) {
              nextItem = this.state.dataArray[index+1]

          } else if (index != this.touchCurItem.index &&
              (item.transAnimated.x._value != item.originX ||
                  item.transAnimated.y._value != item.originY)) {
              nextItem = this.state.dataArray[index]

          } else if ((this.touchCurItem.index-moveToIndex > 0 && moveToIndex == index+1) ||
              (this.touchCurItem.index-moveToIndex < 0 && moveToIndex == index-1)) {
              nextItem = this.state.dataArray[index]
          }
          
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
      moveToIndex: 0,
      translateX: 0,
      translateY: 0,
    }
    this.setState({
      move,
    });
  }

  handleMoveEnd = () => {
    this.state.dataArray.forEach((item, index) => {
      // https://future-challenger.gitbooks.io/react-native-animation/flattenoffset.html
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
