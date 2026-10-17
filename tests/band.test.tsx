import { expect, test } from 'claude-code/testing'

const SURFACES = ['terminal', 'desktop'] as const

function band(isWorking: boolean) {
  return {
    plugin: 'knight-band',
    component: 'AbovePrompt',
    props: {
      hasSurvey: false,
      isWorking,
      maxRows: 12,
      bodyColumns: 100,
      scroll: { offset: 0, bodyRows: 12 },
      view: {},
    },
  } as const
}

test('the knight plants a post per tool and camps when the turn ends', async ($, on) => {
  on('turn.start', (_$, e) => ({ turnId: e.turnId }))
  on('turn.complete', () => ({ text: '' }))
  on('tool.call', () => ({ result: 'ok' }))
  on('session.measure', () => ({ changed: [] }))

  await $.turn.start({ text: 'sistema il bug', turnId: 't1' })
  await $.tool.call({ tool: 'Read', tool_use_id: 'a', file_path: 'C:/progetto/app.ts' })
  await $.tool.call({ tool: 'Edit', tool_use_id: 'b', file_path: 'C:/progetto/app.ts', old_string: 'a', new_string: 'b' })
  await $.session.measure({
    context: { tokens: 50_000, window: 200_000, percent: 25 },
    rateLimits: [],
    changed: ['context'],
  })

  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...band(true), surface })
    expect(await ui.find({ type: 'Text', text: 'In cammino · Modifica · 2 tool' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /25% · 150k liberi/ })).toBeDefined()
    await ui.unmount()
  }

  const desktop = await $.ui.mount({ ...band(true), surface: 'desktop' })
  const scene = await desktop.find({ type: 'Svg' })
  expect(String(scene?.props.source)).toStartWith('<svg')
  await desktop.unmount()

  await $.turn.complete({ answer: 'fatto', durationMs: 72_000, isAborted: false, turnId: 't1', reason: 'answer' })

  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...band(false), surface })
    expect(await ui.find({ type: 'Text', text: 'Accampato · finito in 1:12 · 2 tool' })).toBeDefined()
    await ui.unmount()
  }
})

test('a fresh session camps and waits for the context reading', async $ => {
  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...band(false), surface })
    expect(await ui.find({ type: 'Text', text: 'Accampato · pronto per la prossima missione' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /in attesa/ })).toBeDefined()
    await ui.unmount()
  }
})

test('the band yields to a survey', async ($, on) => {
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>sondaggio</Text>
  })

  const ui = await $.ui.mount({ ...band(true), props: { ...band(true).props, hasSurvey: true }, surface: 'desktop' })
  expect(await ui.find({ type: 'Svg' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: 'sondaggio' })).toBeDefined()
  await ui.unmount()
})
