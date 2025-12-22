# PDFácil - Versão Desktop

O PDFácil pode ser compilado como um aplicativo desktop nativo usando o [Tauri](https://tauri.app/), uma framework que cria aplicativos desktop leves e seguros usando tecnologias web.

## Pré-requisitos

### Windows
1. **Rust**: Instale via [rustup](https://rustup.rs/)
2. **Visual Studio Build Tools**: Instale com suporte a C++
3. **WebView2**: Geralmente já vem instalado no Windows 10/11

### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget file libxdo-devel
```

### macOS
```bash
xcode-select --install
```

## Desenvolvimento

Para rodar o aplicativo em modo de desenvolvimento:

```bash
# Primeiro, inicie o servidor de desenvolvimento do Vite em um terminal
npm run dev

# Em outro terminal, inicie o Tauri
npm run tauri:dev
```

Ou simplesmente execute (o Tauri irá automaticamente rodar o build antes de abrir):
```bash
npm run tauri dev
```

## Compilação

Para criar o executável final:

```bash
npm run tauri:build
```

Isso irá:
1. Compilar o frontend com Vite
2. Compilar o backend Rust
3. Criar o instalador na pasta `src-tauri/target/release/bundle/`

### Saídas de compilação

| Windows | Localização |
|---------|-------------|
| MSI Installer | `src-tauri/target/release/bundle/msi/PDFácil_1.0.0_x64_pt-BR.msi` |
| NSIS Installer | `src-tauri/target/release/bundle/nsis/PDFácil_1.0.0_x64-setup.exe` |

| macOS | Localização |
|-------|-------------|
| DMG | `src-tauri/target/release/bundle/dmg/PDFácil_1.0.0_x64.dmg` |
| App Bundle | `src-tauri/target/release/bundle/macos/PDFácil.app` |

| Linux | Localização |
|-------|-------------|
| AppImage | `src-tauri/target/release/bundle/appimage/pdfacil_1.0.0_amd64.AppImage` |
| Debian Package | `src-tauri/target/release/bundle/deb/pdfacil_1.0.0_amd64.deb` |
| RPM Package | `src-tauri/target/release/bundle/rpm/pdfacil-1.0.0-1.x86_64.rpm` |

## Estrutura do Projeto Tauri

```
src-tauri/
├── Cargo.toml          # Dependências Rust
├── tauri.conf.json     # Configuração do Tauri
├── build.rs            # Script de build
├── capabilities/       # Permissões do app
│   └── default.json    # Configuração de permissões
├── icons/              # Ícones do app
└── src/
    ├── main.rs         # Ponto de entrada
    └── lib.rs          # Configuração do Tauri
```

## Plugins Incluídos

- **shell**: Permite abrir links externos e arquivos
- **dialog**: Diálogos nativos do sistema (abrir/salvar arquivos)
- **fs**: Acesso ao sistema de arquivos

## Configurações

O arquivo `src-tauri/tauri.conf.json` contém as configurações principais:

- **productName**: Nome do aplicativo
- **version**: Versão do aplicativo
- **identifier**: Identificador único (com.pdfacil.app)
- **windows**: Configurações da janela (dimensões, título)
- **bundle**: Configurações de empacotamento

## Personalizando Ícones

Substitua os arquivos na pasta `src-tauri/icons/` pelos seus próprios ícones:

- `32x32.png` - Ícone pequeno
- `128x128.png` - Ícone médio
- `128x128@2x.png` - Ícone Retina
- `icon.icns` - Ícone macOS
- `icon.ico` - Ícone Windows

Você pode gerar todos os tamanhos a partir de uma imagem usando:
```bash
npx tauri icon caminho/para/sua-imagem.png
```

## Vantagens do App Desktop

✅ **Offline**: Funciona completamente sem internet  
✅ **Integração**: Integração nativa com o sistema operacional  
✅ **Performance**: Mais rápido que versão web  
✅ **Privacidade**: Todos os arquivos processados localmente  
✅ **Sem limites**: Sem restrições de tamanho de arquivo  
