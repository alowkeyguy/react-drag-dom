
import browserPrefix, { browserPrefixToKey } from './getPrefix'
import * as ReactDOM from 'react-dom'


export const isNum = (num: any): boolean => {
  return typeof num === 'number' && !isNaN(num)
}

export const stop = (e: MouseEvent) => {
  e && e.stopPropagation()
}

export const stopFollow = (e: MouseEvent) => {
  e.stopImmediatePropagation()
}

export const createCSSTransform = (
  { x, y }: ControlPosition,
): any => {
  const translation = `translate(${x}px,${y}px)`
  return { [browserPrefixToKey('transform', browserPrefix)]: translation }
}

export const addEvent = (el: HTMLElement, event: string, handler: EventHandler<MouseEvent>): void => {
  if (!el) { return }
  if (el.addEventListener) {
    el.addEventListener(event, handler, true);
  } else {
    el['on' + event] = handler;
  }
}

export const removeEvent = (el: HTMLElement, event: string, handler: EventHandler<MouseEvent>): void => {
  if (!el) { return }
  if (el.removeEventListener) {
    el.removeEventListener(event, handler, true)
  } else {
    el['on' + event] = null
  }
}

export const cloneBounds = (bounds: Bounds): Bounds => {
  return {
    left: bounds.left,
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom,
  }
}


export const getControlPosition = (
  e: MouseEvent,
  node: any,
  offsetNode?: HTMLElement,
): ControlPosition => {
  const offsetParent = (offsetNode || node.offsetParent as HTMLElement) || node.ownerDocument.body

  return offsetXYFromParent(e, offsetParent)
}

interface IEvt {
  clientX: number
  clientY: number
}
export function offsetXYFromParent(
  evt: IEvt,
  offsetParent: any,
): ControlPosition {

  const isBody = offsetParent === offsetParent.ownerDocument.body
  const offsetParentRect = isBody ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect()
  const x = evt.clientX + offsetParent.scrollLeft - offsetParentRect.left
  const y = evt.clientY + offsetParent.scrollTop - offsetParentRect.top

  return { x, y }
}


export function createCoreData(node: HTMLElement, last: ControlPosition, position: { x: number, y: number }): DraggableData {

  const isStart = !isNum(last.x)
  const { x, y } = position

  if (isStart) {
    return {
      node,
      deltaX: 0,
      deltaY: 0,
      x,
      y,
    }
  } else {
    return {
      node,
      deltaX: x - last.x,
      deltaY: y - last.y,
      x,
      y,
    }
  }
}

export function int(a: string): number {
  return parseInt(a, 10)
}

export const draggerTriggerBounds = (draggable: any): {
  left: boolean
  top: boolean
  right: boolean
  bottom: boolean
} => {
  const { bounds } = draggable.props
  const node = findDOMNode(draggable)
  const boundsRect = bounds.getBoundingClientRect()
  const nodeRect = node.getBoundingClientRect()
  return {
    left: nodeRect.left < boundsRect.left,
    top: nodeRect.top < boundsRect.top,
    right: nodeRect.right > boundsRect.right,
    bottom: nodeRect.bottom > boundsRect.bottom,
  }
}
export const getBoundPosition = (draggable: any, e: MouseEvent) => {
  const { bounds } = draggable.props
  const node = findDOMNode(draggable)
  const boundRect = bounds.getBoundingClientRect()
  const nodeRect = node.getBoundingClientRect()
  const { clientX, clientY } = e
  return {
    left: boundRect.left >= nodeRect.left && boundRect.left >= clientX,
    top: boundRect.top >= nodeRect.top && boundRect.top >= clientY,
    right: boundRect.right <= nodeRect.right && boundRect.right <= clientX,
    bottom: boundRect.bottom <= nodeRect.bottom && boundRect.bottom <= clientY,
  }
}

function findDOMNode(draggable: any): any {
  const node = ReactDOM.findDOMNode(draggable)
  if (!node) {
    throw new Error('<DraggableCore>: Unmounted during event!')
  }
  // $FlowIgnore we can't assert on HTMLElement due to tests... FIXME
  return node
}