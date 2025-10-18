# 🌐 Configuração de Rede - UOLI Car Control

## 📋 Visão Geral da Rede

O sistema UOLI utiliza uma rede WiFi local para comunicação entre o app mobile e o Arduino ESP32.

### Topologia da Rede:
```
📱 App Mobile (Cliente)
    ↕ WiFi
📡 ESP32 (Access Point)
    ↕ Hardware
🚗 Carrinho Inteligente
```

---

## 🔧 Configuração da Rede

### **1. Configuração do ESP32 (Access Point)**

```cpp
// Configuração básica
const char* ssid = "UOLI_CAR";
const char* password = "12345678";

void setupWiFi() {
  WiFi.softAP(ssid, password);
  IPAddress IP = WiFi.softAPIP();
  Serial.println("AP IP: " + IP.toString());
}
```

### **2. Configuração do App Mobile**

```typescript
// No CarControlService
export class CarControlService {
  baseUrl: string = "http://192.168.4.1"; // IP padrão do ESP32 AP
}
```

### **3. Configuração da Câmera**

```typescript
// No CameraDisplay
const url = 'http://192.168.4.1:81/stream';
```

---

## 📡 Especificações da Rede

### **Parâmetros de Rede**:
- **SSID**: `UOLI_CAR`
- **Senha**: `12345678`
- **IP do ESP32**: `192.168.4.1`
- **Porta HTTP**: `80`
- **Porta da Câmera**: `81`
- **Protocolo**: HTTP/1.1
- **Formato de Dados**: JSON, MJPEG

### **Configurações Avançadas**:
```cpp
// Configuração personalizada do ESP32
WiFi.softAPConfig(
  IPAddress(192, 168, 4, 1),    // IP do AP
  IPAddress(192, 168, 4, 1),    // Gateway
  IPAddress(255, 255, 255, 0)   // Máscara
);
```

---

## 🔌 Protocolo de Comunicação

### **1. Estrutura das Requisições**

#### **Controle de Movimento**:
```http
GET /action?go={comando} HTTP/1.1
Host: 192.168.4.1
User-Agent: UOLI-App/1.0
```

#### **Comandos Disponíveis**:
| Comando | Ação | Resposta |
|---------|------|----------|
| `F` | Frente | `"Frente"` |
| `B` | Trás | `"Trás"` |
| `L` | Esquerda | `"Esquerda"` |
| `R` | Direita | `"Direita"` |
| `S` | Parar | `"Parado"` |
| `l` | Toggle Luz | `"Luz ON/OFF"` |
| `m{texto}` | Mensagem | `"Mensagem: {texto}"` |

### **2. Exemplos de Requisições**

#### **JavaScript/TypeScript**:
```typescript
// Usando fetch
const response = await fetch('http://192.168.4.1/action?go=F');
const result = await response.text();
console.log(result); // "Frente"

// Usando axios (como no projeto)
await axios.get('http://192.168.4.1/action?go=F');
```

#### **cURL**:
```bash
# Teste manual
curl "http://192.168.4.1/action?go=F"
curl "http://192.168.4.1/action?go=S"
curl "http://192.168.4.1/status"
```

#### **Python**:
```python
import requests

# Controle básico
response = requests.get('http://192.168.4.1/action?go=F')
print(response.text)

# Enviar mensagem
message = "Hello World"
response = requests.get(f'http://192.168.4.1/action?go=m{message}')
```

---

## 🎥 Streaming de Vídeo

### **1. Configuração da Câmera**

```cpp
// Configuração ESP32-CAM
camera_config_t config;
config.frame_size = FRAMESIZE_VGA;    // 640x480
config.jpeg_quality = 12;              // Qualidade (0-63)
config.fb_count = 1;                   // Buffer frames
```

### **2. Endpoint de Stream**

```http
GET /stream HTTP/1.1
Host: 192.168.4.1:81
Accept: image/jpeg
```

### **3. Integração no App**

```typescript
// WebView para stream
<WebView
  source={{ uri: 'http://192.168.4.1:81/stream' }}
  style={styles.webView}
  userAgent="UOLI-App/1.0"
/>
```

---

## 🔧 Troubleshooting de Rede

### **Problemas Comuns**:

#### **1. App não conecta ao ESP32**
```
Error: Network request failed
```

**Soluções**:
- Verificar se o ESP32 está ligado
- Verificar se a rede "UOLI_CAR" está visível
- Verificar senha da rede
- Reiniciar o ESP32

#### **2. Câmera não carrega**
```
Camera stream not loading
```

**Soluções**:
- Verificar URL da câmera
- Verificar se a porta 81 está aberta
- Verificar configuração da câmera no ESP32
- Testar stream no navegador

#### **3. Controles não respondem**
```
Controls not working
```

**Soluções**:
- Verificar se as requisições HTTP estão chegando
- Verificar logs do ESP32
- Verificar conexão dos motores
- Testar com ferramentas como Postman

#### **4. Conexão instável**
```
Connection drops frequently
```

**Soluções**:
- Verificar distância entre dispositivos
- Verificar interferência de outras redes
- Ajustar potência do sinal WiFi
- Verificar alimentação do ESP32

---

## 🛠️ Ferramentas de Debug

### **1. Monitor Serial (Arduino IDE)**
```cpp
void debugNetwork() {
  Serial.println("=== DEBUG DE REDE ===");
  Serial.println("SSID: " + String(ssid));
  Serial.println("IP: " + WiFi.softAPIP().toString());
  Serial.println("Clientes conectados: " + WiFi.softAPgetStationNum());
}
```

### **2. Teste de Conectividade**
```bash
# Ping test
ping 192.168.4.1

# Port scan
nmap -p 80,81 192.168.4.1

# HTTP test
curl -v http://192.168.4.1/test
```

### **3. Monitor de Rede**
```typescript
// No app, adicionar logs
const testConnection = async () => {
  try {
    const response = await fetch('http://192.168.4.1/test');
    console.log('Conexão OK:', await response.text());
  } catch (error) {
    console.error('Erro de conexão:', error);
  }
};
```

---

## 🔒 Segurança da Rede

### **1. Configurações de Segurança**

```cpp
// Senha forte
const char* password = "UOLI_2025_Secure!";

// WPA2 (recomendado)
WiFi.softAP(ssid, password, 1, 0, 4); // 4 clientes máximo
```

### **2. Autenticação (Opcional)**

```cpp
// Middleware de autenticação
bool authenticateRequest() {
  String token = server.arg("token");
  return token == "UOLI_SECRET_TOKEN";
}

void handleAction() {
  if (!authenticateRequest()) {
    server.send(401, "text/plain", "Unauthorized");
    return;
  }
  // ... resto do código
}
```

### **3. Rate Limiting**

```cpp
unsigned long lastRequest = 0;
const unsigned long RATE_LIMIT = 100; // 100ms entre requests

void handleAction() {
  unsigned long now = millis();
  if (now - lastRequest < RATE_LIMIT) {
    server.send(429, "text/plain", "Too Many Requests");
    return;
  }
  lastRequest = now;
  // ... processar comando
}
```

---

## 📊 Monitoramento de Performance

### **1. Métricas de Rede**

```cpp
// Estatísticas de rede
struct NetworkStats {
  int totalRequests = 0;
  int failedRequests = 0;
  unsigned long uptime = 0;
  int connectedClients = 0;
};

NetworkStats stats;

void updateStats() {
  stats.totalRequests++;
  stats.uptime = millis();
  stats.connectedClients = WiFi.softAPgetStationNum();
}
```

### **2. Endpoint de Status**

```cpp
void handleStatus() {
  DynamicJsonDocument doc(1024);
  doc["network"]["ssid"] = ssid;
  doc["network"]["ip"] = WiFi.softAPIP().toString();
  doc["network"]["clients"] = WiFi.softAPgetStationNum();
  doc["stats"]["requests"] = stats.totalRequests;
  doc["stats"]["uptime"] = stats.uptime;
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}
```

---

## 🚀 Otimizações de Performance

### **1. Compressão de Dados**

```cpp
// Compressão de resposta
server.sendHeader("Content-Encoding", "gzip");
server.send(200, "application/json", compressedResponse);
```

### **2. Cache de Headers**

```cpp
// Headers de cache
server.sendHeader("Cache-Control", "no-cache, no-store");
server.sendHeader("Pragma", "no-cache");
```

### **3. Conexões Persistentes**

```cpp
// Keep-alive
server.sendHeader("Connection", "keep-alive");
server.sendHeader("Keep-Alive", "timeout=5, max=100");
```

---

## 📱 Configuração do App

### **1. Timeout de Conexão**

```typescript
// Configuração do axios
const api = axios.create({
  baseURL: 'http://192.168.4.1',
  timeout: 5000, // 5 segundos
  headers: {
    'User-Agent': 'UOLI-App/1.0'
  }
});
```

### **2. Retry Automático**

```typescript
const sendCommand = async (command: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await api.get(`/action?go=${command}`);
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};
```

### **3. Verificação de Conectividade**

```typescript
const checkConnection = async () => {
  try {
    await api.get('/test');
    return true;
  } catch {
    return false;
  }
};
```

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Compatível com**: ESP32, React Native, Expo
