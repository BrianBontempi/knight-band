import { atom, read, update } from 'claude-code'
import type { Register, SessionContextUsage } from 'claude-code'

import type { KnightContext, KnightStep, KnightTurn } from '../types'
import { BATTERY_SIZE, SCENE_SIZE, batterySvg, sceneSvg, toolSign } from './scene'

const trail = atom({ plugin: 'knight-band', key: 'trail' } as const, [])
const turn = atom({ plugin: 'knight-band', key: 'turn' } as const, null)
const context = atom({ plugin: 'knight-band', key: 'context' } as const, null)

// Posts kept for the current turn; the scene shows the newest that fit.
const KEEP = 40

export const register: Register = on => {
  let unnamed = 0

  on('session.start', async ($, e, next) => {
    const { context: usage } = await $.session.usage()
    await update($, context, () => toContext(usage))

    return next(e)
  })

  // Only a move of the context redraws the band; cost and rate limits do not.
  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('context')) {
      await update($, context, () => toContext(e.context))
    }

    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    if (e.agentId === undefined) {
      await update($, trail, () => [])
      await update($, turn, () => ({ tools: 0, seconds: null, isAborted: false }))
    }

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const step: KnightStep = { id: e.tool_use_id ?? `call-${++unnamed}`, tool: String(e.tool) }
    await update($, trail, steps => [...steps, step].slice(-KEEP))
    await update($, turn, last => (last === null ? last : { ...last, tools: last.tools + 1 }))

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      const seconds = Math.round(e.durationMs / 1000)
      await update($, turn, last => ({ tools: last?.tools ?? 0, seconds, isAborted: e.isAborted }))
    }

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }
    const steps = await read($, trail)
    const last = await read($, turn)
    const fuel = await read($, context)
    const isWorking = e.props.isWorking
    const status = statusText(steps, last, isWorking)
    const gauge = fuelText(fuel)

    if (e.surface === 'desktop') {
      const { Box, Svg, Text } = $.ui.resolve(e)
      const signs = steps.map(step => toolSign(step.tool))
      const percent = fuel?.percent ?? null

      return (
        <Box flexDirection="column" gap="xs">
          {/* An explicit size: the interactive frame otherwise keeps a tall default height. */}
          <Svg
            source={sceneSvg(signs, isWorking ? 'working' : 'camp')}
            alt={status}
            width={SCENE_SIZE.width}
            height={SCENE_SIZE.height}
            isInteractive
          />
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" gap="sm">
            <Text size="footnote" dimColor wrap="truncate">
              {status}
            </Text>
            <Box flexDirection="row" alignItems="center" gap="xs">
              <Text size="footnote" dimColor>
                Contesto
              </Text>
              <Svg
                source={batterySvg(percent)}
                alt={`Contesto ${gauge}`}
                width={BATTERY_SIZE.width}
                height={BATTERY_SIZE.height}
                isInteractive={percent !== null && percent >= 80}
              />
              <Text size="footnote" tabular>
                {gauge}
              </Text>
            </Box>
          </Box>
        </Box>
      )
    }

    if (e.surface === 'terminal') {
      const { Box, Text } = $.ui.resolve(e)

      return (
        <Box flexDirection="row" justifyContent="space-between" gap={2}>
          <Text dimColor wrap="truncate">
            {status}
          </Text>
          <Text dimColor>
            Contesto {cellsText(fuel)} {gauge}
          </Text>
        </Box>
      )
    }

    return next(e)
  })
}

function toContext(usage: SessionContextUsage): KnightContext | null {
  if (usage.percent === undefined || usage.tokens === undefined) {
    return null
  }

  return { percent: usage.percent, tokens: usage.tokens, window: usage.window }
}

function statusText(steps: readonly KnightStep[], last: KnightTurn | null, isWorking: boolean): string {
  if (isWorking) {
    const current = steps.at(-1)
    if (current === undefined) {
      return 'In cammino · sta pensando…'
    }
    const label = toolSign(current.tool).label.toLowerCase()
    const name = label.charAt(0).toUpperCase() + label.slice(1)

    return `In cammino · ${name} · ${steps.length} tool`
  }
  if (last === null || last.seconds === null) {
    return 'Accampato · pronto per la prossima missione'
  }
  const took = `${Math.floor(last.seconds / 60)}:${String(last.seconds % 60).padStart(2, '0')}`

  return last.isAborted
    ? `Fermato dopo ${took} · ${last.tools} tool`
    : `Accampato · finito in ${took} · ${last.tools} tool`
}

function fuelText(fuel: KnightContext | null): string {
  if (fuel === null) {
    return 'in attesa'
  }
  const free = Math.max(0, fuel.window - fuel.tokens)
  const freeText = free >= 1000 ? `${Math.round(free / 1000)}k` : String(free)

  return `${Math.round(fuel.percent)}% · ${freeText} liberi`
}

function cellsText(fuel: KnightContext | null): string {
  const lit = fuel === null ? 0 : Math.min(8, Math.round((fuel.percent / 100) * 8))

  return '▰'.repeat(lit) + '▱'.repeat(8 - lit)
}
