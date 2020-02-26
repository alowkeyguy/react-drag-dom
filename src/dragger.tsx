import * as React from 'react'
import {
  createCSSTransform,
  addEvent,
  removeEvent,
  getControlPosition,
  createCoreData,
  stop,
  draggerTriggerBounds,
} from './utils/domFns'
// import { ControlPosition, DraggableData, EventHandler } from './utils/typs'
import { BOUNDS_MOVE_CELL } from './utils/constant'

const MOUSE_EVT = {
  start: 'mousedown',
  move: 'mousemove',
  stop: 'mouseup',
}

interface IProps {
  children: React.ReactElement
  defaultPosition?: ControlPosition
  disabled?: boolean
  bounds?: HTMLElement
  triggerBounds?: (p: ControlPosition) => ControlPosition | void
  offsetParent?: HTMLElement
  onStart?: (e: MouseEvent, data: DraggableData) => void | boolean
  onDrag?: (e: MouseEvent, data: DraggableData, cb: () => void) => void | boolean
  onStop?: (e: MouseEvent, data: DraggableData, cb: () => void) => void
  onClick?: (e: MouseEvent) => void
}
interface IState {
  uiP: ControlPosition
}

export default class Dragger extends React.Component<IProps, IState> {

  static defaultProps = {
    disabled: false,
    bounds: null,
    triggerBounds: null,
    offsetParent: null,
    onStart: function () { },
    onDrag: function () { },
    onStop: function () { },
    onClick: function () { },
  }

  state = {
    uiP: { x: 0, y: 0 },
  }
  ref: any = React.createRef()
  last = { x: NaN, y: NaN }
  beginP = { x: 0, y: 0 }
  dragging = false

  resetP = () => {
    this.setState({ uiP: { x: 0, y: 0 } })
    this.beginP = { x: 0, y: 0 }
    this.last = { x: NaN, y: NaN }
  }
  componentWillUnmount() {
    const node = this.ref.current
    removeEvent(node?.ownerDocument, MOUSE_EVT.move, this.handleDrag)
    removeEvent(node?.ownerDocument, MOUSE_EVT.stop, this.handleDragStop)
  }

  handleDrag: EventHandler<MouseEvent> = (e) => {
    if (this.dragging) {
      const { bounds, offsetParent, onDrag } = this.props
      stop(e)
      const node = this.ref.current as HTMLElement
      const position = getControlPosition(e, node, offsetParent)

      const coreData = createCoreData(node, this.last, position)

      if (bounds) {
        const { left, top, right, bottom } = draggerTriggerBounds(this)

        if (left || right) {
          const ox = left ? BOUNDS_MOVE_CELL : -BOUNDS_MOVE_CELL
          const { x }  = this.props.triggerBounds?.({ x: ox, y: 0 }) as ControlPosition
          coreData.x = coreData.x + x
          coreData.deltaX = coreData.deltaX + x
          console.log(coreData.deltaX, x)
        }
        if (top || bottom) {
          const oy = top ? BOUNDS_MOVE_CELL : -BOUNDS_MOVE_CELL
          const { y } = this.props.triggerBounds?.({ x: 0, y: oy }) as ControlPosition
          coreData.y = coreData.y + y
          coreData.deltaY = coreData.deltaY + y
        }
      }

      onDrag?.(e, coreData, () => this.resetP())

      this.last = { x: coreData.x, y: coreData.y }
      this.setState({
        uiP: {
          x: coreData.deltaX + this.state.uiP.x,
          y: coreData.deltaY + this.state.uiP.y,
        }
      })
    }
  }

  handleDragStop: EventHandler<MouseEvent> = (e) => {
    if (this.dragging) {
      const { offsetParent, onClick, onStop } = this.props
      stop(e)
      const node = this.ref.current

      const position = getControlPosition(e, node, offsetParent)
      if (position === null) {
        return
      }

      const coreData = createCoreData(node, this.last, position)

      this.dragging = false

      const uiP = this.state.uiP
      if (uiP.x === 0 && uiP.y === 0) {
        onClick?.(e)
        return
      }

      onStop?.(e, { ...coreData, ox: position.x - this.beginP.x, oy: position.y - this.beginP.y }, () =>
        this.resetP(),
      )


      if (node) {
        removeEvent(node.ownerDocument, MOUSE_EVT.move, this.handleDrag)
        removeEvent(node.ownerDocument, MOUSE_EVT.stop, this.handleDragStop)
      }
    }
  }

  onMouseDown = (e: MouseEvent) => {
    const node = this.ref.current
    const { offsetParent, disabled, onStart } = this.props

    if (!node) {
      return
    }

    if (disabled || !(e.target instanceof node.ownerDocument.defaultView.Node)) {
      return
    }

    stop(e)
    document.body.style.userSelect = 'none'

    const { x, y } = getControlPosition(e, node, offsetParent)

    this.beginP = { x, y }

    const coreData = createCoreData(node, this.last, { x, y })

    const shouldUpdate = onStart?.(e, coreData)

    if (shouldUpdate === false) {
      return
    }

    this.last = { x, y }
    this.dragging = true

    addEvent(node.ownerDocument, MOUSE_EVT.move, this.handleDrag)
    addEvent(node.ownerDocument, MOUSE_EVT.stop, this.handleDragStop)
  }

  onMouseUp = (e: MouseEvent) => {
    document.body.style.userSelect = ''
    stop(e)
    this.handleDragStop(e)
  }

  render() {
    const uiP = this.state.uiP
    const children = this.props.children
    const style = createCSSTransform({ x: uiP.x, y: uiP.y })

    return React.cloneElement(React.Children.only(children), {
      style: { ...children.props.style, ...style },
      onMouseDown: this.onMouseDown,
      onMouseUp: this.onMouseUp,
      ref: this.ref,
    })
  }

}
