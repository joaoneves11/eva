# 🤖 E.V.A. Face and Movement Controller (Arduino/TFT)

Este projeto implementa a interface visual da E.V.A. (do filme Wall-E) em um display TFT, controlando a expressão dos olhos e a movimentação de um robô ou dispositivo via comunicação serial. O código foi otimizado para estabilidade visual e comunicação eficiente.

## ✨ Destaques do Código

* **Expressão E.V.A. Focada:** Olhos no formato inclinado `/ \`.
* **Controle de Posição:** O conjunto dos olhos é deslocado para a **direita** do centro da tela para um visual mais autêntico.
* **Estabilidade Visual:** Implementação de uma **limpeza de pixel reforçada** para eliminar artefatos (rastros) ao movimentar os olhos (`olhoDir`).
* **Performance:** A dinâmica de piscada automática (`blink`) foi **removida** do `loop()` para garantir maior estabilidade de *framerate* durante o movimento e a comunicação.
* **Comunicação Serial:** Recebe comandos específicos (`F`, `L`, `m`, etc.) para controlar movimento, luz e mensagens de texto na tela.

---

## ⚙️ Configuração e Hardware

### Dependências
O projeto requer a biblioteca:
* `MCUFRIEND_kbv.h`: Driver principal para displays TFT compatíveis.

### Definições de Pinos e Cores

| Definição | Valor (Pino) | Função |
| :--- | :--- | :--- |
| **`EVA_BLUE`** | `0x07FF` | Cor Ciano Neon dos olhos. |
| `FR`, `BR`, `FL`, `BL` | `41`, `43`, `45`, `47` | Pinos de controle de motores (Frente/Trás/Esquerda/Direita). |
| `LUZ` | `A6` | Pino para ligar/desligar luz externa. |

O display TFT é configurado na **rotação 3 (paisagem)**.

---

## 🎨 Lógica Gráfica

### `desenharOlhoInclinado(xCentro, yCentro, largura, altura, inclinacao, cor)`

Esta é a função de renderização central.
* Utiliza cálculo de **elipse com inclinação (shear)** para desenhar a forma oval característica.
* Implementa **Proteção Contra Erros de Tela (Bounds Checking)**. Esta lógica verifica se as coordenadas de pixel caem fora dos limites do display (`screenWidth` / `screenHeight`) e ajusta a linha ou ignora o desenho, prevenindo artefatos visuais.

### `olho` e `olhoFeliz`

As funções de desenho dos olhos incluem o offset horizontal e a rotina de limpeza:

```cpp
// Exemplo de deslocamento e limpeza reforçada
int xBase = getPosi(x) + 20 + 40; // +40 para mover para a DIREITA
// Limpa uma área fixa grande o suficiente para cobrir todos os deslocamentos
tft.fillRect(xBase - 70, yBase - 45, 180, 90, TFT_BLACK);
```
## Local dos códigos e board para configuração na INO IDE
Arduino: cod_completo_arduino_mega.ino
Board: arduino mega 2560
ESP32CAM: cod_completo_esp32_cam.ino
Board na Ino IDE: AI Thinker