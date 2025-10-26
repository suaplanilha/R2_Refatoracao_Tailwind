# Guia de Refatoração CSS → Tailwind CSS
## R2 Assessoria Esportiva

Este guia mapeia todas as classes CSS customizadas para suas equivalentes em Tailwind CSS.

## Cores Customizadas (Tailwind Config)

```javascript
colors: {
  'r2-primary': '#3EA4D4',
  'r2-primary-dark': '#3DA4CC',
  'r2-secondary': '#247DAA',
  'r2-bg': '#D7E1E7',
  'r2-text': '#1C3C59',
  'r2-text-body': '#455C74',
  'r2-text-muted': '#728396',
}
```

## Mapeamento de Classes

### Layout e Containers

| Classe Original | Tailwind Equivalente |
|----------------|---------------------|
| `.app-container` | `flex min-h-screen relative` |
| `.master-bg` | `master-bg-image` (mantido no CSS por usar imagem de background) |
| `.sidebar` | `w-64 fixed h-screen overflow-y-auto transition-all duration-300 z-[1000]` |
| `.sidebar.glass` | `bg-white/10 backdrop-blur-md border-r border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]` |
| `.main-content` | `flex-1 ml-64 p-6 transition-all duration-300 relative z-[1]` |
| `.content-area` | (remover, usar divs com classes Tailwind) |

### Cards e Containers

| Classe Original | Tailwind Equivalente |
|----------------|---------------------|
| `.card` | `bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-100` |
| `.card-title` | `text-2xl font-semibold text-r2-text mb-3` |
| `.stat-card` | `bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-200` |
| `.stats-grid` | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6` |

### Formulários

| Classe Original | Tailwind Equivalente |
|----------------|---------------------|
| `.form-group` | `space-y-2 mb-4` |
| `.form-label` | `block text-sm font-medium text-r2-text` |
| `.form-input` | `w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-r2-primary focus:border-r2-primary transition duration-150 outline-none` |
| `.form-hint` | `text-xs text-r2-text-muted mt-1` |
| `.error-message` | `bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm` (adicionar `hidden` inicialmente) |
| `.success-message` | `bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm` (adicionar `hidden` inicialmente) |

### Botões

| Classe Original | Tailwind Equivalente |
|----------------|---------------------|
| `.btn` | `inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition duration-200 cursor-pointer border-none` |
| `.btn-primary` | `bg-r2-primary text-white hover:bg-r2-primary-dark shadow-md hover:shadow-lg ripple` |
| `.btn-secondary` | `bg-gray-500 text-white hover:bg-gray-600 shadow-md hover:shadow-lg ripple` |
| `.btn-success` | `bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg ripple` |
| `.btn-logout` | `bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg ripple` |
| `.btn-icon` | `min-w-9 p-2 inline-flex items-center justify-center` |

### Tabelas

| Classe Original | Tailwind Equivalente |
|----------------|---------------------|
| `.table-responsive` | `overflow-x-auto rounded-lg border border-gray-200` |
| `.table` | `w-full border-collapse` |
| `.table thead` | `bg-gray-50` |
| `.table th` | `px-4 py-3 text-left text-xs font-semibold text-r2-text uppercase tracking-wider border-b border-gray-200` |
| `.table td` | `px-4 py-3 text-sm text-r2-text-body border-b border-gray-100` |
| `.table tbody tr:hover` | `hover:bg-gray-50 transition duration-150` |

### Navegação

| Classe Original | Tailwind Equivalente |
|----------------|---------------------|
| `.sidebar-header` | `p-6 bg-white/5 backdrop-blur-md border-b border-white/10 text-center` |
| `.sidebar-logo` | `w-20 h-20 rounded-full mb-3 object-cover mx-auto shadow-lg` |
| `.sidebar-title` | `text-xl font-medium text-white m-0` |
| `.sidebar-nav` | `py-5` |
| `.nav-item` | `flex items-center px-6 py-3.5 cursor-pointer transition-all duration-300 text-white no-underline border-l-4 border-transparent hover:bg-white/15 hover:border-white/80` |
| `.nav-item.active` | `bg-r2-secondary border-white` |

### Header

| Classe Original | Tailwind Equivalente |
|----------------|---------------------|
| `.header` | `bg-white/92 backdrop-blur-lg p-5 px-6 rounded-lg mb-6 shadow-lg border border-white/30 flex justify-between items-center` |
| `.header-title` | `text-3xl font-medium text-r2-text m-0` |
| `.header-actions` | `flex gap-3 items-center` |
| `.menu-toggle` | `hidden bg-none border-none cursor-pointer p-2 text-r2-text hover:bg-gray-100 rounded-lg transition duration-150` |

### Loading e Skeleton

| Classe Original | Tailwind Equivalente |
|----------------|---------------------|
| `.loading` | `flex flex-col items-center justify-center p-12` |
| `.spinner` | `w-12 h-12 border-4 border-r2-primary border-t-transparent rounded-full animate-spin` |
| `.skeleton` | (mantido no CSS - usa animação customizada) |
| `.skeleton-text` | (mantido no CSS) |
| `.skeleton-card` | (mantido no CSS) |

### Landing do Aluno

| Classe Original | Tailwind Equivalente |
|----------------|---------------------|
| `.landing-header` | `sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm` |
| `.landing-brand` | `flex items-center gap-2 md:gap-3` |
| `.landing-logo` | `w-8 h-8 rounded-lg` |
| `.landing-title` | `hidden md:inline text-lg font-semibold text-r2-text` |
| `.landing-nav` | `flex gap-2 overflow-x-auto scrollbar-hide` |
| `.landing-nav .lnk` | `flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap bg-gray-100 text-r2-text hover:bg-gray-200 hover:shadow-sm ripple` |
| `.landing-nav .lnk.active` | `bg-gradient-to-r from-r2-primary to-r2-secondary text-white shadow-sm` |
| `.landing-section` | `scroll-mt-20 px-4 py-6` |
| `.landing-hero` | `relative overflow-hidden rounded-xl mx-4 my-4 shadow-sm` |

### Switch Toggle (Status)

**IMPORTANTE:** O switch toggle deve ser mantido com CSS customizado, pois usa pseudo-elementos complexos.

```html
<style>
  .switch { position: relative; display: inline-block; width: 42px; height: 22px; }
  .switch input { opacity: 0; width: 0; height: 0; }
  .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .2s; }
  .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .2s; }
  input:checked + .slider { background-color: #4caf50; }
  input:focus + .slider { box-shadow: 0 0 1px #4caf50; }
  input:checked + .slider:before { transform: translateX(20px); }
  .slider.round { border-radius: 22px; }
  .slider.round:before { border-radius: 50%; }
</style>
```

Container do switch:
```html
<div class="inline-flex items-center gap-2">
  <label class="switch">
    <input type="checkbox" ...>
    <span class="slider round"></span>
  </label>
  <span class="text-sm text-r2-text-body">Ativo</span>
</div>
```

## Padrões de Responsividade

### Breakpoints Tailwind
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px

### Exemplos de Uso

**Grid Responsivo:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
```

**Texto Responsivo:**
```html
<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold">
```

**Padding/Margin Responsivo:**
```html
<div class="p-4 md:p-6 lg:p-8">
```

## Elementos que NÃO devem ser alterados

1. **IDs de elementos:** Todos os IDs devem ser mantidos exatamente como estão
2. **Atributos data-*:** Manter todos (ex: `data-aluno-id`, `data-view`, etc.)
3. **Event handlers:** Manter todos (ex: `onclick="..."`, `onchange="..."`)
4. **Funções JavaScript:** Não alterar nomes ou assinaturas
5. **Estrutura de templates:** Manter a hierarquia HTML
6. **Animações customizadas:** Manter classes como `animate-fade-in`, `animate-slide-in-right`, `ripple`

## Checklist de Refatoração

Para cada template:

- [ ] Substituir classes de layout por Tailwind
- [ ] Substituir classes de cor por cores customizadas (r2-*)
- [ ] Substituir classes de tipografia
- [ ] Substituir classes de espaçamento
- [ ] Substituir classes de borda e sombra
- [ ] Remover blocos `<style>` embutidos (exceto switch toggle)
- [ ] Adicionar classes responsivas onde apropriado
- [ ] Testar que todos os IDs e event handlers estão intactos
- [ ] Verificar que a lógica JavaScript não foi afetada

