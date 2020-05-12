import React from 'react';
import {
    StyleSheet,
    Image,
    PanResponder,
    Animated,
    Dimensions,
    DeviceEventEmitter
} from 'react-native';
import { DRAG_EVENT } from './DeleteFooter'


const TOUCH_ZINDEX = 99;
const DEFAULT_INDEX = 9;

export default class DragItem extends React.Component {

  constructor(props){
    super(props);
    this.state = {
        pan: this.props.pan,
        zIndex: DEFAULT_INDEX,
    };

    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: () => {
        this.props.onMoveStart && this.props.onMoveStart();
      },

      // 使用拖拽的偏移量来定位
      onPanResponderMove: (e, gestureState) => {
          this.setState({ zIndex: TOUCH_ZINDEX }); // 为什么不能放到手势开始时呢
          this.props.onMove && this.props.onMove(e, gestureState);

          const { pageX, pageY } = e.nativeEvent;
          const { x, y } = this.props.destination;
          if (pageX > x && pageY > y) {
            DeviceEventEmitter.emit(DRAG_EVENT.isDelete)
          } else {
            DeviceEventEmitter.emit(DRAG_EVENT.beginDrag)
          }

      },

      onPanResponderRelease: (evt, {vx, vy}) => {
        this.setState({ zIndex: DEFAULT_INDEX });

        const { pageX, pageY } = evt.nativeEvent;
        const { x, y } = this.props.destination;
        setTimeout(() => {// 让setState同步起来
          this.props.onMoveEnd && this.props.onMoveEnd();
          if (pageX > x && pageY > y) {
            DeviceEventEmitter.emit(DRAG_EVENT.delete)
              this.props.onArriveDestination && this.props.onArriveDestination();
          }
        }, 0);
      }
    });
  }

  render() {
    const { pan } = this.props;
    const [translateX, translateY] = [pan.x, pan.y];
    const imageStyle = {transform: [{translateX}, {translateY}]};
    const panHandlers = this._panResponder ? this._panResponder.panHandlers : {};

    return (
      <Animated.View style={[{ zIndex: this.state.zIndex }, this.props.style, imageStyle]} {...panHandlers}>
        {this.props.children}
      </Animated.View>
    )
  }
} 