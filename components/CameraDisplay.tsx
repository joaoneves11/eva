import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import Colors from '../constants/Colors';

interface CameraDisplayProps {
  cameraClosed: boolean;
}

const CameraDisplay: React.FC<CameraDisplayProps> = ({ cameraClosed }) => {
  const url = 'http://192.168.4.1:81/stream';
  
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isWebViewLoading, setIsWebViewLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("Carregando...");
  
  const opacity = useRef<Animated.Value>(new Animated.Value(1)).current;

  const fadeInAnimation = Animated.timing(opacity, {
    toValue: 1,
    duration: 1000,
    useNativeDriver: true
  });

  const fadeOutAnimation = Animated.timing(opacity, {
    toValue: 0,
    duration: 1000,
    useNativeDriver: true
  });

  function onStartLoading(): void {
    setIsWebViewLoading(true);
  }

  function onFinishLoading(): void {
    setTimeout(() => {
      setIsWebViewLoading(false);
      setInitialLoading(false);
      fadeOutAnimation.start();
    }, 2000);
  }

  function onError(): void {
    setIsWebViewLoading(false);
    setError(true);
    setLoadingMessage("Erro ao conectar com a câmera");
  }

  function handleCameraClosed(): void {
    if (cameraClosed) {
      fadeInAnimation.start();
      setTimeout(() => {
        setIsWebViewLoading(true);
      }, 1000);
      setLoadingMessage("Câmera fechada");
    } else if (!initialLoading) {
      setIsWebViewLoading(false);
      fadeOutAnimation.start();
    }
  }

  useEffect(() => {
    handleCameraClosed();
  }, [cameraClosed]);

  return (
    <View style={styles.container}>
      {isWebViewLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.main} />
          <Animated.Text style={[styles.loadingText, { opacity }]}>
            {loadingMessage}
          </Animated.Text>
        </View>
      )}

      {!isWebViewLoading && !cameraClosed && (
        <WebView
          source={{ uri: url }}
          onLoadStart={onStartLoading}
          onLoadEnd={onFinishLoading}
          onError={onError}
          style={styles.webView}
          userAgent="Chrome/67.0.3396.99Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36"
          onHttpError={onError}
        />
      )}

      {cameraClosed && (
        <Animated.View style={[styles.darkCover, { opacity }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
  loadingText: {
    color: Colors.main,
    fontSize: 16,
    marginTop: 10,
  },
  webView: {
    flex: 1,
  },
  darkCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.black,
  },
});

export default CameraDisplay;
