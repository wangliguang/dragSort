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

const ScreenH = Dimensions.get('window').height;
export default class DView extends React.Component {

  refDrag = new Map();

  state = {
    move: -1,
    dataArray: [1,2,3]
  }

  render() {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap'}}>
        {this.state.dataArray.map((str, index) => (
        <Draggable ref={ref => this.refDrag.set(index, ref)} key={`${str}`} destination={{
          x: 0,
          y: ScreenH-40,
        }} onArriveDestination={() => this.handleArriveDestination(str)} onBeginMove={() => this.handleBeginMove(index)} onMove={this.handleOnMove}>
          {this.renderItem(str)}
        </Draggable>
      ))}
      </View>
    )
  }

  handleOnMove = () => {

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
    this.touchCurItem = this.refDrag.get(move)
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
