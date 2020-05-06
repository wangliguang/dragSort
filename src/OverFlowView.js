import { requireNativeComponent, Platform, View } from 'react-native';

export default Platform.select({
  ios: View,
  android: View
})