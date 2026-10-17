# Knight Band

Una mod per Claude Code: un cavaliere in pixel art vive nella fascia sopra il prompt.

- **Mentre Claude lavora** il cavaliere cammina e pianta un cartello per ogni tool usato (LEGGE, CERCA, MODIFICA, COMANDO, WEB, AGENTE…), colorato per tipo.
- **Quando Claude si ferma** si accampa e dorme accanto al fuoco, con il riepilogo del turno: durata e numero di tool.
- **Una batteria** mostra quanto è pieno il contesto: verde fino al 50%, ambra fino all'80%, rossa e lampeggiante oltre.

Nell'app desktop la scena è disegnata in SVG; nel terminale la fascia diventa una riga di testo con stato e batteria `▰▰▱▱▱▱▱▱`.

## Installazione

Al prompt di una sessione Claude Code nel terminale:

```
/plugin install knight-band --marketplace BrianBontempi/knight-band
```

Rispondi `y` per aggiungere il marketplace, poi scegli lo scope (Invio per *user*).

Da una shell:

```bash
claude plugin install knight-band --marketplace BrianBontempi/knight-band
```

Nell'app desktop, dove `/plugin` non è disponibile: clicca **+** accanto al box del prompt, poi **Plugins**, **Add marketplace** con `BrianBontempi/knight-band`, poi **Add plugin**.

Installata nello scope *user* da un terminale, la mod si carica anche nelle sessioni del tab Code dell'app desktop.

## Sviluppo

```bash
claude --plugin-dir ./
```

```bash
claude plugin validate .
```

```bash
claude plugin test .
```

## Struttura

| File | Cosa fa |
| --- | --- |
| `hooks/register.tsx` | Gli hook: segue turni, tool e contesto, e disegna la fascia `AbovePrompt` |
| `hooks/scene.ts` | La scena in pixel art: cavaliere, cartelli, fuoco, batteria, font 3×5 |
| `types/index.d.ts` | Il contratto dello stato (`trail`, `turn`, `context`) |
| `tests/band.test.tsx` | I test della fascia su terminale e desktop |
