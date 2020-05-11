import React, {
    Component,
} from 'react';

import {
    StyleSheet,
    Image,
    PanResponder,
    Animated,
    Dimensions
} from 'react-native';

const DEFAULT_INDEX = 9;


export default class Draggable extends Component {

    constructor(props){
        super(props);

        this.state = {
            pan: this.props.pan,
            zIndex: 0,
        };

        this._panResponder = PanResponder.create({
            onMoveShouldSetResponderCapture: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

            // 设置初始位置
            onPanResponderGrant: (e, gestureState) => {
                // this.state.pan.setOffset({
                //     x: this.state.pan.._value,
                //     y: this.state.pan.y._value
                // });
                this.props.onBeginMove();
            },

            // 使用拖拽的偏移量来定位
            onPanResponderMove: (e, gestureState) => {
                this.props.onMove && this.props.onMove(e, gestureState);
            },

            onPanResponderRelease: (evt, {vx, vy}) => {
                // const { pageX, pageY } = evt.nativeEvent;
                // const { x, y } = this.props.destination;
                // if (pageX > x && pageY > y) {
                //     this.props.onArriveDestination();
                //     return;
                // }
                // this.setState({
                //     zIndex: DEFAULT_INDEX,
                // });
                this.props.onMoveEnd && this.props.onMoveEnd()

                // Animated.timing(
                //     this.state.pan,
                //     {
                //         toValue: {x: 0, y: 0}, 
                //         duration: 300,
                //     }
                // ).start();
            }
        });
    }

    render(){

        // 从state中取出pan
        const { pan } = this.props;

        // 从pan里计算出偏移量
        const [translateX, translateY] = [pan.x, pan.y];

        // 设置transform为偏移量
        const imageStyle = {transform: [{translateX}, {translateY}]};

        const panHandlers = this._panResponder ? this._panResponder.panHandlers : {};

        return (
            <Animated.View style={[{ zIndex: this.state.zIndex }, this.props.style, imageStyle]} {...panHandlers}>
               {this.props.children}
            </Animated.View>
        )
    }
} 