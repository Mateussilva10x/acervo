# Design System — Segundo Cérebro do Pregador

Extraído via Puppeteer do site de referência `sermon-seed-vault.lovable.app` em 15/04/2026.

---

## Tipografia

| Uso | Família | Pesos |
|---|---|---|
| Títulos / Headings | `Playfair Display` (serif) | 400, 500, 600, 700 |
| Corpo / UI | `Inter` (sans-serif) | 300, 400, 500, 600, 700 |

**Import URL:**
```
https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap
```

---

## Paleta de Cores — Light Mode (Landing Page)

| CSS Variable | HSL | HEX | Uso |
|---|---|---|---|
| `--background` | `35 33% 96%` | `#f8f5f1` | Fundo da página |
| `--foreground` | `20 30% 18%` | `#3c2920` | Texto principal |
| `--card` | `36 30% 94%` | `#f4f1eb` | Fundo de cards |
| `--card-foreground` | `20 30% 18%` | `#3c2920` | Texto em cards |
| `--primary` | `37 40% 60%` | `#c2a370` | Cor de ação principal (gold) |
| `--primary-foreground` | `35 33% 96%` | `#f8f5f1` | Texto sobre primary |
| `--secondary` | `30 20% 88%` | `#e7e0da` | Fundo secundário |
| `--muted` | `30 15% 90%` | `#e9e6e2` | Fundo muted |
| `--muted-foreground` | `20 10% 50%` | `#8c7b73` | Texto secundário/muted |
| `--border` | `30 20% 85%` | `#e0d9d1` | Bordas |
| `--input` | `30 20% 85%` | `#e0d9d1` | Borda de inputs |
| `--ring` | `37 40% 60%` | `#c2a370` | Focus ring |
| `--sidebar-background` | `33 25% 92%` | `#f0ebe6` | Fundo da sidebar (light) |
| `--gold` | `37 40% 60%` | `#c2a370` | Alias para primary |
| `--gold-light` | `37 45% 78%` | `#e0cdae` | Variante clara do gold |
| `--gold-dark` | `37 35% 45%` | `#9b7c4b` | Variante escura do gold |
| `--parchment` | `35 33% 96%` | `#f8f5f1` | Pergaminho (= background) |
| `--leather` | `20 30% 18%` | `#3c2920` | Couro (= foreground) |

---

## Paleta de Cores — Dark Mode (Área Autenticada)

| CSS Variable | HSL | HEX | Uso |
|---|---|---|---|
| `--background` | `20 25% 10%` | `#201713` | Fundo escuro da página |
| `--foreground` | `35 20% 90%` | `#ebe6e0` | Texto principal (claro) |
| `--card` | `20 20% 14%` | `#2b211d` | Fundo de cards escuros |
| `--primary` | `37 40% 60%` | `#c2a370` | Gold (igual no dark) |
| `--secondary` | `20 15% 20%` | `#3b302b` | Elementos secundários |
| `--muted` | `20 15% 20%` | `#3b302b` | Fundo muted escuro |
| `--muted-foreground` | `30 10% 60%` | `#a3998f` | Texto secundário escuro |
| `--border` | `20 15% 22%` | `#413530` | Bordas escuras |
| `--sidebar-background` | `20 20% 12%` | `#251d18` | Sidebar escura |

---

## Bordas e Raios

| Propriedade | Valor | Uso |
|---|---|---|
| `--radius` | `0.75rem` (12px) | Padrão global |
| Cards | `rounded-xl` (12px) | Cards de conteúdo |
| Botões primários | `rounded-xl` (12px) | CTAs principais |
| Tags / Badges | `rounded-full` | Chips de temas |
| Inputs | `rounded-xl` (12px) | Campos de formulário |

---

## Sombras

| Classe | Valor | Uso |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards sutis |
| Sem sombra | — | Dark mode |

---

## Ícones

- **Biblioteca:** Lucide React (`lucide-react`)
- **Estilo:** Outline
- **Tamanho padrão:** 16px (sidebar), 20px (features cards)
- **Cor:** herda do texto (`currentColor`)

### Mapeamento sidebar:
| Item | Ícone Lucide |
|---|---|
| Painel | `LayoutDashboard` |
| Notas | `FileText` |
| Nova Nota | `PlusCircle` |
| Referências Bíblicas | `BookOpen` |
| Temas | `Tag` |
| Buscar | `Search` |
| Configurações | `Settings` |
| Sair | `LogOut` |
| Light/Dark | `Sun` / `Moon` |

---

## Componentes — Especificações

### Botão Primário (Gold)
```
background: #c2a370
color: #f8f5f1
border-radius: 12px
padding: 10px 24px
font: Inter 500 14px
hover: background #9b7c4b (transition 150ms)
```

### Botão Outline (Secundário)
```
background: transparent
border: 1px solid #e0d9d1 (light) / #413530 (dark)
color: #3c2920 (light) / #ebe6e0 (dark)
border-radius: 12px
padding: 10px 24px
hover: background #e9e6e2 (light) / #3b302b (dark)
```

### Card
```
background: #f4f1eb (light) / #2b211d (dark)
border: 1px solid #e0d9d1 (light) / #413530 (dark)
border-radius: 12px
box-shadow: 0 1px 2px rgba(0,0,0,0.05)
padding: 24px
```

### Input / Textarea
```
background: transparent
border: 1px solid #e0d9d1 (light) / #413530 (dark)
border-radius: 12px
padding: 10px 14px
font: Inter 400 14px
focus: ring #c2a370 2px
```

### Tag / Badge (Tema)
```
background: transparent
border: 1px solid currentColor
border-radius: 9999px (full)
padding: 4px 12px
font: Inter 500 12px
color: #c2a370 (gold)
```

### Sidebar
```
width: 240px
background: #f0ebe6 (light) / #251d18 (dark)
border-right: 1px solid #e0d9d1 (light) / #413530 (dark)
padding: 16px
```

---

## Layout

### Área Autenticada
```
sidebar: 240px fixo à esquerda
conteúdo: flex-1, overflow-y auto
padding conteúdo: 32px 40px
```

### Landing Page
```
max-width: 1280px
padding-x: 24px (mobile) → 80px (desktop)
```

---

## Animações / Transições

- Hover transitions: `transition-colors duration-150`
- Fade-in pages: `transition-opacity duration-200`
- Sidebar hover items: `transition-colors duration-100`
