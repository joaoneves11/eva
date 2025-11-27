/*
 * CÓDIGO:  Q0684 - ADAPTADO PARA VISUAL "EVA (WALL-E)" 
 * AJUSTE FINAL: OLHOS DESLOCADOS À DIREITA, LIMPEZA DE PIXEL REFORÇADA, BLINK REMOVIDO.
*/

/#include <MCUFRIEND_kbv.h>

// DEFINIÇÕES
#define EVA_BLUE 0x07FF // Ciano Neon
#define FR 41
#define BR 43 
#define FL 45 
#define BL 47 
#define LUZ A6
#define OLHO EVA_BLUE 

MCUFRIEND_kbv tft;
int screenWidth;
int screenHeight;

void setup() {
  Serial1.begin(115200);
  Serial.begin(115200);
  uint16_t ID = tft.readID();
  tft.begin(ID);
  
  tft.setRotation(3); // Display na horizontal (paisagem)
  screenWidth = tft.width();
  screenHeight = tft.height();

  pinMode(FR, OUTPUT);
  pinMode(BR, OUTPUT);
  pinMode(FL, OUTPUT);
  pinMode(BL, OUTPUT);
  pinMode(LUZ, OUTPUT);
  
  digitalWrite(FR, LOW);
  digitalWrite(BR, LOW);
  digitalWrite(FL, LOW);
  digitalWrite(BL, LOW);
  digitalWrite(LUZ, LOW);
  
  tft.fillScreen(TFT_BLACK);
  tft.setTextColor(EVA_BLUE);
  tft.setTextSize(10);
  tft.setCursor(20, 90); 
  tft.print("E.V.A.");
  delay(3000);
  makeFace(); 
}

bool falando = false;
int cont_fala = 0;
int textSize = 2;
int olhoDir = 0; 
bool sorrindo = false; 

void loop() {
  if(Serial1.available()) serialComunication();
  
  // *** BLINK REMOVIDO ***
  // Apenas a lógica do contador de fala é mantida.
  
  if(falando){
    cont_fala++;
    if(cont_fala==100){ 
      makeFace();
      cont_fala=0;
      falando = false;
    }
  }
  
  delay(100); 
}

void serialComunication(){
  while(Serial1.available()){
    char c = Serial1.read();
    switch(c){
      case 'F': 
        digitalWrite(FR, LOW); digitalWrite(BR, HIGH);
        digitalWrite(FL, LOW); digitalWrite(BL, HIGH);
        Serial.println("Frente");
        olhoDir = 0; 
        sorrindo = false; 
        olho(2, true);    
        olho(13, false);
      break;
      
      case 'B': 
        digitalWrite(FR, HIGH); digitalWrite(BR, LOW);
        digitalWrite(FL, HIGH); digitalWrite(BL, LOW);
        Serial.println("Tras");
        olhoDir = 0; 
        sorrindo = false; 
        olho(2, true);
        olho(13, false);
      break;
      
      case 'R': 
        digitalWrite(FR, LOW); digitalWrite(BR, LOW);
        digitalWrite(FL, LOW); digitalWrite(BL, HIGH);
        Serial.println("Direita");
        olhoDir = -20; 
        sorrindo = false;
        olho(2, true);
        olho(13, false);
      break;
      
      case 'L': 
        digitalWrite(FR, LOW); digitalWrite(BR, HIGH);
        digitalWrite(FL, LOW); digitalWrite(BL, LOW);
        Serial.println("Esquerda");
        olhoDir = 20; 
        sorrindo = false;
        olho(2, true);
        olho(13, false);
      break;
      
      case 'S': 
        digitalWrite(FR, LOW); digitalWrite(BR, LOW);
        digitalWrite(FL, LOW); digitalWrite(BL, LOW);
        Serial.println("Para");
        olhoDir = 0; 
        sorrindo = false; 
        olho(2, true);          
        olho(13, false);
      break;
      
      case 'l': 
        if(digitalRead(LUZ)==LOW) digitalWrite(LUZ, HIGH);
        else digitalWrite(LUZ, LOW);
      break;
      
      case 'm': 
          String mensagem = "";
          char incomingChar = Serial1.read();
          while(Serial1.available() || incomingChar != '\n'){
             if(Serial1.available()){
                char nextChar = Serial1.read();
                if(nextChar == '\n') break;
                mensagem.concat(incomingChar);
                incomingChar = nextChar;
             }
             if(!Serial1.available() && incomingChar != '\n') {
                mensagem.concat(incomingChar); 
                break;
             }
             delay(2);
          }
          
          tft.setTextColor(TFT_BLACK); 
          tft.setTextSize(textSize);
          tft.setCursor(30, getPosi(8)+10); 
          retanguloDelay(getPosi(0), getPosi(8), getPosi(5), getPosi(20), TFT_WHITE, 2); 
          tft.print(mensagem);
          cont_fala=0;
          falando=true;
      break;
      default: 
      break;
    }
  }
}

void makeFace(){
  tft.fillScreen(TFT_BLACK); 
  olho(2, true);   
  olho(13, false); 
}

int getPosi(int prop){
  return 16*prop;
}

// ==========================================
// FUNÇÕES VISUAIS COM PROTEÇÃO DE TELA
// ==========================================

void desenharOlhoInclinado(int xCentro, int yCentro, int largura, int altura, float inclinacao, uint16_t cor) {
  for(int y = -altura; y <= altura; y++) {
     int w_atual = (int)(largura * sqrt(1.0 - (y*y)/(float)(altura*altura)));
     int x_shift = (int)(y * inclinacao);
     
     if(w_atual > 0) { 
       int xStart = xCentro + x_shift - w_atual + olhoDir;
       int yPos = yCentro + y;
       int len = 2 * w_atual;

       // Proteção contra erros de tela
       if(xStart < 0) { 
         len += xStart; 
         xStart = 0;    
       }
       if(xStart + len > screenWidth) { 
         len = screenWidth - xStart; 
       }

       if(yPos >= 0 && yPos < screenHeight && len > 0) {
          tft.drawFastHLine(xStart, yPos, len, cor);
       }
     }
  }
}

// OLHO NORMAL
void olho(int x, bool isLeft){
  // Posição base ajustada para deslocar o conjunto dos olhos para a DIREITA
  int xBase = getPosi(x) + 20 + 12; 
  int yBase = getPosi(3) + 10;
  
  // Limpeza de área REFORÇADA: Cobre todo o movimento (-20 a +20)
  // O retângulo de limpeza não se move com olhoDir, ele cobre a área máxima
  int xClear = xBase - 70; // Começa antes do limite esquerdo (-20 + 50)
  if(xClear < 0) xClear = 0;
  tft.fillRect(xClear, yBase - 45, 180, 90, TFT_BLACK); // 180 de largura garante que cubra o movimento

  int larguraRaio = 50; 
  int alturaRaio = 32;  
  
  // Inclinação / \ (MANTIDO)
  float inclinacao = isLeft ? 0.45 : -0.45; 

  desenharOlhoInclinado(xBase, yBase, larguraRaio, alturaRaio, inclinacao, OLHO);
}

// OLHO SORRINDO (Mantido, mas não usado no loop/comandos de movimento)
void olhoFeliz(int x, bool isLeft){
  // Posição base ajustada para deslocar o conjunto dos olhos para a DIREITA
  int xBase = getPosi(x) + 20 + 40;
  int yBase = getPosi(3) + 10;
  
  // Limpeza de área REFORÇADA
  int xClear = xBase - 70;
  if(xClear < 0) xClear = 0;
  tft.fillRect(xClear, yBase - 45, 180, 90, TFT_BLACK); 

  int larguraRaio = 50; 
  int alturaRaio = 32;  
  float inclinacao = isLeft ? 0.45 : -0.45; 

  desenharOlhoInclinado(xBase, yBase, larguraRaio, alturaRaio, inclinacao, OLHO);

  // Corte do sorriso (Circulo Preto)
  int yCorte = yBase + 30; 
  int xCentroCorte = xBase + (int)(30 * inclinacao) + olhoDir;
  
  // Proteção de limites
  if (xCentroCorte < 0) xCentroCorte = 0;
  if (xCentroCorte > screenWidth) xCentroCorte = screenWidth;
  if (yCorte < 0) yCorte = 0;
  if (yCorte > screenHeight) yCorte = screenHeight;

  tft.fillCircle(xCentroCorte, yCorte, 45, TFT_BLACK); 
}

void retanguloDelay(int x, int y, int altura, int largura, uint16_t cor, int speed){
  for(int i = y; i<y+altura; i++){
     tft.drawFastHLine(x, i, largura, cor);
     delay(speed);
  }
}