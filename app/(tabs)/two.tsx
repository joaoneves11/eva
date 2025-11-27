import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { CarControlService } from '../../services/carControlService';

export default function TabTwoScreen() {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [batteryVoltage, setBatteryVoltage] = useState(0);
  const [uptime, setUptime] = useState('00:00:00');
  const [totalCommands, setTotalCommands] = useState(0);
  const [lastCommand, setLastCommand] = useState('Nenhum');
  const [carController] = useState(new CarControlService());
  const [isDemoMode, setIsDemoMode] = useState(true); 

  // Buscar dados do Arduino ou usar modo demo
  useEffect(() => {
    if (isDemoMode) {
      // Modo demo - dados simulados
      setBatteryLevel(85);
      setBatteryVoltage(4.1);
      setUptime('01:23:45');
      setTotalCommands(42);
      setLastCommand('Frente');
      setConnectionStatus('connected');
      
      // Simular mudanças em tempo real
      const interval = setInterval(() => {
        setBatteryLevel(prev => Math.max(20, prev - Math.random() * 0.5));
        setBatteryVoltage(prev => Math.max(3.2, prev - Math.random() * 0.01));
        setTotalCommands(prev => prev + Math.floor(Math.random() * 2));
      }, 5000);

      return () => clearInterval(interval);
    } else {
      // Modo real - conectar com Arduino
      fetchRealData();
      const interval = setInterval(fetchRealData, 3000);
      return () => clearInterval(interval);
    }
  }, [isDemoMode]);

  const fetchRealData = async () => {
    try {
      const response = await fetch('http://192.168.4.1/status');
      const data = await response.json();

      if (data.battery !== undefined) {
        setBatteryLevel(data.battery);
      }
      if (data.voltage !== undefined) {
        setBatteryVoltage(data.voltage);
      }
      if (data.uptime !== undefined) {
        setUptime(data.uptime);
      }
      if (data.commands !== undefined) {
        setTotalCommands(data.commands);
      }
      if (data.lastCommand !== undefined) {
        setLastCommand(data.lastCommand);
      }
      setConnectionStatus('connected');
    } catch (error) {
      console.log('Erro ao conectar com Arduino:', error);
      setConnectionStatus('disconnected');
    }
  };

  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      // Simular teste de conexão (modo offline)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConnectionStatus('connected');
      Alert.alert('✅ Modo Demo', 'Dashboard funcionando em modo demonstração!');
    } catch (error) {
      setConnectionStatus('disconnected');
      Alert.alert('❌ Erro de Conexão', 'Não foi possível conectar ao carrinho.');
    }
  };

  const emergencyStop = () => {
    Alert.alert(
      '🚨 PARADA DE EMERGÊNCIA',
      'Tem certeza que deseja parar o carrinho imediatamente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'PARAR', 
          style: 'destructive',
          onPress: () => {
            carController.stop();
            setLastCommand('PARADA DE EMERGÊNCIA');
            Alert.alert('🛑 Parado', 'Carrinho parado por segurança.');
          }
        }
      ]
    );
  };

  const resetStats = () => {
    setTotalCommands(0);
    setLastCommand('Nenhum');
    Alert.alert('🔄 Reset', 'Estatísticas resetadas!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚗 EVA Dashboard</Text>
        <Text style={styles.subtitle}>
          {isDemoMode ? 'Modo Demonstração' : 'Modo Arduino'}
        </Text>
        <TouchableOpacity 
          style={[styles.modeButton, { backgroundColor: isDemoMode ? Colors.main : '#ff6b6b' }]}
          onPress={() => setIsDemoMode(!isDemoMode)}
        >
          <Text style={styles.modeButtonText}>
            {isDemoMode ? '🔄 Conectar Arduino' : '📱 Modo Demo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status de Conexão */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons 
            name={connectionStatus === 'connected' ? 'wifi' : 'wifi-outline'} 
            size={24} 
            color={connectionStatus === 'connected' ? Colors.main : '#ff4444'} 
          />
          <Text style={styles.cardTitle}>Conexão</Text>
        </View>
        <Text style={styles.statusText}>
          {connectionStatus === 'connected' ? '✅ Conectado' : 
           connectionStatus === 'checking' ? '🔄 Verificando...' : '❌ Desconectado'}
        </Text>
        <TouchableOpacity style={styles.testButton} onPress={testConnection}>
          <Text style={styles.buttonText}>Testar Conexão</Text>
        </TouchableOpacity>
      </View>

      {/* Status do Powerbank */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="battery-half" size={24} color={Colors.main} />
          <Text style={styles.cardTitle}>Powerbank</Text>
        </View>
        <View style={styles.batteryContainer}>
          <View style={styles.batteryBar}>
            <View 
              style={[
                styles.batteryFill, 
                { 
                  width: `${batteryLevel}%`,
                  backgroundColor: batteryLevel > 50 ? Colors.main : batteryLevel > 20 ? '#ffaa00' : '#ff4444'
                }
              ]} 
            />
          </View>
          <Text style={styles.batteryText}>{batteryLevel}%</Text>
        </View>
        <View style={styles.batteryInfo}>
          <Text style={styles.batteryVoltage}>⚡ {batteryVoltage.toFixed(1)}V</Text>
          <Text style={styles.batteryStatus}>
            {batteryLevel > 80 ? '🔋 Excelente' : 
             batteryLevel > 50 ? '🔋 Bom' : 
             batteryLevel > 20 ? '⚠️ Baixo' : '🔴 Crítico'}
          </Text>
        </View>
      </View>

      {/* Estatísticas */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="stats-chart" size={24} color={Colors.main} />
          <Text style={styles.cardTitle}>Estatísticas</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Comandos Enviados</Text>
            <Text style={styles.statValue}>{totalCommands}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Último Comando</Text>
            <Text style={styles.statValue}>{lastCommand}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tempo Ativo</Text>
            <Text style={styles.statValue}>{uptime}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={resetStats}>
          <Text style={styles.buttonText}>Reset Stats</Text>
        </TouchableOpacity>
      </View>

      {/* Controles Rápidos */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="settings" size={24} color={Colors.main} />
          <Text style={styles.cardTitle}>Controles Rápidos</Text>
        </View>
        <View style={styles.quickControls}>
          <TouchableOpacity style={styles.controlButton} onPress={emergencyStop}>
            <Ionicons name="stop-circle" size={32} color="#ff4444" />
            <Text style={styles.controlText}>PARADA</Text>
            <Text style={styles.controlSubtext}>EMERGÊNCIA</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={() => {
              carController.toggleLight();
              setLastCommand('Toggle Luz');
            }}
          >
            <Ionicons name="bulb" size={32} color={Colors.main} />
            <Text style={styles.controlText}>LUZ</Text>
            <Text style={styles.controlSubtext}>ON/OFF</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Informações do Sistema */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle" size={24} color={Colors.main} />
          <Text style={styles.cardTitle}>Informações do Sistema</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>📱 App: EVA v1.0.0</Text>
          <Text style={styles.infoText}>🤖 Arduino: ESP32</Text>
          <Text style={styles.infoText}>🌐 Rede: EVA_CAR</Text>
          <Text style={styles.infoText}>📡 IP: 192.168.4.1</Text>
          <Text style={styles.infoText}>📹 Câmera: Ativa</Text>
        </View>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.black,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.main,
    opacity: 0.8,
  },
  card: {
    backgroundColor: Colors.black,
    margin: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.main,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 16,
    color: Colors.white,
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: Colors.main,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBar: {
    flex: 1,
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    marginRight: 15,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 10,
  },
  batteryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    minWidth: 40,
  },
  batteryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  batteryVoltage: {
    color: Colors.main,
    fontSize: 14,
    fontWeight: 'bold',
  },
  batteryStatus: {
    color: Colors.white,
    fontSize: 14,
    opacity: 0.8,
  },
  statsContainer: {
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    color: Colors.white,
    opacity: 0.8,
  },
  statValue: {
    color: Colors.main,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(137, 105, 251, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.main,
    minWidth: 100,
  },
  controlText: {
    color: Colors.white,
    fontWeight: 'bold',
    marginTop: 5,
  },
  controlSubtext: {
    color: Colors.main,
    fontSize: 12,
    opacity: 0.8,
  },
  infoContainer: {
    marginTop: 10,
  },
  infoText: {
    color: Colors.white,
    marginBottom: 5,
    opacity: 0.9,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'center',
  },
  modeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
