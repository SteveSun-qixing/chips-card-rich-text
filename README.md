# Chips Card Plugin Template

Standard template for developing card plugins in the Chips ecosystem.

## Overview

This template provides a complete starting point for creating card plugins that run in the Chips Host environment. Card plugins consist of two components:

- **Renderer**: Displays the card content in view mode
- **Editor**: Allows users to edit card configuration

Both components run in iframes and communicate with the host application via postMessage.

## Features

- ✅ Vue 3 + TypeScript + Vite
- ✅ Multi-entry build (renderer + editor)
- ✅ postMessage communication layer with timeout handling
- ✅ Theme CSS injection support
- ✅ Multi-language support
- ✅ Comprehensive test coverage
- ✅ TypeScript strict mode
- ✅ Zero hardcoded text (i18n ready)

## Project Structure

```
chips-template-card/
├── manifest.yaml                    # Plugin manifest
├── package.json
├── tsconfig.json
├── vite.config.ts                   # Multi-entry build config
├── src/
│   ├── renderer/
│   │   ├── index.html               # Renderer iframe entry
│   │   ├── main.ts                  # Renderer entry script
│   │   └── Renderer.vue             # Renderer component
│   ├── editor/
│   │   ├── index.html               # Editor iframe entry
│   │   ├── main.ts                  # Editor entry script
│   │   └── Editor.vue               # Editor component
│   ├── shared/
│   │   ├── types.ts                 # Card config types
│   │   ├── constants.ts             # Constants
│   │   └── bridge/
│   │       ├── iframe-bridge.ts     # Core communication layer
│   │       └── message-types.ts     # postMessage types
│   └── utils/
│       └── index.ts                 # Utility functions
├── locales/
│   ├── dev_i18n.yaml                # Development i18n keys
│   └── vocabulary.yaml              # Plugin vocabulary
├── assets/
│   ├── icon.png                     # Plugin icon
│   └── preview.png                  # Plugin preview
└── tests/
    ├── renderer.test.ts             # Renderer tests
    ├── editor.test.ts               # Editor tests
    ├── iframe-bridge.test.ts        # Bridge tests
    ├── message-types.test.ts        # Message type tests
    ├── renderer-bridge.test.ts      # Renderer integration tests
    ├── editor-bridge.test.ts        # Editor integration tests
    ├── lifecycle.test.ts            # Lifecycle tests
    └── i18n.test.ts                 # i18n tests
```

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Type Checking

```bash
pnpm type-check
```

## Communication Protocol

### Initialization

The host sends an `init` message to the iframe:

```typescript
{
  type: 'init',
  payload: {
    config: { /* card configuration */ },
    theme: { css: '...', tokens: {} },
    resources: {},
    locale: 'zh-CN'
  }
}
```

### Bridge API Requests

Cards can request Bridge API calls through the host:

```typescript
// Card sends request
{
  type: 'bridge-request',
  requestId: 'uuid',
  namespace: 'resource',
  action: 'fetch',
  params: { uri: 'video.mp4' }
}

// Host sends response
{
  type: 'bridge-response',
  requestId: 'uuid',
  result: { url: 'file:///...' }
}
```

### Configuration Updates

Editor notifies host of config changes:

```typescript
{
  type: 'config-update',
  config: { title: 'New Title', content: 'New Content' }
}
```

### Theme Changes

Host notifies card of theme changes:

```typescript
{
  type: 'theme-change',
  theme: { css: '...', tokens: {} }
}
```

### Language Changes

Host notifies card of language changes:

```typescript
{
  type: 'language-change',
  locale: 'en-US',
  vocabulary: { 'key': 'value' }
}
```

## Customization

### 1. Update manifest.yaml

Change the plugin ID, name, and capabilities:

```yaml
id: "your-publisher.your-card-name"
name: "Your Card Name"
capabilities:
  cardType: "YourCardType"
```

### 2. Define Card Configuration

Update `src/shared/types.ts`:

```typescript
export interface YourCardConfig {
  // Your card fields
  title: string;
  customField: string;
}
```

### 3. Implement Renderer

Update `src/renderer/Renderer.vue` to display your card content.

### 4. Implement Editor

Update `src/editor/Editor.vue` to edit your card configuration.

### 5. Add Translations

Update `locales/vocabulary.yaml` with your text strings.

## Testing Requirements

All card plugins must have:

- ✅ At least 8 unit test cases
- ✅ Tests for normal paths, error paths, and edge cases
- ✅ Bridge communication tests
- ✅ Component lifecycle tests
- ✅ i18n integration tests

## License

MIT

## Author

Chips Official
