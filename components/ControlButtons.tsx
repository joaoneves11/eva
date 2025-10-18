import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';

interface ControlButtonsProps {
  onForward: () => void;
  onBack: () => void;
  onLeft: () => void;
  onRight: () => void;
  onStop: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  onForward,
  onBack,
  onLeft,
  onRight,
  onStop,
}) => {
  return (
    <View style={styles.container}>
      {/* Botão Frente */}
      <TouchableOpacity
        style={styles.button}
        onPressIn={onForward}
        onPressOut={onStop}
      >
        <Ionicons name="arrow-up" size={30} color={Colors.main} />
      </TouchableOpacity>

      {/* Botões Laterais */}
      <View style={styles.sideButtons}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={onLeft}
          onPressOut={onStop}
        >
          <Ionicons name="arrow-back" size={30} color={Colors.main} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPressIn={onRight}
          onPressOut={onStop}
        >
          <Ionicons name="arrow-forward" size={30} color={Colors.main} />
        </TouchableOpacity>
      </View>

      {/* Botão Trás */}
      <TouchableOpacity
        style={styles.button}
        onPressIn={onBack}
        onPressOut={onStop}
      >
        <Ionicons name="arrow-down" size={30} color={Colors.main} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.main,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  sideButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 190,
  },
});

export default ControlButtons;
