# 🔧 Guia de Integração com Arduino ESP32

## 📋 **Passo a Passo Completo**

### **1. Hardware Necessário**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   📱 App Expo   │◄──►│  ESP32 Arduino  │◄──►│   🚗 Carrinho   │
│   (React Native)│    │   (Servidor)     │    │   (Motores)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Componentes:**
- ✅ **ESP32** (WiFi + Bluetooth)
- ✅ **Driver de Motor** (L298N ou similar)
- ✅ **Motores DC** (2x para movimento)
- ✅ **Powerbank** (fonte de energia)
- ✅ **Divisor de Tensão** (para monitoramento da bateria)
- ✅ **LED** (luz do carrinho)
- ✅ **Buzzer** (sinal sonoro)

### **2. Conexões do Hardware**

```
ESP32 Pinout:
┌─────────────────┐
│ ESP32           │
│                 │
│ GPIO 2  → LED   │
│ GPIO 4  → IN2   │
│ GPIO 5  → ENA   │
│ GPIO 15 → BUZZER│
│ GPIO 16 → IN1   │
│ GPIO 17 → IN2   │
│ GPIO 18 → ENB   │
│ A0     → BATTERY│
└─────────────────┘
```

**Conexões dos Motores:**
```
Motor A (Esquerdo):
- IN1 → GPIO 2
- IN2 → GPIO 4  
- ENA → GPIO 5 (PWM)

Motor B (Direito):
- IN1 → GPIO 16
- IN2 → GPIO 17
- ENB → GPIO 18 (PWM)
```

**Monitoramento de Bateria:**
```
Powerbank → Divisor de Tensão → A0 (ESP32)
```

### **3. Código Arduino**

O arquivo `ARDUINO_ESP32_COMPLETO.ino` contém:

- ✅ **Servidor Web** (porta 80)
- ✅ **API REST** para controle
- ✅ **Monitoramento de bateria** em tempo real
- ✅ **Controle de motores** PWM
- ✅ **WiFi Access Point** (UOLI_CAR)

### **4. Configuração do App**

#### **A. Modo Demo (Atual)**
```typescript
// app/(tabs)/two.tsx
const [isDemoMode, setIsDemoMode] = useState(true);
```

#### **B. Modo Arduino (Real)**
```typescript
// Quando isDemoMode = false
const fetchRealData = async () => {
  const response = await fetch('http://192.168.4.1/status');
  const data = await response.json();
  // Atualiza dados reais do Arduino
};
```

### **5. Endpoints da API**

| Endpoint | Método | Função |
|----------|--------|--------|
| `/status` | GET | Status geral (bateria, uptime, etc.) |
| `/forward` | GET | Mover para frente |
| `/backward` | GET | Mover para trás |
| `/left` | GET | Virar à esquerda |
| `/right` | GET | Virar à direita |
| `/stop` | GET | Parar motores |
| `/light` | GET | Alternar luz |
| `/buzz` | GET | Ativar buzzer |
| `/speed?value=200` | GET | Alterar velocidade |

### **6. Resposta JSON do Arduino**

```json
{
  "status": "ok",
  "battery": 85,
  "voltage": 4.1,
  "uptime": "01:23:45",
  "commands": 42,
  "lastCommand": "forward",
  "isMoving": true,
  "isLightOn": false,
  "motorSpeed": 150
}
```

### **7. Teste de Integração**

#### **Passo 1: Upload do Código**
1. Abra o Arduino IDE
2. Carregue o arquivo `ARDUINO_ESP32_COMPLETO.ino`
3. Selecione a placa ESP32
4. Faça upload do código

#### **Passo 2: Conectar ao WiFi**
1. No celular, conecte na rede `UOLI_CAR`
2. Senha: `uoli123456`
3. Acesse: `http://192.168.4.1`

#### **Passo 3: Testar no App**
1. Abra o app Expo
2. Vá para a aba "Dashboard"
3. Clique em "🔄 Conectar Arduino"
4. Verifique se os dados aparecem

### **8. Troubleshooting**

#### **❌ Problema: "Network request timed out"**
**Solução:**
- Verifique se o ESP32 está ligado
- Confirme se está conectado na rede `UOLI_CAR`
- Teste o acesso em `http://192.168.4.1` no navegador

#### **❌ Problema: "Cannot connect to Arduino"**
**Solução:**
- Reinicie o ESP32
- Verifique as conexões dos motores
- Confirme se o código foi carregado corretamente

#### **❌ Problema: Motores não funcionam**
**Solução:**
- Verifique as conexões GPIO
- Teste com velocidade baixa (50-100)
- Confirme se o driver L298N está funcionando

### **9. Comandos de Teste**

```bash
# Testar conexão
curl http://192.168.4.1/status

# Mover para frente
curl http://192.168.4.1/forward

# Parar
curl http://192.168.4.1/stop

# Alterar velocidade
curl "http://192.168.4.1/speed?value=200"
```

### **10. Próximos Passos**

1. **✅ Hardware**: Montar o circuito
2. **✅ Código**: Upload no ESP32
3. **✅ Rede**: Conectar no WiFi
4. **✅ App**: Alternar para modo Arduino
5. **✅ Teste**: Verificar funcionamento

### **11. Recursos Adicionais**

- 📁 **Arquivo Arduino**: `ARDUINO_ESP32_COMPLETO.ino`
- 📁 **Documentação**: `DOCUMENTACAO_TECNICA.md`
- 📁 **Setup de Rede**: `NETWORK_SETUP.md`
- 📁 **Monitoramento**: `ARDUINO_POWERBANK_MONITOR.md`

---

## 🎯 **Resumo**

1. **Modo Demo**: Funciona sem hardware (atual)
2. **Modo Arduino**: Conecta com ESP32 real
3. **Alternância**: Botão no dashboard
4. **API REST**: Comunicação app ↔ Arduino
5. **Tempo Real**: Dados atualizados automaticamente

**Status**: ✅ Pronto para implementação!
