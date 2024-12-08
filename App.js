import React from 'react';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView 
        source={{ uri: 'https://relativitylab.rafifaiz.my.id' }}  // Ganti dengan URL website Anda
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </SafeAreaView>
  );
}