// Pixel-art scene for the band above the prompt: the knight walks a trail of
// signposts while Claude works, one per tool, and sleeps by a campfire when
// Claude rests. Everything is drawn as SVG rects, one per run of pixels.

export type SignKind = 'read' | 'search' | 'write' | 'shell' | 'web' | 'agent' | 'other'
export type Sign = { label: string; kind: SignKind }
export type SceneMode = 'working' | 'camp'

// Drawn at 2 screen pixels per art pixel, so the band stays low (46px).
const W = 360
const H = 23
const GROUND = 20
const SCALE = 2
const OUTLINE = '#1b1626'
const MUTED = '#8a95a5'

const PALETTE: Readonly<Record<string, string>> = {
  o: OUTLINE,
  W: '#f4f6fa',
  h: '#c3cbd6',
  m: '#8a95a5',
  s: '#59627a',
  k: '#1b1626',
  e: '#7ef0ff',
  r: '#e8473c',
  R: '#a8281f',
  y: '#f6c244',
  Y: '#c4861c',
  u: '#6a5cd6',
  U: '#45389f',
  c: '#2f6db5',
  C: '#1e4880',
  g: '#dde4ee',
  G: '#9aa6b8',
  b: '#7a4d2a',
  B: '#4e301a',
  l: '#c2c7cc',
  n: '#9aa0a6',
  N: '#6d737a',
  f: '#ffe066',
  F: '#ff9b26',
  x: '#e3452f',
  d: '#8c5a32',
  D: '#5e3a1f',
}

// The knight, facing right: plumed great helm with a cross-shaped visor and
// a glowing eye, heater shield with a silver cross, blue cape and tabard.
const HEAD = [
  '....rr..........',
  '..rrRrr.........',
  '.rRR..Whh.......',
  '.R...WWhhm......',
  '.....Whhhm......',
  '.....hhkke......',
  '.....hmmkm......',
  '.....mmsss......',
  '......sss.......',
]

const BODY = [
  '...ccmhhhms.....',
  '..ccsYyyyYs.....',
  '..CcsYuWuYs.....',
  '.CccsYWWWYs.....',
  '.CccsYuWUYs.....',
  '.CCcscYUYc......',
  '..C..cCYCc......',
]

// The cape's tail flicked back, for the strides where both feet pass.
const BODY_FLUTTER = [...BODY.slice(0, 4), 'CCccsYuWUYs.....', 'C.CcscYUYc......', '.....cCYCc......']

// The raised sword in the knight's fist, drawn over the upper body.
const SWORD = [
  '................',
  '............W...',
  '............WG..',
  '............WG..',
  '............WG..',
  '............WG..',
  '............WG..',
  '............WG..',
  '............WG..',
  '...........YyyY.',
  '..........sshm..',
  '............YY..',
]

const LEGS_STRIDE = ['....ms...hm.....', '...ms.....hm....', '...ms.....hm....', '..Bbb.....bbB...']
const LEGS_STRIDE_SWAP = ['....hm...ms.....', '...hm.....ms....', '...hm.....ms....', '..bbB.....BbB...']
const LEGS_PASS = ['......smh.......', '......smh.......', '......smh.......', '......smh.......', '......Bbbb......']
const LEGS_PASS_SWAP = ['......hms.......', '......hms.......', '......hms.......', '......hms.......', '......Bbbb......']
const LEGS_STAND = ['.....hm.hm......', '.....hm.hm......', '.....ms.ms......', '....Bbb.bbB.....']
// Sitting on a log, legs stretched towards the fire.
const LEGS_SIT = ['..........hhhm', '..........mmmms', '.............hm', '.............hm', '.............bbB']
const LOG_SEAT = ['..dddddddd', '..bDdDdDdD', '..bDDDDDDD']
// The sword planted point-down beside the sleeping knight.
const SWORD_PLANTED = [
  '.................YY.',
  '.................bb.',
  '................YyyY',
  '.................WG.',
  '.................WG.',
  '.................WG.',
  '.................WG.',
  '.................WG.',
  '.................WG.',
  '.................WG.',
  '.................WG.',
  '.................WG.',
  '.................WG.',
]

const CANVAS_W = 20
const CANVAS_H = 26
const SLEEPING = { e: 'k' }

type Layer = { rows: readonly string[]; y: number; swap?: Readonly<Record<string, string>> }
type Grid = string[][]

function standing(legs: readonly string[], y: number, body: readonly string[] = BODY): Layer[] {
  return [
    { rows: legs, y: CANVAS_H - legs.length },
    { rows: HEAD, y },
    { rows: body, y: y + HEAD.length },
    { rows: SWORD, y },
  ]
}

const WALK: readonly (readonly Layer[])[] = [
  standing(LEGS_STRIDE, 6),
  standing(LEGS_PASS, 5, BODY_FLUTTER),
  standing(LEGS_STRIDE_SWAP, 6),
  standing(LEGS_PASS_SWAP, 5, BODY_FLUTTER),
]

const READY: readonly (readonly Layer[])[] = [standing(LEGS_STAND, 6), standing(LEGS_STAND, 7)]

function sleeping(headY: number): Layer[] {
  return [
    { rows: SWORD_PLANTED, y: 13 },
    { rows: LOG_SEAT, y: 23 },
    { rows: LEGS_SIT, y: 21 },
    { rows: HEAD, y: headY, swap: SLEEPING },
    { rows: BODY, y: 16 },
  ]
}

const SLEEP: readonly (readonly Layer[])[] = [sleeping(7), sleeping(8)]

const LOGS = ['.dD......Dd.', '..dDd..dDd..', 'n..DddddD..n', 'Nn.DdDDdD.nN']

const FLAMES = [
  ['...f....', '..ff..f.', '..fFf.f.', '.fFFffF.', '.FFxFFF.', '.FxxxF..', '..xxx...'],
  ['....f...', '.f..ff..', '.ff.fFf.', '.fFFfFF.', '..FFFxF.', '..FxxxF.', '..xxx...'],
  ['..f.....', '..ff.f..', '.fFf.ff.', '.fFfFFf.', '.FFxFFF.', '.FxxxxF.', '..xxx...'],
]

const SIGN_COLORS: Readonly<Record<SignKind, { fill: string; light: string; shade: string }>> = {
  read: { fill: '#a0703f', light: '#c08d5a', shade: '#7a5230' },
  search: { fill: '#a0703f', light: '#c08d5a', shade: '#7a5230' },
  write: { fill: '#3f8a52', light: '#5daa70', shade: '#2c643b' },
  shell: { fill: '#6f7785', light: '#8f97a4', shade: '#525967' },
  web: { fill: '#3a6fb8', light: '#5b8fd6', shade: '#2a5288' },
  agent: { fill: '#6a5cd6', light: '#8a7eea', shade: '#4a3fa5' },
  other: { fill: '#8a5a32', light: '#a8774c', shade: '#663f20' },
}

// A 3x5 pixel font, each glyph five rows of three bits.
const FONT: Readonly<Record<string, string>> = {
  A: '010101111101101',
  B: '110101110101110',
  C: '011100100100011',
  D: '110101101101110',
  E: '111100110100111',
  F: '111100110100100',
  G: '011100101101011',
  H: '101101111101101',
  I: '111010010010111',
  J: '001001001101010',
  K: '101101110101101',
  L: '100100100100111',
  M: '101111111101101',
  N: '110101101101101',
  O: '010101101101010',
  P: '110101110100100',
  Q: '010101101110011',
  R: '110101110101101',
  S: '011100010001110',
  T: '111010010010010',
  U: '101101101101111',
  V: '101101101101010',
  W: '101101111111101',
  X: '101101010101101',
  Y: '101101010010010',
  Z: '111001010100111',
  '0': '111101101101111',
  '1': '010110010010111',
  '2': '110001010100111',
  '3': '110001010001110',
  '4': '101101111001001',
  '5': '111100110001110',
  '6': '011100111101111',
  '7': '111001010010010',
  '8': '111101111101111',
  '9': '111101111001110',
  '+': '000010111010000',
  '-': '000000111000000',
  '.': '000000000000010',
  ' ': '000000000000000',
}

const SLEEPY_Z = ['1111', '0010', '0100', '1111']

const KNOWN: Readonly<Record<string, Sign>> = {
  Read: { label: 'LEGGE', kind: 'read' },
  NotebookRead: { label: 'LEGGE', kind: 'read' },
  Glob: { label: 'CERCA', kind: 'search' },
  Grep: { label: 'CERCA', kind: 'search' },
  LS: { label: 'CERCA', kind: 'search' },
  Edit: { label: 'MODIFICA', kind: 'write' },
  MultiEdit: { label: 'MODIFICA', kind: 'write' },
  NotebookEdit: { label: 'MODIFICA', kind: 'write' },
  Write: { label: 'SCRIVE', kind: 'write' },
  Bash: { label: 'COMANDO', kind: 'shell' },
  PowerShell: { label: 'COMANDO', kind: 'shell' },
  BashOutput: { label: 'COMANDO', kind: 'shell' },
  KillShell: { label: 'STOP', kind: 'shell' },
  WebFetch: { label: 'WEB', kind: 'web' },
  WebSearch: { label: 'RICERCA', kind: 'web' },
  Agent: { label: 'AGENTE', kind: 'agent' },
  Task: { label: 'AGENTE', kind: 'agent' },
  Skill: { label: 'SKILL', kind: 'agent' },
  TodoWrite: { label: 'PIANO', kind: 'agent' },
  ExitPlanMode: { label: 'PIANO', kind: 'agent' },
  AskUserQuestion: { label: 'DOMANDA', kind: 'agent' },
  ToolSearch: { label: 'ATTREZZI', kind: 'agent' },
  Artifact: { label: 'PAGINA', kind: 'web' },
}

const GAP = 3
const MOVE_SECONDS = 1.2

/** The signpost a tool plants on the trail: a short Italian label and a colour. */
export function toolSign(tool: string): Sign {
  const known = KNOWN[tool]
  if (known !== undefined) {
    return known
  }
  if (/browser|navigate|web|fetch/i.test(tool)) {
    return { label: 'WEB', kind: 'web' }
  }
  const name = tool.startsWith('mcp__') ? (tool.split('__').pop() ?? tool) : tool
  if (/plan|todo/i.test(name)) {
    return { label: 'PIANO', kind: 'agent' }
  }

  return { label: fontSafe(name), kind: 'other' }
}

/** The whole scene, an SVG document the band draws with `Svg`. */
export function sceneSvg(signs: readonly Sign[], mode: SceneMode): string {
  const isCamp = mode === 'camp'
  const reserve = isCamp ? 46 : 20
  const now = layout(signs, reserve)
  const parts = [groundSvg()]

  if (now.hidden > 0) {
    parts.push(textSvg(`+${now.hidden}`, 3, 10, MUTED))
  }
  const trail = now.shown
    .map((item, i) => signSvg(item.sign, item.x, item.w, !isCamp && i === now.shown.length - 1))
    .join('')
  parts.push(isCamp ? `<g opacity="0.55">${trail}</g>` : trail)

  if (isCamp) {
    parts.push(campSvg(now.knightX))
  } else if (signs.length === 0) {
    parts.push(readySvg(now.knightX, true))
  } else {
    parts.push(walkSvg(layout(signs.slice(0, -1), reserve).knightX, now.knightX))
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W * SCALE}" height="${H * SCALE}" ` +
    `viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">${parts.join('')}</svg>`
  )
}

/** The scene's size on screen, in CSS pixels. */
export const SCENE_SIZE = { width: W * SCALE, height: H * SCALE }

const BATTERY_CELLS = 56
const BATTERY_BODY = BATTERY_CELLS * 3 + 3
const BATTERY_VIEW_W = BATTERY_BODY + 2

/** The battery's size on screen, in CSS pixels. */
export const BATTERY_SIZE = { width: BATTERY_VIEW_W * SCALE, height: 7 * SCALE }

/**
 * A long pixel battery: each cell takes the colour of the zone it sits in,
 * green up to half the context, amber to 80%, red past it, so the fill
 * shows how close the conversation is to being summarised.
 */
export function batterySvg(percent: number | null): string {
  const cells = BATTERY_CELLS
  const lit = percent === null ? 0 : Math.min(cells, Math.max(percent > 0 ? 1 : 0, Math.round((percent / 100) * cells)))
  const parts = [
    `<rect x="1" y="1" width="${BATTERY_BODY - 2}" height="5" fill="rgba(138,149,165,0.15)"/>`,
    `<rect x="0" y="0" width="${BATTERY_BODY}" height="1" fill="${MUTED}"/>`,
    `<rect x="0" y="6" width="${BATTERY_BODY}" height="1" fill="${MUTED}"/>`,
    `<rect x="0" y="0" width="1" height="7" fill="${MUTED}"/>`,
    `<rect x="${BATTERY_BODY - 1}" y="0" width="1" height="7" fill="${MUTED}"/>`,
    `<rect x="${BATTERY_BODY}" y="2" width="2" height="3" fill="${MUTED}"/>`,
  ]
  for (let i = 0; i < cells; i++) {
    const zone = i / cells
    const isLit = i < lit
    const fill = !isLit ? 'rgba(138,149,165,0.3)' : zone < 0.5 ? '#3fb950' : zone < 0.8 ? '#f0a020' : '#e5484d'
    const blink =
      isLit && i === lit - 1 && percent !== null && percent >= 80
        ? '<animate attributeName="opacity" values="1;0.25;1" dur="1s" repeatCount="indefinite"/>'
        : ''
    parts.push(`<rect x="${2 + i * 3}" y="2" width="2" height="3" fill="${fill}">${blink}</rect>`)
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${BATTERY_SIZE.width}" height="${BATTERY_SIZE.height}" ` +
    `viewBox="0 0 ${BATTERY_VIEW_W} 7" shape-rendering="crispEdges">${parts.join('')}</svg>`
  )
}

type Placed = { sign: Sign; x: number; w: number }

// Where each signpost and the knight stand; the oldest posts leave the trail
// once it no longer fits, counted by a "+N" at its start.
function layout(signs: readonly Sign[], reserve: number): { shown: Placed[]; hidden: number; knightX: number } {
  for (let first = 0; ; first++) {
    let x = first > 0 ? 3 + textWidth(`+${first}`) + 4 : 3
    const shown: Placed[] = []
    for (const sign of signs.slice(first)) {
      const w = textWidth(sign.label) + 4
      shown.push({ sign, x, w })
      x += w + GAP
    }
    if (x + reserve <= W || first >= signs.length) {
      return { shown, hidden: first, knightX: x }
    }
  }
}

function walkSvg(fromX: number, toX: number): string {
  const steps = cycle(WALK.map(knight), 0.6, { repeat: '2', isFirstShown: false })
  const ready = cycle(READY.map(knight), 1.4, { repeat: 'indefinite', isFirstShown: true })

  return (
    `<g transform="translate(${toX} 0)">` +
    `<animateTransform attributeName="transform" type="translate" from="${fromX} 0" to="${toX} 0" ` +
    `dur="${MOVE_SECONDS}s" fill="freeze"/>` +
    `<g>${steps}</g>` +
    `<g display="none"><set attributeName="display" to="inline" begin="${MOVE_SECONDS}s" fill="freeze"/>${ready}</g>` +
    `</g>`
  )
}

function readySvg(x: number, isThinking: boolean): string {
  const ready = cycle(READY.map(knight), 1.4, { repeat: 'indefinite', isFirstShown: true })
  const dots = isThinking
    ? [0, 1, 2]
        .map(
          i =>
            `<rect x="${15 + i * 2}" y="7" width="1" height="1" fill="${MUTED}" opacity="0.3">` +
            `<animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="${i * 0.3}s" repeatCount="indefinite"/></rect>`,
        )
        .join('')
    : ''

  return `<g transform="translate(${x} 0)">${ready}${dots}</g>`
}

function campSvg(x: number): string {
  const sleep = cycle(SLEEP.map(knight), 2.4, { repeat: 'indefinite', isFirstShown: true })
  const zs = [0, 1, 2]
    .map(i => {
      const begin = `${i}s`
      return (
        `<g opacity="0">` +
        `<animateTransform attributeName="transform" type="translate" values="0 0;6 -6" dur="3s" begin="${begin}" repeatCount="indefinite"/>` +
        `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.7;1" dur="3s" begin="${begin}" repeatCount="indefinite"/>` +
        bitsSvg(SLEEPY_Z, 11, 3, '#8f86ff') +
        `</g>`
      )
    })
    .join('')

  return `<g transform="translate(${x} 0)">${sleep}${zs}</g>${fireSvg(x + 24)}`
}

function fireSvg(x: number): string {
  const glow =
    `<ellipse cx="${x + 6}" cy="${GROUND}" rx="11" ry="4" fill="#ff9b26" opacity="0.16" shape-rendering="auto">` +
    `<animate attributeName="opacity" values="0.1;0.2;0.13;0.18;0.1" dur="1.6s" repeatCount="indefinite"/></ellipse>`
  const logs = pixels(outline(toGrid(LOGS)), x - 1, GROUND - LOGS.length)
  const flames = cycle(
    FLAMES.map(rows => pixels(toGrid(rows), x + 2, GROUND - 2 - rows.length)),
    0.45,
    { repeat: 'indefinite', isFirstShown: true },
  )
  const embers = [0, 1, 2]
    .map(i => {
      const ex = x + 4 + i * 2
      const begin = `${i * 0.5}s`
      return (
        `<rect x="${ex}" y="${GROUND - 9}" width="1" height="1" fill="#ffb347" opacity="0">` +
        `<animate attributeName="y" values="${GROUND - 9};${GROUND - 16}" dur="1.5s" begin="${begin}" repeatCount="indefinite"/>` +
        `<animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="${begin}" repeatCount="indefinite"/></rect>`
      )
    })
    .join('')

  return glow + logs + flames + embers
}

function signSvg(sign: Sign, x: number, w: number, isNew: boolean): string {
  const top = 8
  const h = 9
  const color = SIGN_COLORS[sign.kind]
  const post = x + Math.floor(w / 2) - 1
  const postTop = top + h
  const body =
    `<rect x="${post - 1}" y="${postTop}" width="4" height="${GROUND - postTop}" fill="${OUTLINE}"/>` +
    `<rect x="${post}" y="${postTop}" width="2" height="${GROUND - postTop}" fill="#6b4423"/>` +
    `<rect x="${x - 1}" y="${top - 1}" width="${w + 2}" height="${h + 2}" fill="${OUTLINE}"/>` +
    `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${color.fill}"/>` +
    `<rect x="${x}" y="${top}" width="${w}" height="1" fill="${color.light}"/>` +
    `<rect x="${x}" y="${top + h - 1}" width="${w}" height="1" fill="${color.shade}"/>` +
    textSvg(sign.label, x + 2, top + 2, '#fff4d6')
  if (!isNew) {
    return body
  }

  // The new post drops in once the knight has walked past it.
  const dur = `${MOVE_SECONDS + 0.3}s`
  return (
    `<g>` +
    `<animate attributeName="opacity" values="0;0;1" keyTimes="0;0.8;1" dur="${dur}" fill="freeze"/>` +
    `<animateTransform attributeName="transform" type="translate" values="0 -6;0 -6;0 0" keyTimes="0;0.8;1" dur="${dur}" fill="freeze"/>` +
    `${body}</g>`
  )
}

function groundSvg(): string {
  const rects = [
    `<rect x="0" y="${GROUND}" width="${W}" height="1" fill="#62b043"/>`,
    `<rect x="0" y="${GROUND + 1}" width="${W}" height="${H - GROUND - 1}" fill="#a9784a"/>`,
    `<rect x="0" y="${GROUND + 1}" width="${W}" height="1" fill="#7c5331"/>`,
  ]
  for (let x = 0; x < W; x++) {
    if (x % 9 === 3 || x % 13 === 7) {
      rects.push(`<rect x="${x}" y="${GROUND - 1}" width="1" height="1" fill="#3f8a2c"/>`)
    }
    if (x % 7 === 2) {
      rects.push(`<rect x="${x}" y="${GROUND + 2}" width="1" height="1" fill="#c9a274"/>`)
    }
    if (x % 11 === 5) {
      rects.push(`<rect x="${x}" y="${GROUND + 2}" width="2" height="1" fill="#7c5331"/>`)
    }
  }

  return rects.join('')
}

// Shows the frames one after another, each for an equal share of `dur`.
function cycle(
  frames: readonly string[],
  dur: number,
  { repeat, isFirstShown }: { repeat: string; isFirstShown: boolean },
): string {
  const keyTimes = frames.map((_, j) => (j / frames.length).toFixed(3)).join(';')

  return frames
    .map((frame, i) => {
      const values = frames.map((_, j) => (j === i ? 'visible' : 'hidden')).join(';')
      const base = isFirstShown && i === 0 ? 'visible' : 'hidden'
      return (
        `<g visibility="${base}"><animate attributeName="visibility" values="${values}" keyTimes="${keyTimes}" ` +
        `calcMode="discrete" dur="${dur}s" repeatCount="${repeat}"/>${frame}</g>`
      )
    })
    .join('')
}

// One frame of the knight, outlined, his feet on the grass.
function knight(layers: readonly Layer[]): string {
  return pixels(outline(compose(layers)), -1, GROUND - (CANVAS_H - 1) - 1)
}

function compose(layers: readonly Layer[]): Grid {
  const grid: Grid = Array.from({ length: CANVAS_H }, () => Array<string>(CANVAS_W).fill('.'))
  for (const layer of layers) {
    layer.rows.forEach((row, dy) => {
      const line = grid[layer.y + dy]
      if (line === undefined) {
        return
      }
      for (let x = 0; x < Math.min(row.length, CANVAS_W); x++) {
        const char = row[x] ?? '.'
        if (char !== '.') {
          line[x] = layer.swap?.[char] ?? char
        }
      }
    })
  }

  return grid
}

function toGrid(rows: readonly string[]): Grid {
  return rows.map(row => [...row])
}

// A one-pixel dark outline around every opaque pixel, the grid grown by one
// on each side; it keeps the sprite readable on light and dark themes alike.
function outline(grid: Grid): Grid {
  const h = grid.length
  const w = grid[0]?.length ?? 0
  const isFilled = (x: number, y: number) => {
    const char = grid[y]?.[x]
    return char !== undefined && char !== '.'
  }

  return Array.from({ length: h + 2 }, (_, y) =>
    Array.from({ length: w + 2 }, (_, x) => {
      const own = grid[y - 1]?.[x - 1]
      if (own !== undefined && own !== '.') {
        return own
      }
      const isEdge =
        isFilled(x - 1, y - 2) || isFilled(x - 1, y) || isFilled(x - 2, y - 1) || isFilled(x, y - 1)
      return isEdge ? 'o' : '.'
    }),
  )
}

function pixels(grid: Grid, ox: number, oy: number): string {
  const byColor = new Map<string, string[]>()
  grid.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const char = row[x] ?? '.'
      if (char === '.') {
        x++
        continue
      }
      let end = x + 1
      while (row[end] === char) {
        end++
      }
      const color = PALETTE[char] ?? '#ff00ff'
      const list = byColor.get(color) ?? []
      list.push(`<rect x="${ox + x}" y="${oy + y}" width="${end - x}" height="1"/>`)
      byColor.set(color, list)
      x = end
    }
  })

  return [...byColor].map(([color, rects]) => `<g fill="${color}">${rects.join('')}</g>`).join('')
}

function textWidth(text: string): number {
  return Math.max(0, text.length * 4 - 1)
}

function textSvg(text: string, x: number, y: number, color: string): string {
  const rows = ['', '', '', '', '']
  for (const char of text) {
    const bits = FONT[char] ?? FONT[' '] ?? ''
    for (let r = 0; r < 5; r++) {
      rows[r] += `${bits.slice(r * 3, r * 3 + 3)}0`
    }
  }

  return bitsSvg(rows, x, y, color)
}

function bitsSvg(rows: readonly string[], x: number, y: number, color: string): string {
  const rects: string[] = []
  rows.forEach((row, r) => {
    let c = 0
    while (c < row.length) {
      if (row[c] !== '1') {
        c++
        continue
      }
      let end = c + 1
      while (row[end] === '1') {
        end++
      }
      rects.push(`<rect x="${x + c}" y="${y + r}" width="${end - c}" height="1"/>`)
      c = end
    }
  })

  return `<g fill="${color}">${rects.join('')}</g>`
}

function fontSafe(name: string): string {
  const label = name
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z0-9+\-. ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8)
    .trim()

  return label === '' ? 'TOOL' : label
}
