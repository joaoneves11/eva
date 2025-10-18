import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';

interface ActionBarProps {
  message: string;
  onMessageChange: (text: string) => void;
  onSendMessage: () => void;
  onToggleCamera: () => void;
  onToggleLight: () => void;
  onScreenshot: () => void;
  isCameraClosed: boolean;
  isLightOn: boolean;
}

const ActionBar: React.FC<ActionBarProps> = ({
  message,
  onMessageChange,
  onSendMessage,
  onToggleCamera,
  onToggleLight,
  onScreenshot,
  isCameraClosed,
  isLightOn,
}) => {
  return (
    <View style={styles.container}>
      {/* Input de Mensagem */}
      <View style={styles.messageContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={Colors.main}
          value={message}
          onChangeText={onMessageChange}
        />
        <TouchableOpacity style={styles.sendButton} onPress={onSendMessage}>
          <Ionicons name="send" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Botões de Ação */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, isCameraClosed && styles.pressedButton]}
          onPress={onToggleCamera}
        >
          <Ionicons 
            name={isCameraClosed ? "camera" : "eye"} 
            size={24} 
            color={isCameraClosed ? Colors.white : Colors.main} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, isLightOn && styles.pressedButton]}
          onPress={onToggleLight}
        >
          <Ionicons 
            name="bulb" 
            size={24} 
            color={isLightOn ? Colors.white : Colors.main} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onScreenshot}
        >
          <Ionicons name="camera-outline" size={24} color={Colors.main} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.black,
    borderTopWidth: 1,
    borderTopColor: Colors.main,
  },
  messageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.main,
    borderRadius: 20,
    paddingHorizontal: 15,
    color: Colors.white,
    backgroundColor: 'transparent',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  pressedButton: {
    backgroundColor: Colors.main,
  },
});

export default ActionBar;
