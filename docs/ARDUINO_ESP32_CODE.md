# 🤖 Código Arduino ESP32 - UOLI Car Control

## 📋 Configuração Completa do Hardware

### Componentes Necessários:
- **ESP32 DevKit** (WiFi + Bluetooth)
- **ESP32-CAM** (Câmera + WiFi)
- **Driver L298N** (Controle de Motores)
- **2x Motores DC** (12V, 200-300 RPM)
- **LEDs** (5V, para iluminação)
- **Bateria 12V** (Para motores)
- **Regulador 5V** (Para ESP32)
- **Jumpers e Protoboard**

### Conexões:
```
ESP32 → L298N
GPIO2  → IN1 (Motor A)
GPIO4  → IN2 (Motor A)
GPIO16 → IN3 (Motor B)
GPIO17 → IN4 (Motor B)
GPIO5  → LED (Luz)
```

---

## 🔧 Código Principal (ESP32)

```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Camera.h>
#include <ArduinoJson.h>

// Configuração da rede
const char* ssid = "UOLI_CAR";
const char* password = "12345678";

// Configuração do servidor
WebServer server(80);
ESP32Camera camera;

// Pinos dos motores
#define MOTOR_A1 2
#define MOTOR_A2 4
#define MOTOR_B1 16
#define MOTOR_B2 17
#define LIGHT_PIN 5

// Estados
bool isMoving = false;
bool lightOn = false;
String lastMessage = "";

void setup() {
  Serial.begin(115200);
  
  // Configurar pinos
  pinMode(MOTOR_A1, OUTPUT);
  pinMode(MOTOR_A2, OUTPUT);
  pinMode(MOTOR_B1, OUTPUT);
  pinMode(MOTOR_B2, OUTPUT);
  pinMode(LIGHT_PIN, OUTPUT);
  
  // Inicializar motores parados
  stop();
  
  // Configurar WiFi AP
  setupWiFi();
  
  // Configurar câmera
  setupCamera();
  
  // Configurar rotas
  setupRoutes();
  
  Serial.println("UOLI Car Control iniciado!");
  Serial.println("IP: " + WiFi.softAPIP().toString());
}

void setupWiFi() {
  WiFi.softAP(ssid, password);
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP: ");
  Serial.println(IP);
}

void setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = 5;
  config.pin_d1 = 18;
  config.pin_d2 = 19;
  config.pin_d3 = 21;
  config.pin_d4 = 36;
  config.pin_d5 = 39;
  config.pin_d6 = 34;
  config.pin_d7 = 35;
  config.pin_xclk = 0;
  config.pin_pclk = 22;
  config.pin_vsync = 25;
  config.pin_href = 23;
  config.pin_sscb_sda = 26;
  config.pin_sscb_scl = 27;
  config.pin_pwdn = 32;
  config.pin_reset = -1;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = 12;
  config.fb_count = 1;
  
  if (esp_camera_init(&config) != ESP_OK) {
    Serial.println("Erro ao inicializar câmera");
    return;
  }
  
  Serial.println("Câmera inicializada");
}

void setupRoutes() {
  // Rota principal de controle
  server.on("/action", HTTP_GET, handleAction);
  
  // Rota de stream de vídeo
  server.on("/stream", HTTP_GET, handleStream);
  
  // Rota de status
  server.on("/status", HTTP_GET, handleStatus);
  
  // Rota de teste
  server.on("/test", HTTP_GET, handleTest);
  
  server.begin();
  Serial.println("Servidor HTTP iniciado");
}

void loop() {
  server.handleClient();
  delay(1);
}

// ===========================================
// HANDLERS DAS ROTAS
// ===========================================

void handleAction() {
  String action = server.arg("go");
  Serial.println("Comando recebido: " + action);
  
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
    server.send(200, "text/plain", lightOn ? "Luz ON" : "Luz OFF");
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

void handleStream() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    server.send(500, "text/plain", "Erro na câmera");
    return;
  }
  
  server.sendHeader("Content-Type", "image/jpeg");
  server.sendHeader("Content-Length", String(fb->len));
  server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  server.sendHeader("Pragma", "no-cache");
  server.sendHeader("Expires", "0");
  server.send(200, "image/jpeg", (const char *)fb->buf, fb->len);
  
  esp_camera_fb_return(fb);
}

void handleStatus() {
  DynamicJsonDocument doc(1024);
  doc["status"] = "online";
  doc["moving"] = isMoving;
  doc["light"] = lightOn;
  doc["last_message"] = lastMessage;
  doc["uptime"] = millis();
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void handleTest() {
  server.send(200, "text/plain", "UOLI Car Control - OK");
}

// ===========================================
// FUNÇÕES DE CONTROLE
// ===========================================

void goForward() {
  Serial.println("→ FRENTE");
  digitalWrite(MOTOR_A1, HIGH);
  digitalWrite(MOTOR_A2, LOW);
  digitalWrite(MOTOR_B1, HIGH);
  digitalWrite(MOTOR_B2, LOW);
  isMoving = true;
}

void goBack() {
  Serial.println("← TRÁS");
  digitalWrite(MOTOR_A1, LOW);
  digitalWrite(MOTOR_A2, HIGH);
  digitalWrite(MOTOR_B1, LOW);
  digitalWrite(MOTOR_B2, HIGH);
  isMoving = true;
}

void goLeft() {
  Serial.println("↰ ESQUERDA");
  digitalWrite(MOTOR_A1, LOW);
  digitalWrite(MOTOR_A2, HIGH);
  digitalWrite(MOTOR_B1, HIGH);
  digitalWrite(MOTOR_B2, LOW);
  isMoving = true;
}

void goRight() {
  Serial.println("↱ DIREITA");
  digitalWrite(MOTOR_A1, HIGH);
  digitalWrite(MOTOR_A2, LOW);
  digitalWrite(MOTOR_B1, LOW);
  digitalWrite(MOTOR_B2, HIGH);
  isMoving = true;
}

void stop() {
  Serial.println("⏹ PARAR");
  digitalWrite(MOTOR_A1, LOW);
  digitalWrite(MOTOR_A2, LOW);
  digitalWrite(MOTOR_B1, LOW);
  digitalWrite(MOTOR_B2, LOW);
  isMoving = false;
}

void toggleLight() {
  lightOn = !lightOn;
  digitalWrite(LIGHT_PIN, lightOn ? HIGH : LOW);
  Serial.println(lightOn ? "💡 LUZ ON" : "💡 LUZ OFF");
}

void handleMessage(String message) {
  lastMessage = message;
  Serial.println("📨 Mensagem: " + message);
  
  // Aqui você pode implementar lógica específica para cada mensagem
  if (message == "emergency") {
    stop();
    Serial.println("🚨 EMERGÊNCIA - PARANDO");
  }
  else if (message == "status") {
    Serial.println("📊 Status solicitado");
  }
  // Adicione mais comandos conforme necessário
}

// ===========================================
// FUNÇÕES AUXILIARES
// ===========================================

void emergencyStop() {
  stop();
  Serial.println("🚨 PARADA DE EMERGÊNCIA");
}

void blinkLED(int times, int delay_ms) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LIGHT_PIN, HIGH);
    delay(delay_ms);
    digitalWrite(LIGHT_PIN, LOW);
    delay(delay_ms);
  }
}

void setupComplete() {
  // Piscar LED para indicar que está pronto
  blinkLED(3, 200);
  Serial.println("✅ Setup completo!");
}
```

---

## 🔧 Configuração Avançada

### 1. **Bibliotecas Necessárias**:
```cpp
// Instalar via Arduino IDE Library Manager:
- WiFi (já incluída)
- WebServer (já incluída)
- ESP32Camera (já incluída)
- ArduinoJson (instalar)
```

### 2. **Configuração do Arduino IDE**:
```
Board: "ESP32 Dev Module"
Upload Speed: 115200
CPU Frequency: 240MHz
Flash Mode: QIO
Flash Size: 4MB
Partition Scheme: "Huge APP (3MB No OTA/1MB SPIFFS)"
```

### 3. **Configuração de Rede**:
```cpp
// Para mudar SSID e senha:
const char* ssid = "SEU_SSID";
const char* password = "SUA_SENHA";

// Para conectar a rede existente (modo cliente):
WiFi.begin(ssid, password);
```

---

## 📡 Endpoints da API

### **Controle de Movimento**:
```
GET /action?go=F    # Frente
GET /action?go=B    # Trás
GET /action?go=L    # Esquerda
GET /action?go=R    # Direita
GET /action?go=S    # Parar
```

### **Controle de Luz**:
```
GET /action?go=l    # Toggle Luz
```

### **Mensagens**:
```
GET /action?go=mHello    # Enviar mensagem "Hello"
```

### **Stream de Vídeo**:
```
GET /stream    # Stream de vídeo MJPEG
```

### **Status**:
```
GET /status    # JSON com status do sistema
```

### **Teste**:
```
GET /test      # Teste de conectividade
```

---

## 🛠️ Troubleshooting

### **Problemas Comuns**:

#### 1. **ESP32 não inicia**:
- Verificar alimentação (5V)
- Verificar conexões
- Verificar se o código compila

#### 2. **WiFi não funciona**:
- Verificar SSID e senha
- Verificar se o ESP32 suporta AP mode
- Verificar antena

#### 3. **Câmera não funciona**:
- Verificar conexões da câmera
- Verificar configuração dos pinos
- Verificar alimentação da câmera

#### 4. **Motores não respondem**:
- Verificar driver L298N
- Verificar alimentação 12V
- Verificar conexões dos motores

### **Logs de Debug**:
```cpp
// Adicionar no setup():
Serial.begin(115200);
Serial.println("Iniciando debug...");

// Adicionar em cada função:
Serial.println("Função chamada: " + String(__FUNCTION__));
```

---

## 🔋 Otimizações

### **1. Economia de Energia**:
```cpp
// Sleep mode quando inativo
void enterSleepMode() {
  esp_deep_sleep_start();
}

// Wake up por timer ou botão
esp_sleep_enable_timer_wakeup(1000000); // 1 segundo
```

### **2. Controle de Velocidade**:
```cpp
// PWM para controle de velocidade
#define PWM_FREQ 1000
#define PWM_RESOLUTION 8

void setMotorSpeed(int speed) {
  ledcWrite(0, speed); // Canal 0
}
```

### **3. Múltiplos Carrinhos**:
```cpp
// ID único para cada carrinho
#define CAR_ID "UOLI_001"

void handleAction() {
  String carId = server.arg("id");
  if (carId != CAR_ID) return;
  // ... resto do código
}
```

---

## 📱 Teste da Integração

### **1. Teste Manual**:
```bash
# Via curl ou navegador:
curl "http://192.168.4.1/action?go=F"
curl "http://192.168.4.1/status"
curl "http://192.168.4.1/test"
```

### **2. Teste via App**:
1. Conectar ao WiFi "UOLI_CAR"
2. Abrir app UOLI
3. Testar controles
4. Verificar stream de vídeo

### **3. Monitor Serial**:
```
Comando recebido: F
→ FRENTE
Comando recebido: S
⏹ PARAR
```

---

**Versão**: 1.0.0  
**Compatível com**: ESP32, ESP32-CAM  
**Última Atualização**: Janeiro 2025
