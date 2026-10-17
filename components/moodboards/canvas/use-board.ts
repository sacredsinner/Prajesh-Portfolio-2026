"use client"

import { useCallback, useReducer } from "react"
import { autoLayout, boundsOf, frameChildren, snap, type Canvas, type CanvasItem, type Connector } from "@/lib/canvas"
import { newId } from "@/lib/moodboards"

// Board state with undo/redo. Every `commit` records history; `preview` changes the
// canvas without recording (used while dragging), then `commit` seals it.

type State = { canvas: Canvas; past: Canvas[]; future: Canvas[]; dirty: boolean }
type Action =
  | { type: "preview"; canvas: Canvas }
  | { type: "commit"; canvas: Canvas; base?: Canvas }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "replace"; canvas: Canvas }
  | { type: "saved" }

const LIMIT = 100

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "preview":
      return { ...state, canvas: action.canvas, dirty: true }
    case "commit": {
      const base = action.base ?? state.canvas
      if (base === action.canvas) return state
      return { canvas: action.canvas, past: [...state.past.slice(-LIMIT), base], future: [], dirty: true }
    }
    case "undo": {
      const prev = state.past[state.past.length - 1]
      if (!prev) return state
      return { canvas: prev, past: state.past.slice(0, -1), future: [state.canvas, ...state.future], dirty: true }
    }
    case "redo": {
      const next = state.future[0]
      if (!next) return state
      return { canvas: next, past: [...state.past, state.canvas], future: state.future.slice(1), dirty: true }
    }
    case "replace":
      return { canvas: action.canvas, past: [...state.past, state.canvas], future: [], dirty: true }
    case "saved":
      return { ...state, dirty: false }
  }
}

export function useBoard(initial: Canvas) {
  const [state, dispatch] = useReducer(reducer, { canvas: initial, past: [], future: [], dirty: false })
  const { canvas } = state

  const commit = useCallback((next: Canvas, base?: Canvas) => dispatch({ type: "commit", canvas: next, base }), [])
  const preview = useCallback((next: Canvas) => dispatch({ type: "preview", canvas: next }), [])
  const undo = useCallback(() => dispatch({ type: "undo" }), [])
  const redo = useCallback(() => dispatch({ type: "redo" }), [])
  const replace = useCallback((next: Canvas) => dispatch({ type: "replace", canvas: next }), [])
  const markSaved = useCallback(() => dispatch({ type: "saved" }), [])

  const nextZ = () => (canvas.items.length ? Math.max(...canvas.items.map((i) => i.z)) + 1 : 1)

  const addItem = (item: CanvasItem) => commit({ ...canvas, items: [...canvas.items, { ...item, z: item.type === "frame" ? Math.min(0, ...canvas.items.map((i) => i.z)) - 1 : nextZ() }] })

  const updateItems = (ids: string[], patch: (item: CanvasItem) => CanvasItem, record = true) => {
    const next = { ...canvas, items: canvas.items.map((i) => (ids.includes(i.id) ? patch(i) : i)) }
    if (record) commit(next)
    else preview(next)
    return next
  }

  // Moving a frame moves what it contains; moving a group moves its members.
  const expandSelection = (ids: string[]) => {
    const set = new Set(ids)
    for (const id of ids) {
      const item = canvas.items.find((i) => i.id === id)
      if (!item) continue
      if (item.group) canvas.items.filter((i) => i.group === item.group).forEach((i) => set.add(i.id))
      if (item.type === "frame") frameChildren(canvas.items, item).forEach((i) => set.add(i.id))
    }
    return [...set].filter((id) => !canvas.items.find((i) => i.id === id)?.locked)
  }

  const removeItems = (ids: string[]) => {
    const gone = new Set(expandSelection(ids).concat(ids))
    commit({ ...canvas, items: canvas.items.filter((i) => !gone.has(i.id)), connectors: canvas.connectors.filter((c) => !gone.has(c.from) && !gone.has(c.to)) })
  }

  const duplicateItems = (ids: string[]) => {
    const all = expandSelection(ids).concat(ids)
    const source = canvas.items.filter((i) => all.includes(i.id))
    const map = new Map(source.map((i) => [i.id, newId()]))
    const groupMap = new Map<string, string>()
    let z = nextZ()
    const copies = source.map((i) => ({ ...i, id: map.get(i.id)!, x: i.x + 24, y: i.y + 24, z: i.type === "frame" ? i.z : z++, locked: false, group: i.group ? groupMap.get(i.group) ?? (groupMap.set(i.group, newId()), groupMap.get(i.group)!) : undefined }))
    const connectors = canvas.connectors.filter((c) => map.has(c.from) && map.has(c.to)).map((c) => ({ ...c, id: newId(), from: map.get(c.from)!, to: map.get(c.to)! }))
    commit({ ...canvas, items: [...canvas.items, ...copies], connectors: [...canvas.connectors, ...connectors] })
    return copies.map((c) => c.id)
  }

  const reorder = (ids: string[], how: "front" | "back" | "forward" | "backward") => {
    const sorted = [...canvas.items].filter((i) => i.type !== "frame").sort((a, b) => a.z - b.z)
    const frames = canvas.items.filter((i) => i.type === "frame")
    const pick = sorted.filter((i) => ids.includes(i.id)), rest = sorted.filter((i) => !ids.includes(i.id))
    let order: CanvasItem[]
    if (how === "front") order = [...rest, ...pick]
    else if (how === "back") order = [...pick, ...rest]
    else {
      order = [...sorted]
      const idx = order.map((i, n) => (ids.includes(i.id) ? n : -1)).filter((n) => n >= 0)
      const step = how === "forward" ? 1 : -1
      for (const n of how === "forward" ? [...idx].reverse() : idx) {
        const t = n + step
        if (t < 0 || t >= order.length || ids.includes(order[t].id)) continue
        ;[order[n], order[t]] = [order[t], order[n]]
      }
    }
    commit({ ...canvas, items: [...frames, ...order.map((i, n) => ({ ...i, z: n + 1 }))] })
  }

  const group = (ids: string[]) => {
    if (ids.length < 2) return
    const id = newId()
    updateItems(ids, (i) => ({ ...i, group: id }))
  }
  const ungroup = (ids: string[]) => {
    const groups = new Set(canvas.items.filter((i) => ids.includes(i.id) && i.group).map((i) => i.group!))
    commit({ ...canvas, items: canvas.items.map((i) => (i.group && groups.has(i.group) ? { ...i, group: undefined } : i)) })
  }
  const setLocked = (ids: string[], locked: boolean) => updateItems(ids, (i) => ({ ...i, locked }))

  const connect = (from: string, to: string) => {
    if (from === to || canvas.connectors.some((c) => (c.from === from && c.to === to) || (c.from === to && c.to === from))) return
    const connector: Connector = { id: newId(), from, to }
    commit({ ...canvas, connectors: [...canvas.connectors, connector] })
  }
  const updateConnector = (id: string, patch: Partial<Connector>) => commit({ ...canvas, connectors: canvas.connectors.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
  const removeConnector = (id: string) => commit({ ...canvas, connectors: canvas.connectors.filter((c) => c.id !== id) })

  const tidy = (ids?: string[]) => {
    const target = ids?.length ? canvas.items.filter((i) => ids.includes(i.id) && i.type !== "frame") : canvas.items.filter((i) => i.type !== "frame" && !i.locked)
    if (!target.length) return
    const b = boundsOf(target)
    const laid = autoLayout(target, { x: snap(b.x), y: snap(b.y) }, Math.max(640, Math.min(1400, b.w)))
    const byId = new Map(laid.map((i) => [i.id, i]))
    commit({ ...canvas, items: canvas.items.map((i) => byId.get(i.id) ?? i) })
  }

  const setBackground = (background: Canvas["background"]) => commit({ ...canvas, background })

  return { canvas, state, commit, preview, undo, redo, replace, markSaved, addItem, updateItems, removeItems, duplicateItems, reorder, group, ungroup, setLocked, connect, updateConnector, removeConnector, tidy, expandSelection, setBackground, canUndo: state.past.length > 0, canRedo: state.future.length > 0, dirty: state.dirty }
}
