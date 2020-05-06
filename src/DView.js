import Draggable from './Draggable';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet
} from 'react-native';
import OverFlowView from './OverFlowView';

export default class DView extends React.Component {

  state = {
    move: -1,
    dataArray: [1,2,3]
  }

  render() {
    return (
      <View>
        {this.state.dataArray.map((str, index) => (
        <Draggable destination={{
          x: 0,
          y: 896-40,
        }} onArriveDestination={() => this.handleArriveDestination(str)} onBeginMove={() => this.handleBeginMove(index)} >
          {this.renderItem(str)}
        </Draggable>
      ))}
      </View>
    )
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

  handleBeginMove = (move) => {
    this.setState({
      move,
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
    width: 50, 
    height: 50,
    marginRight: 15, 
    marginTop: 15,
  }
})
