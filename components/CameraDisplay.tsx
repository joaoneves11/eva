import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Defina a URL da câmera e cores (se não tiver Colors.ts, use um valor fixo)
const CAMERA_URL = 'http://172.20.10.6:81/stream';
const MAIN_COLOR = '#007AFF'; // Azul padrão do iOS (substitui Colors.main)
const BLACK = '#000000';      // Substitui Colors.black

interface StreamProps {
  // Mantém a prop do segundo código
  cameraClosed: boolean;
}

const ESP32CamStreamEnhanced: React.FC<StreamProps> = ({ cameraClosed }) => {
  
  // --- ESTADOS ---
  const [initialLoading, setInitialLoading] = useState(true);
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Carregando...");
  
  // Referência para a opacidade da animação
  const opacity = useRef(new Animated.Value(1)).current;

  // --- ANIMAÇÕES ---

  const fadeInAnimation = Animated.timing(opacity, {
    toValue: 1,
    duration: 1000,
    useNativeDriver: Platform.OS !== 'web' // Web não suporta Native Driver
  });

  const fadeOutAnimation = Animated.timing(opacity, {
    toValue: 0,
    duration: 1000,
    useNativeDriver: Platform.OS !== 'web'
  });

  // --- HANDLERS DA WEBVIEW ---

  // Simula onLoadStart
  function onStartLoading(): void {
    setIsWebViewLoading(true);
    setError(false);
    setLoadingMessage("Carregando...");
  }

  // Simula onLoadEnd
  function onFinishLoading(): void {
    // Adiciona um atraso para simular o tempo de carregamento no segundo código
    setTimeout(() => {
      setIsWebViewLoading(false);
      setInitialLoading(false);
      fadeOutAnimation.start();
    }, 2000);
  }

  // Simula onError / onHttpError
  function onError(): void {
    setIsWebViewLoading(false);
    setError(true);
    setLoadingMessage("Erro ao conectar com a câmera");
    fadeInAnimation.start(); // Mostra o erro
  }

  // --- LÓGICA DE FECHAMENTO DA CÂMERA ---

  useEffect(() => {
    if (cameraClosed) {
      // Se a câmera fechar: animação de escurecimento e reinício do estado de loading.
      fadeInAnimation.start(() => {
        setIsWebViewLoading(true);
      });
      setLoadingMessage("Câmera fechada");
    } else if (!initialLoading) {
      // Se a câmera reabrir: animação de clareamento (o WebView deve ser recarregado)
      // Nota: o recarregamento explícito do WebView é complexo; aqui confiamos no estado.
      setIsWebViewLoading(false);
      fadeOutAnimation.start();
    }
  }, [cameraClosed]);

  // --- CONTEÚDO HTML/WEBVIEW ---

  // HTML que renderiza o <img> MJPEG (usado no WebView e iframe)
  const htmlContent = `
    <html>
      <body style="margin:0;padding:0;overflow:hidden;background:${BLACK};">
        <img 
          src="${CAMERA_URL}" 
          style="width:100%;height:100%;object-fit:cover;"
          onerror="window.ReactNativeWebView.postMessage('ERROR');"
        />
      </body>
    </html>
  `;
  
  // Função para lidar com mensagens postadas do HTML (erro)
  const onMessage = (event: any) => {
    if (event.nativeEvent.data === 'ERROR') {
      onError();
    }
  };

  // --- RENDERIZAÇÃO WEB (IFRAME) ---

  if (Platform.OS === 'web') {
    // Usamos um View para simular o 'loadingContainer' por cima do iframe
    return (
      <View style={styles.container}>
        <iframe
          srcDoc={htmlContent}
          width="100%"
          height="100%"
          style={{
            border: 'none',
            backgroundColor: BLACK,
            opacity: cameraClosed ? 0 : 1, // Esconde/mostra se fechado
          }}
          title="ESP32 Stream"
        />
        {(isWebViewLoading || cameraClosed || error) && (
          <Animated.View style={[styles.loadingContainer, { opacity: opacity }]}>
            <ActivityIndicator size="large" color={MAIN_COLOR} />
            <Text style={styles.loadingText}>
              {loadingMessage}
            </Text>
          </Animated.View>
        )}
      </View>
    );
  }

  // --- RENDERIZAÇÃO MOBILE (WEBVIEW) ---

  // O WebView só deve ser montado se não estiver fechado, para garantir que pare de carregar
  const shouldRenderWebView = !cameraClosed && !error;

  return (
    <View style={styles.container}>
      
      {/* 1. O CONTEÚDO DE LOADING/ERRO/FECHADO */}
      {(isWebViewLoading || error || cameraClosed) && (
        <Animated.View style={[styles.loadingContainer, { opacity: opacity }]}>
          <ActivityIndicator size="large" color={MAIN_COLOR} />
          <Text style={styles.loadingText}>
            {loadingMessage}
          </Text>
        </Animated.View>
      )}

      {/* 2. O WEBVIEW COM O STREAM (só renderiza se não houver erro ou não estiver fechado) */}
      {shouldRenderWebView && (
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={styles.webView}
          onLoadStart={onStartLoading}
          onLoadEnd={onFinishLoading}
          // A função onError aqui só funciona para falhas de navegação do WebView
          // Para falhas do <img> (como o 404), usamos a comunicação onMessage do HTML.
          onError={onError}
          onHttpError={onError}
          onMessage={onMessage} // Recebe erro do JavaScript do HTML
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          // Ajusta a opacidade para que a animação de fade-in/out da capa de loading funcione.
          // Quando o WebView estiver carregando, ele estará sob a capa de loading,
          // e o fadeOut fará o stream aparecer.
        />
      )}
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BLACK,
    zIndex: 10, // Garante que a capa de loading fique por cima do WebView
  },
  loadingText: {
    color: MAIN_COLOR,
    fontSize: 16,
    marginTop: 10,
  },
  webView: {
    flex: 1,
    // Garante que o WebView comece atrás da capa de loading
    zIndex: 1, 
    minHeight: 1, // Fix para bugs de renderização em alguns WebViews
  }
});

export default ESP32CamStreamEnhanced;