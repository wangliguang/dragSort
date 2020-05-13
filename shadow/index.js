import React from 'react';
import {
  ImageBackground,
  Image,
  View,
  StyleSheet
} from 'react-native';
import { Screen } from '@dal/react-native-functions';
const px = Screen.px;

export default class extends React.Component {

  state = {
    height: 0,
  }

  handleLayout = (e) => {
    let height = e.nativeEvent.layout.height;
    this.setState({ 
      height: height - px(18)
    });
  }

  render() {
    return (
      <View onLayout={this.handleLayout} style={{ position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
        <Image resizeMode={'stretch'} style={STYLE.top} source={require('./img/top.png')}/>
        <Image resizeMode={'stretch'} style={[STYLE.left, { height: this.state.height} ]} source={require('./img/left.png')}/>
        <Image resizeMode={'stretch'} style={[STYLE.right, { height: this.state.height } ]} source={require('./img/right.png')}/>
        <Image resizeMode={'stretch'} style={STYLE.bottom} source={require('./img/bottom.png')}/>
        <View style={{ marginHorizontal: px(9), marginTop: px(8), marginBottom: px(12)}}>
          {this.props.children}
        </View>
      </View>
    )
  }
}

const STYLE = StyleSheet.create({
  top: {
    position: 'absolute',
    width: px(715),
    height: px(8),
    top: 0,
    right: 0,
    left: 0,
  },
  bottom: {
    position: 'absolute',
    width: px(715),
    height: px(12),
    bottom: 0,
    right: 0,
    left: 0,
  },
  left: {
    position: 'absolute',
    width: px(9),
    marginTop: px(8),
    left: 0,
    top: 0,
    bottom: 0,
  },
  right: {
    position: 'absolute',
    width: px(9),
    marginTop: px(8),
    right: 0,
    top: 0,
    bottom: 0,
  }
});