/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Screen } from '@dal/react-native-functions';
const px = Screen.px;

import DragSort, { DeleteFooter } from './src';
import Shadow from './shadow'
const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component<{}> {

  render() {
    return (
      <View style={styles.container}>
       <Shadow>
         {/* 该View的宽度是没有无阴影下的宽度 */}
          <View style={{ backgroundColor: 'white', height: px(200), width: px(200) }}> 
              {/* 这里布局自己的View */}
          </View>
        </Shadow>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
