/*
 * UOLI - Carrinho Inteligente
 * ESP32 Web Server para controle via app
 * 
 * Funcionalidades:
 * - Servidor web para controle remoto
 * - Monitoramento de bateria em tempo real
 * - Controle de motores DC
 * - API REST para comunicação com app
 */

#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// Configurações de rede
const char* ssid = "UOLI_CAR";
const char* password = "uoli123456";

// Pinos dos motores
#define MOTOR_A_IN1 2
#define MOTOR_A_IN2 4
#define MOTOR_A_ENA 5
#define MOTOR_B_IN1 16
#define MOTOR_B_IN2 17
#define MOTOR_B_ENB 18

// Pinos de controle
#define LED_PIN 2
#define BUZZER_PIN 15

// Pino para leitura da bateria
#define BATTERY_PIN A0

// Configurações PWM
#define PWM_FREQ 1000
#define PWM_RESOLUTION 8
#define PWM_CHANNEL_A 0
#define PWM_CHANNEL_B 1

// Variáveis de controle
WebServer server(80);
int motorSpeed = 150; // Velocidade padrão (0-255)
bool isLightOn = false;
bool isMoving = false;
unsigned long uptimeStart;
int totalCommands = 0;
String lastCommand = "Nenhum";

// Configurações da bateria
const float R1 = 10000.0; // Resistor 1 (10kΩ)
const float R2 = 4700.0;  // Resistor 2 (4.7kΩ)
const float VREF = 3.3;   // Tensão de referência do ESP32

void setup() {
  Serial.begin(115200);
  
  // Configurar pinos
  setupPins();
  
  // Configurar WiFi
  setupWiFi();
  
  // Configurar servidor web
  setupWebServer();
  
  uptimeStart = millis();
  
  Serial.println("🚗 UOLI Carrinho iniciado!");
  Serial.println("📱 Conecte-se ao WiFi: " + String(ssid));
  Serial.println("🌐 Acesse: http://192.168.4.1");
}

void loop() {
  server.handleClient();
  delay(10);
}

void setupPins() {
  // Configurar pinos dos motores
  pinMode(MOTOR_A_IN1, OUTPUT);
  pinMode(MOTOR_A_IN2, OUTPUT);
  pinMode(MOTOR_B_IN1, OUTPUT);
  pinMode(MOTOR_B_IN2, OUTPUT);
  
  // Configurar PWM
  ledcSetup(PWM_CHANNEL_A, PWM_FREQ, PWM_RESOLUTION);
  ledcSetup(PWM_CHANNEL_B, PWM_FREQ, PWM_RESOLUTION);
  ledcAttachPin(MOTOR_A_ENA, PWM_CHANNEL_A);
  ledcAttachPin(MOTOR_B_ENB, PWM_CHANNEL_B);
  
  // Configurar outros pinos
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Parar motores inicialmente
  stopMotors();
}

void setupWiFi() {
  // Criar Access Point
  WiFi.softAP(ssid, password);
  
  Serial.println("📡 WiFi AP criado:");
  Serial.println("SSID: " + String(ssid));
  Serial.println("IP: " + WiFi.softAPIP().toString());
}

void setupWebServer() {
  // Rotas da API
  
  // Status geral
  server.on("/status", HTTP_GET, handleStatus);
  
  // Controle de movimento
  server.on("/forward", HTTP_GET, handleForward);
  server.on("/backward", HTTP_GET, handleBackward);
  server.on("/left", HTTP_GET, handleLeft);
  server.on("/right", HTTP_GET, handleRight);
  server.on("/stop", HTTP_GET, handleStop);
  
  // Controle de velocidade
  server.on("/speed", HTTP_GET, handleSpeed);
  
  // Controle de luz
  server.on("/light", HTTP_GET, handleLight);
  
  // Controle de buzzer
  server.on("/buzz", HTTP_GET, handleBuzz);
  
  // Página principal (opcional)
  server.on("/", HTTP_GET, handleRoot);
  
  server.begin();
  Serial.println("🌐 Servidor web iniciado!");
}

// ===== HANDLERS DA API =====

void handleStatus() {
  DynamicJsonDocument doc(1024);
  
  // Dados da bateria
  float batteryVoltage = readBatteryVoltage();
  int batteryPercent = calculateBatteryPercent(batteryVoltage);
  
  // Uptime
  unsigned long uptime = (millis() - uptimeStart) / 1000;
  String uptimeStr = formatUptime(uptime);
  
  doc["status"] = "ok";
  doc["battery"] = batteryPercent;
  doc["voltage"] = batteryVoltage;
  doc["uptime"] = uptimeStr;
  doc["commands"] = totalCommands;
  doc["lastCommand"] = lastCommand;
  doc["isMoving"] = isMoving;
  doc["isLightOn"] = isLightOn;
  doc["motorSpeed"] = motorSpeed;
  
  String response;
  serializeJson(doc, response);
  
  server.send(200, "application/json", response);
}

void handleForward() {
  moveForward();
  sendCommandResponse("forward", "Movendo para frente");
}

void handleBackward() {
  moveBackward();
  sendCommandResponse("backward", "Movendo para trás");
}

void handleLeft() {
  turnLeft();
  sendCommandResponse("left", "Virando à esquerda");
}

void handleRight() {
  turnRight();
  sendCommandResponse("right", "Virando à direita");
}

void handleStop() {
  stopMotors();
  sendCommandResponse("stop", "Parado");
}

void handleSpeed() {
  if (server.hasArg("value")) {
    int newSpeed = server.arg("value").toInt();
    if (newSpeed >= 0 && newSpeed <= 255) {
      motorSpeed = newSpeed;
      sendCommandResponse("speed", "Velocidade alterada para " + String(motorSpeed));
    } else {
      server.send(400, "text/plain", "Velocidade inválida (0-255)");
    }
  } else {
    server.send(400, "text/plain", "Parâmetro 'value' necessário");
  }
}

void handleLight() {
  isLightOn = !isLightOn;
  digitalWrite(LED_PIN, isLightOn ? HIGH : LOW);
  sendCommandResponse("light", isLightOn ? "Luz ligada" : "Luz desligada");
}

void handleBuzz() {
  // Buzzer por 200ms
  digitalWrite(BUZZER_PIN, HIGH);
  delay(200);
  digitalWrite(BUZZER_PIN, LOW);
  sendCommandResponse("buzz", "Buzzer ativado");
}

void handleRoot() {
  String html = "<!DOCTYPE html><html><head><title>UOLI Carrinho</title></head>";
  html += "<body><h1>🚗 UOLI Carrinho</h1>";
  html += "<p>Status: <span id='status'>Conectado</span></p>";
  html += "<p>Bateria: <span id='battery'>--</span>%</p>";
  html += "<p>Uptime: <span id='uptime'>--</span></p>";
  html += "<script>setInterval(()=>{fetch('/status').then(r=>r.json()).then(d=>{";
  html += "document.getElementById('battery').textContent=d.battery;";
  html += "document.getElementById('uptime').textContent=d.uptime;});},1000);</script>";
  html += "</body></html>";
  
  server.send(200, "text/html", html);
}

// ===== FUNÇÕES DE MOVIMENTO =====

void moveForward() {
  digitalWrite(MOTOR_A_IN1, HIGH);
  digitalWrite(MOTOR_A_IN2, LOW);
  digitalWrite(MOTOR_B_IN1, HIGH);
  digitalWrite(MOTOR_B_IN2, LOW);
  ledcWrite(PWM_CHANNEL_A, motorSpeed);
  ledcWrite(PWM_CHANNEL_B, motorSpeed);
  isMoving = true;
}

void moveBackward() {
  digitalWrite(MOTOR_A_IN1, LOW);
  digitalWrite(MOTOR_A_IN2, HIGH);
  digitalWrite(MOTOR_B_IN1, LOW);
  digitalWrite(MOTOR_B_IN2, HIGH);
  ledcWrite(PWM_CHANNEL_A, motorSpeed);
  ledcWrite(PWM_CHANNEL_B, motorSpeed);
  isMoving = true;
}

void turnLeft() {
  digitalWrite(MOTOR_A_IN1, LOW);
  digitalWrite(MOTOR_A_IN2, HIGH);
  digitalWrite(MOTOR_B_IN1, HIGH);
  digitalWrite(MOTOR_B_IN2, LOW);
  ledcWrite(PWM_CHANNEL_A, motorSpeed);
  ledcWrite(PWM_CHANNEL_B, motorSpeed);
  isMoving = true;
}

void turnRight() {
  digitalWrite(MOTOR_A_IN1, HIGH);
  digitalWrite(MOTOR_A_IN2, LOW);
  digitalWrite(MOTOR_B_IN1, LOW);
  digitalWrite(MOTOR_B_IN2, HIGH);
  ledcWrite(PWM_CHANNEL_A, motorSpeed);
  ledcWrite(PWM_CHANNEL_B, motorSpeed);
  isMoving = true;
}

void stopMotors() {
  digitalWrite(MOTOR_A_IN1, LOW);
  digitalWrite(MOTOR_A_IN2, LOW);
  digitalWrite(MOTOR_B_IN1, LOW);
  digitalWrite(MOTOR_B_IN2, LOW);
  ledcWrite(PWM_CHANNEL_A, 0);
  ledcWrite(PWM_CHANNEL_B, 0);
  isMoving = false;
}

// ===== FUNÇÕES AUXILIARES =====

void sendCommandResponse(String command, String message) {
  totalCommands++;
  lastCommand = command;
  
  DynamicJsonDocument doc(256);
  doc["status"] = "ok";
  doc["command"] = command;
  doc["message"] = message;
  doc["totalCommands"] = totalCommands;
  
  String response;
  serializeJson(doc, response);
  
  server.send(200, "application/json", response);
  
  Serial.println("📱 Comando: " + command + " - " + message);
}

float readBatteryVoltage() {
  int rawValue = analogRead(BATTERY_PIN);
  float voltage = (rawValue * VREF) / 4095.0; // ESP32 tem 12-bit ADC
  voltage = voltage * (R1 + R2) / R2; // Aplicar divisor de tensão
  return voltage;
}

int calculateBatteryPercent(float voltage) {
  // Assumindo bateria Li-Po 3.7V (4.2V cheia, 3.0V vazia)
  if (voltage >= 4.2) return 100;
  if (voltage <= 3.0) return 0;
  return (int)((voltage - 3.0) / (4.2 - 3.0) * 100);
}

String formatUptime(unsigned long seconds) {
  int hours = seconds / 3600;
  int minutes = (seconds % 3600) / 60;
  int secs = seconds % 60;
  
  char buffer[10];
  sprintf(buffer, "%02d:%02d:%02d", hours, minutes, secs);
  return String(buffer);
}
