import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <WebView 
        source={{ uri: 'https://relativitylab.rafifaiz.my.id' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0823',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0A0823',
  }
});