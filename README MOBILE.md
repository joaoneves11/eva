# Uoli - Mobile

# 👋 Introdução

Neste diretório contém a aplicação mobile desenvolvida para a comunicação com o carrinho.

O app foi desenvolvido com linguagem **Typescript** utilizando a biblioteca **React Native.**

---

# 🚗 Como rodar

Verifique se você possui o ambiente de desenvolvimento necessário [aqui](https://reactnative.dev/docs/environment-setup).

1. Primeiro clone o repositório para sua máquina.

2. Baixe as dependências necessárias, com o Yarn, utilizando o comando:

```bash
yarn
```

3. Rode o projeto em um dispositivo Android utilizando o seguinte comando:

```bash
yarn run android
```

 # EVA — Mobile

 ## 👋 Introdução

 Este diretório contém o aplicativo mobile do projeto "EVA — Controle de Carrinho". O app foi desenvolvido com TypeScript usando Expo (expo-router) e React Native.

 Informações rápidas do projeto:
 - Nome: `EVA - Controle de Carrinho` (ver `app.json`)
 - SDK Expo: ~54 (conforme `package.json`)
 - Entrada do app: `expo-router/entry`
 - Orientação: `landscape` (configurada em `app.json`)

 ---

 ## 🚗 Como rodar (local)

 Pré-requisitos: Node.js, Yarn (ou npm), e um emulador Android/iOS ou app Expo Go para testar em dispositivo físico.

 1. Instale dependências:

 ```bash
 yarn
 ```

 2. Iniciar o Metro/Dev server (Expo):

 ```bash
 yarn start
 ```

 3. Abrir no Android (emulador ou dispositivo conectado):

 ```bash
 yarn android
 ```

 4. Abrir no iOS (macOS + Xcode):

 ```bash
 yarn ios
 ```

 5. Abrir no navegador (web):

 ```bash
 yarn web
 ```

 Dicas rápidas:
 - Verifique dispositivos conectados: `adb devices`.
 - Se estiver usando dispositivo físico com cabo USB, habilite a depuração USB.
 - Para usar o feed de vídeo da câmera do carrinho, conecte o celular ao Access Point da câmera (ver seção câmera abaixo).

 ---

 ## ⚙️ Principais dependências

 - `expo` / `expo-router` (estrutura de rotas baseada em arquivos)
 - `react` / `react-native`
 - `react-native-webview` — usado para exibir o stream da câmera do carrinho
 - `@expo/vector-icons` — ícones (`Ionicons` etc.)
 - `expo-screen-capture`, `expo-font`, `expo-splash-screen`, `expo-status-bar`
 - `axios` — chamadas HTTP

 Consulte `package.json` para a lista completa e versões.

 ---

 ## 📌 Arquivos e pastas relevantes

 - `app/` — rotas e layouts do app (expo-router). Procure por `+layout.tsx`, `+html.tsx` e `modal.tsx`.
 - `components/` — componentes reutilizáveis. Exemplos importantes:
   - `components/CameraDisplay.tsx` — componente que renderiza o stream da câmera via `WebView`.
   - `components/ControlButtons.tsx` — botões de controle (setas) usados para enviar comandos ao carrinho.
 - `assets/` — imagens e fontes (ícones, splash, etc.).
 - `constants/Colors.ts` — cores usadas no app.
 - `services/carControlService.ts` — serviço responsável pela comunicação com o carrinho (endpoints/requests).

 ---

 ## 🎥 Exibição da câmera

 O app exibe o vídeo captado pela câmera do carrinho usando `react-native-webview`. No projeto existe um componente dedicado: `components/CameraDisplay.tsx`.

 Detalhes importantes:
 - URL usada para o stream (conforme código): `http://192.168.4.1:81/stream`.
 - Em muitos casos a câmera cria um Access Point; para visualizar o stream é necessário conectar o dispositivo ao mesmo ponto de acesso da câmera.
 - O `WebView` neste projeto tem tratamento simples de loading/erro e uma camada visual que indica quando a câmera está "fechada".

 ---

 ## 🎮 Controles do carrinho

 O app recebe entradas do usuário (botões/joystick) e envia comandos ao carrinho via o serviço em `services/carControlService.ts`.

 Componentes de interesse:
 - `components/ControlButtons.tsx` — botões para frente/tras/esquerda/direita e parada.
 - Há também implementação de elementos interativos (arrastáveis/joystick) no projeto, integrados com lógica de envio de comandos.

 ---

 ## 🧾 Estrutura / Convenções

 - O projeto usa `expo-router`, portanto as telas e rotas ficam dentro de `app/` seguindo convenções de roteamento por arquivo.
 - Componentes estão em `components/` e devem ser importados nas telas conforme necessário.
 - Estilos e constantes globais ficam em `constants/`.

 ---

 ## 🛠️ Problemas comuns / troubleshooting

 - Erro ao conectar à câmera: verifique se o telefone está conectado ao Access Point criado pela câmera (ou se ambos estão na mesma rede local).
 - `WebView` não carrega: verifique permissões de rede e se a URL do stream está acessível do dispositivo.
 - Erros de dependências: rode `yarn` novamente e, se necessário, delete `node_modules` e `yarn.lock` e reinstale.

 ---

 ## Onde olhar no código

 - Entrada e rotas: `app/` (`+layout.tsx`, `index.tsx`, etc.)
 - Componentes: `components/` (`CameraDisplay.tsx`, `ControlButtons.tsx`, `ActionBar.tsx`, ...)
 - Serviços de rede/controle: `services/carControlService.ts`

 ---

 ``` 
