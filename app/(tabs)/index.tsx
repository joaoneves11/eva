import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ActionBar from '../../components/ActionBar';
import CameraDisplay from '../../components/CameraDisplay';
import ControlButtons from '../../components/ControlButtons';
import Colors from '../../constants/Colors';
import { CarControlService } from '../../services/carControlService';

export default function TabOneScreen() {
  const carController = new CarControlService();
  
  const [isCameraClosed, setIsCameraClosed] = useState<boolean>(false);
  const [isLightOn, setIsLightOn] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [screenshotSource, setScreenshotSource] = useState<string | null>(null);

  const handleForward = () => {
    carController.goForward();
  };

  const handleBack = () => {
    carController.goBack();
  };

  const handleLeft = () => {
    carController.goLeft();
  };

  const handleRight = () => {
    carController.goRight();
  };

  const handleStop = () => {
    carController.stop();
  };

  const handleToggleLight = () => {
    carController.toggleLight();
    setIsLightOn(!isLightOn);
  };

  const handleToggleCamera = () => {
    setIsCameraClosed(!isCameraClosed);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      carController.sendMessage(message);
      setMessage('');
    }
  };

  const handleScreenshot = async () => {
    // Funcionalidade de screenshot temporariamente desabilitada
    console.log('Screenshot functionality temporarily disabled');
  };

  return (
    <View style={styles.container}>
      {/* Modal de Screenshot */}
      <Modal visible={screenshotSource !== null} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gostaria de salvar sua imagem?</Text>
              <TouchableOpacity
                onPress={() => setScreenshotSource(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.main} />
              </TouchableOpacity>
            </View>
            
            {screenshotSource && (
              <Image source={{ uri: screenshotSource }} style={styles.screenshotImage} />
            )}
            
            <TouchableOpacity style={styles.downloadButton}>
              <Ionicons name="download" size={20} color={Colors.white} />
              <Text style={styles.downloadText}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Layout Principal */}
      <View style={styles.contentContainer}>
        {/* Action Bar */}
        <ActionBar
          message={message}
          onMessageChange={setMessage}
          onSendMessage={handleSendMessage}
          onToggleCamera={handleToggleCamera}
          onToggleLight={handleToggleLight}
          onScreenshot={handleScreenshot}
          isCameraClosed={isCameraClosed}
          isLightOn={isLightOn}
        />

        {/* Área Principal */}
        <View style={styles.mainArea}>
          {/* Camera Display */}
          <View style={styles.cameraContainer}>
            <CameraDisplay cameraClosed={isCameraClosed} />
          </View>

          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            <ControlButtons
              onForward={handleForward}
              onBack={handleBack}
              onLeft={handleLeft}
              onRight={handleRight}
              onStop={handleStop}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  contentContainer: {
    flex: 1,
  },
  mainArea: {
    flex: 1,
    flexDirection: 'row',
  },
  cameraContainer: {
    flex: 1,
  },
  controlsContainer: {
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
    borderLeftWidth: 1,
    borderLeftColor: Colors.main,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.black,
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  screenshotImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  downloadButton: {
    backgroundColor: Colors.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  downloadText: {
    color: Colors.white,
    marginLeft: 8,
    fontSize: 16,
  },
});
