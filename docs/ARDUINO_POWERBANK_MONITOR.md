# 🔋 Arduino ESP32 - Monitor de Powerbank

## 📋 Configuração do Hardware

### **Componentes Necessários**:
- **ESP32 DevKit**
- **Powerbank 5V/2A** (ou maior)
- **Divisor de Tensão** (2 resistores 10kΩ)
- **Cabo USB** para conectar powerbank
- **Multímetro** (para calibração)

### **Conexões**:
```
Powerbank 5V → ESP32 VIN
Powerbank GND → ESP32 GND
Divisor de Tensão → GPIO36 (ADC)
```

---

## 🔧 Código Arduino para Monitor de Powerbank

```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// Configuração da rede
const char* ssid = "UOLI_CAR";
const char* password = "12345678";

WebServer server(80);

// Pinos para monitoramento
#define BATTERY_PIN 36        // GPIO36 (ADC)
#define LED_STATUS 2          // LED de status

// Variáveis de monitoramento
float batteryVoltage = 0.0;
int batteryPercentage = 0;
unsigned long uptime = 0;
int totalCommands = 0;
String lastCommand = "Nenhum";

// Calibração do powerbank
const float VOLTAGE_MIN = 3.0;    // Tensão mínima (0%)
const float VOLTAGE_MAX = 4.2;     // Tensão máxima (100%)
const float VOLTAGE_CRITICAL = 3.3; // Tensão crítica

void setup() {
  Serial.begin(115200);
  
  // Configurar pinos
  pinMode(LED_STATUS, OUTPUT);
  pinMode(BATTERY_PIN, INPUT);
  
  // Configurar WiFi
  setupWiFi();
  
  // Configurar servidor
  setupServer();
  
  // Inicializar monitoramento
  updateBatteryStatus();
  
  Serial.println("🔋 Powerbank Monitor iniciado!");
  Serial.println("IP: " + WiFi.softAPIP().toString());
}

void setupWiFi() {
  WiFi.softAP(ssid, password);
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP: ");
  Serial.println(IP);
}

void setupServer() {
  // Rota principal de controle
  server.on("/action", HTTP_GET, handleAction);
  
  // Rota de status do powerbank
  server.on("/status", HTTP_GET, handleStatus);
  
  // Rota de teste
  server.on("/test", HTTP_GET, handleTest);
  
  server.begin();
  Serial.println("🌐 Servidor HTTP iniciado");
}

void loop() {
  server.handleClient();
  
  // Atualizar status a cada 2 segundos
  static unsigned long lastUpdate = 0;
  if (millis() - lastUpdate > 2000) {
    updateBatteryStatus();
    lastUpdate = millis();
  }
  
  // Atualizar uptime
  uptime = millis() / 1000;
  
  // Piscar LED baseado no status da bateria
  blinkLED();
}

// ===========================================
// MONITORAMENTO DO POWERBANK
// ===========================================

void updateBatteryStatus() {
  // Ler tensão do powerbank
  int rawValue = analogRead(BATTERY_PIN);
  batteryVoltage = (rawValue / 4095.0) * 3.3 * 2; // Divisor de tensão 1:2
  
  // Calcular porcentagem
  batteryPercentage = calculateBatteryPercentage(batteryVoltage);
  
  // Log de status
  Serial.println("🔋 Powerbank: " + String(batteryVoltage, 2) + "V (" + String(batteryPercentage) + "%)");
  
  // Alerta de bateria baixa
  if (batteryVoltage < VOLTAGE_CRITICAL) {
    Serial.println("⚠️ ALERTA: Bateria crítica!");
    digitalWrite(LED_STATUS, HIGH);
  } else {
    digitalWrite(LED_STATUS, LOW);
  }
}

int calculateBatteryPercentage(float voltage) {
  if (voltage >= VOLTAGE_MAX) return 100;
  if (voltage <= VOLTAGE_MIN) return 0;
  
  float percentage = ((voltage - VOLTAGE_MIN) / (VOLTAGE_MAX - VOLTAGE_MIN)) * 100;
  return constrain(percentage, 0, 100);
}

void blinkLED() {
  static unsigned long lastBlink = 0;
  static bool ledState = false;
  
  // Frequência baseada no status da bateria
  int blinkInterval = batteryPercentage > 50 ? 2000 : 500;
  
  if (millis() - lastBlink > blinkInterval) {
    ledState = !ledState;
    digitalWrite(LED_STATUS, ledState);
    lastBlink = millis();
  }
}

// ===========================================
// HANDLERS DO SERVIDOR
// ===========================================

void handleAction() {
  String action = server.arg("go");
  Serial.println("📡 Comando: " + action);
  
  // Atualizar estatísticas
  totalCommands++;
  lastCommand = action;
  
  if (action == "F") {
    goForward();
    server.send(200, "text/plain", "Frente");
  }
  else if (action == "B") {
    goBack();
    server.send(200, "text/plain", "Trás");
  }
  else if (action == "L") {
    goLeft();
    server.send(200, "text/plain", "Esquerda");
  }
  else if (action == "R") {
    goRight();
    server.send(200, "text/plain", "Direita");
  }
  else if (action == "S") {
    stop();
    server.send(200, "text/plain", "Parado");
  }
  else if (action == "l") {
    toggleLight();
    server.send(200, "text/plain", "Luz " + (digitalRead(5) ? "ON" : "OFF"));
  }
  else if (action.startsWith("m")) {
    String message = action.substring(1);
    handleMessage(message);
    server.send(200, "text/plain", "Mensagem: " + message);
  }
  else {
    server.send(400, "text/plain", "Comando inválido");
  }
}

void handleStatus() {
  // Atualizar status antes de enviar
  updateBatteryStatus();
  
  // Criar JSON de resposta
  DynamicJsonDocument doc(1024);
  doc["battery"] = batteryPercentage;
  doc["voltage"] = batteryVoltage;
  doc["uptime"] = formatUptime(uptime);
  doc["commands"] = totalCommands;
  doc["lastCommand"] = lastCommand;
  doc["status"] = "online";
  doc["timestamp"] = millis();
  
  // Adicionar alertas
  if (batteryVoltage < VOLTAGE_CRITICAL) {
    doc["alert"] = "BATERIA_CRITICA";
  } else if (batteryPercentage < 20) {
    doc["alert"] = "BATERIA_BAIXA";
  } else {
    doc["alert"] = "NORMAL";
  }
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
  
  Serial.println("📊 Status enviado: " + response);
}

void handleTest() {
  server.send(200, "text/plain", "🔋 Powerbank Monitor OK");
}

String formatUptime(unsigned long seconds) {
  int hours = seconds / 3600;
  int minutes = (seconds % 3600) / 60;
  int secs = seconds % 60;
  
  char buffer[10];
  sprintf(buffer, "%02d:%02d:%02d", hours, minutes, secs);
  return String(buffer);
}

// ===========================================
// FUNÇÕES DE CONTROLE (existentes)
// ===========================================

void goForward() {
  Serial.println("→ FRENTE");
  // Implementar controle de motores
}

void goBack() {
  Serial.println("← TRÁS");
  // Implementar controle de motores
}

void goLeft() {
  Serial.println("↰ ESQUERDA");
  // Implementar controle de motores
}

void goRight() {
  Serial.println("↱ DIREITA");
  // Implementar controle de motores
}

void stop() {
  Serial.println("⏹ PARAR");
  // Implementar controle de motores
}

void toggleLight() {
  Serial.println("💡 LUZ");
  // Implementar controle de luz
}

void handleMessage(String message) {
  Serial.println("📨 Mensagem: " + message);
  // Implementar exibição de mensagem
}

// ===========================================
// FUNÇÕES AUXILIARES
// ===========================================

void printBatteryInfo() {
  Serial.println("=== STATUS DO POWERBANK ===");
  Serial.println("Tensão: " + String(batteryVoltage, 2) + "V");
  Serial.println("Porcentagem: " + String(batteryPercentage) + "%");
  Serial.println("Uptime: " + formatUptime(uptime));
  Serial.println("Comandos: " + String(totalCommands));
  Serial.println("Último: " + lastCommand);
  Serial.println("==========================");
}

void emergencyShutdown() {
  Serial.println("🚨 SHUTDOWN DE EMERGÊNCIA - BATERIA CRÍTICA!");
  
  // Parar todos os motores
  stop();
  
  // Desligar luzes
  digitalWrite(5, LOW);
  
  // Piscar LED de alerta
  for (int i = 0; i < 10; i++) {
    digitalWrite(LED_STATUS, HIGH);
    delay(100);
    digitalWrite(LED_STATUS, LOW);
    delay(100);
  }
}
```

---

## 🔧 Configuração do Divisor de Tensão

### **Esquema de Conexão**:
```
Powerbank 5V ──┬── 10kΩ ──┬── GPIO36 (ADC)
              │          │
              │          └── 10kΩ ── GND
              │
              └── GND
```

### **Cálculo da Tensão**:
```cpp
// Divisor 1:2 (10kΩ + 10kΩ)
float voltage = (analogRead(36) / 4095.0) * 3.3 * 2;
```

---

## 📊 Calibração do Powerbank

### **1. Medir Tensões Reais**:
```cpp
void calibrateBattery() {
  Serial.println("🔧 CALIBRAÇÃO DO POWERBANK");
  Serial.println("1. Conecte multímetro ao powerbank");
  Serial.println("2. Anote tensão real");
  Serial.println("3. Compare com leitura do ADC");
  
  int raw = analogRead(BATTERY_PIN);
  float measured = (raw / 4095.0) * 3.3 * 2;
  
  Serial.println("ADC Raw: " + String(raw));
  Serial.println("Tensão Calculada: " + String(measured, 2) + "V");
  Serial.println("Tensão Real: ___V");
}
```

### **2. Ajustar Constantes**:
```cpp
// Ajustar baseado na calibração
const float VOLTAGE_MIN = 3.0;    // 0% - Ajustar conforme necessário
const float VOLTAGE_MAX = 4.2;    // 100% - Ajustar conforme necessário
const float VOLTAGE_CRITICAL = 3.3; // Alerta - Ajustar conforme necessário
```

---

## 🚨 Alertas e Segurança

### **Níveis de Alerta**:
- **🟢 Normal**: > 50% (4.0V+)
- **🟡 Baixo**: 20-50% (3.5-4.0V)
- **🟠 Crítico**: 10-20% (3.3-3.5V)
- **🔴 Emergência**: < 10% (< 3.3V)

### **Ações Automáticas**:
```cpp
void checkBatterySafety() {
  if (batteryVoltage < 3.0) {
    emergencyShutdown();
  } else if (batteryVoltage < 3.3) {
    Serial.println("⚠️ ALERTA: Bateria muito baixa!");
    // Reduzir velocidade dos motores
  }
}
```

---

## 📱 Integração com o App

### **Endpoint de Status**:
```http
GET /status HTTP/1.1
Host: 192.168.4.1

Response:
{
  "battery": 75,
  "voltage": 3.9,
  "uptime": "01:23:45",
  "commands": 42,
  "lastCommand": "F",
  "status": "online",
  "alert": "NORMAL"
}
```

### **Monitoramento em Tempo Real**:
- **Atualização**: A cada 3 segundos
- **Alerta**: Notificação quando bateria baixa
- **Histórico**: Log de comandos e status

---

## 🔋 Especificações do Powerbank

### **Recomendado**:
- **Capacidade**: 10000mAh ou mais
- **Saída**: 5V/2A (mínimo)
- **Tecnologia**: Li-Po ou Li-Ion
- **Proteções**: Sobrecarga, curto-circuito

### **Conexão**:
```
Powerbank USB → ESP32 VIN
Powerbank GND → ESP32 GND
Divisor de Tensão → GPIO36
```

---

**Versão**: 1.0.0  
**Compatível com**: ESP32, Powerbank 5V  
**Última Atualização**: Janeiro 2025
