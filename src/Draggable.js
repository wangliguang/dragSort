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


export default class Draggable extends Component {

    constructor(props){
        super(props);

        this.state = {
            pan: new Animated.ValueXY(),
        };

        this._panResponder = PanResponder.create({
            onMoveShouldSetResponderCapture: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

            // 设置初始位置
            onPanResponderGrant: (e, gestureState) => {
                this.state.pan.setOffset({
                    x: this.state.pan.x._value,
                    y: this.state.pan.y._value
                });
                this.props.onBeginMove();
                this.state.pan.setValue({x: 0, y: 0});
            },

            // 使用拖拽的偏移量来定位
            onPanResponderMove: Animated.event([
                null, {dx: this.state.pan.x, dy: this.state.pan.y},
            ]),

            onPanResponderRelease: (evt, {vx, vy}) => {
                const { pageX, pageY } = evt.nativeEvent;
                const { x, y } = this.props.destination;
                if (pageX > x && pageY > y) {
                    this.props.onArriveDestination();
                    return;
                }
                Animated.timing(
                    this.state.pan,
                    {
                        toValue: {x: 0, y: 0}, 
                        duration: 300,
                    }
                ).start();
            }
        });
    }

    render(){

        // 从state中取出pan
        const { pan } = this.state;

        // 从pan里计算出偏移量
        const [translateX, translateY] = [pan.x, pan.y];

        // 设置transform为偏移量
        const imageStyle = {transform: [{translateX}, {translateY}]};

        const panHandlers = this._panResponder ? this._panResponder.panHandlers : {};

        return (
            <Animated.View style={[this.props.style, imageStyle]} {...panHandlers}>
               {this.props.children}
            </Animated.View>
        )
    }
} 