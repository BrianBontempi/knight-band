/** One tool call of the current turn: a signpost on the knight's trail. */
export type KnightStep = { id: string; tool: string }

/** The current or last turn of the main conversation. */
export type KnightTurn = { tools: number; seconds: number | null; isAborted: boolean }

/** The live context window, as the status line reads it. */
export type KnightContext = { percent: number; tokens: number; window: number }

declare module 'claude-code' {
  interface PluginState {
    'knight-band': {
      trail: KnightStep[]
      turn: KnightTurn | null
      context: KnightContext | null
    }
  }
}
