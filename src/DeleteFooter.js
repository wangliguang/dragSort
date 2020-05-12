import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  DeviceEventEmitter
} from 'react-native';
const ScreenW = Dimensions.get('window').width;

export const DRAG_EVENT = {
  beginDrag: 'beginDrag',
  isDelete: 'isDelete',
  deleteOrNot: 'deleteOrNot',
}

export default class extends React.PureComponent {

  state = {
    text: '',
  }

  componentDidMount() {
    DeviceEventEmitter.addListener(DRAG_EVENT.beginDrag, () => {
      this.setState({ text: '拖到此处删除' });
    });

    DeviceEventEmitter.addListener(DRAG_EVENT.isDelete, () => {
      this.setState({ text: '松手即可删除' });
    });

    DeviceEventEmitter.addListener(DRAG_EVENT.deleteOrNot, () => {
      this.setState({ text: '' });
    });
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeAllListeners();
  }

  render() {
    if (!this.state.text) return null;
    return (
      <View style={{ zIndex: 10001,position: 'absolute',height: 50, backgroundColor: 'red', bottom: 0, left: 0, right: 0, width: ScreenW, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{ color: 'white', fontSize: 20}}>{this.state.text}</Text>
      </View>
    )
  }
}