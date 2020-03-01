import * as React from 'react'
import Dragger from './dragger'
import styles from './styles.css'
import {
  addEvent,
  removeEvent,
  isNum,
  stopFollow,
  stop,
  getControlPosition,
  getBoundPosition,
} from './utils/domFns'
import { BOUNDS_MOVE_CELL, MIN_SPACE } from './utils/constant'


// https://stackoverflow.com/questions/55565444/how-to-register-event-with-useeffect-hooks#
// https://github.com/facebook/react/issues/14066
// hooks对于事件监听来说，不太完善，这里用class写

const mouse = {
  start: 'mousedown',
  move: 'mousemove',
  stop: 'mouseup',
}

interface IProps {
  children?: React.ReactNode
  offsetParent?: HTMLElement
  bounds?: HTMLElement
  zoomAble?: boolean
  triggerBounds?: (p: ControlPosition) => ControlPosition | void
  onDrawStart?: (e: any, start: ControlPosition) => void
  onDraw?: (e: any, start: ControlPosition, end: ControlPosition, offsetPosition: any) => void
  onDrawStop?: (e: any, start: ControlPosition, end: ControlPosition, offsetPosition?: any, cb?: () => void) => void
  onCancel?: (e: any, start: ControlPosition, end: ControlPosition) => void
}
interface IState {
  startP: ControlPosition
  endP: ControlPosition
  showPoint: boolean
}
type IZoomType = 'topLeft' | 'top' | 'topRight' | 'right' | 'bottomRight' | 'bottom' | 'bottomLeft' | 'left' | null

const boundsTopBottom = (start: ControlPosition, end: ControlPosition, zoomType: IZoomType) => {
  let point = end
  if (zoomType) {
    if (['topLeft', 'top', 'topRight'].includes(zoomType)) {
      point = start
    } else if (['bottomLeft', 'bottom', 'bottomRight'].includes(zoomType)) {
      point = end
    }
  }
  return point
}

const boundLeftRight = (start: ControlPosition, end: ControlPosition, zoomType: IZoomType) => {
  let point = end
  if (zoomType) {
    if (['left', 'topLeft', 'bottomLeft'].includes(zoomType)) {
      point = start
    } else if (['topRight', 'right', 'bottomRight'].includes(zoomType)) {
      point = end
    }
  }
  return point
}
export default class DragFrame extends React.Component<IProps, IState> {

  state = {
    startP: { x: NaN, y: NaN },
    endP: { x: 0, y: 0 },
    showPoint: false,
  }

  ref: any = React.createRef()
  drawStatus = false
  zoomType: IZoomType = null
  relateOffsetPosition = {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  }

  getOffsetParent = (node: HTMLElement) => {
    return this.props.offsetParent || (node.offsetParent as HTMLElement)
  }

  reset = () => {
    this.relateOffsetPosition = {
      start: { x: 0, y: 0 },
      end: { x: 0, y: 0 },
    }
    // 绘制开关
    this.drawStatus = false
    // 调整大小方向
    this.zoomType = null
    this.setState({
      startP: { x: NaN, y: NaN },
      endP: { x: 0, y: 0 },
      // 显示调整大小的点
      showPoint: false,
    })
  }

  listener = () => {
    const node = this.ref.current
    if (node) {
      addEvent(node.ownerDocument, mouse.start, this.drawStart)
      addEvent(node.ownerDocument, mouse.move, this.draw)
      addEvent(node.ownerDocument, mouse.stop, this.drawStop)
    }
  }
  removeListener = () => {
    const node = this.ref.current
    // const offsetP = this.getOffsetParent(node.offsetParent)
    if (node) {
      removeEvent(node.ownerDocument, mouse.start, this.drawStart)
      removeEvent(node.ownerDocument, mouse.move, this.draw)
      removeEvent(node.ownerDocument, mouse.stop, this.drawStop)
    }
  }
  drawStart: EventHandler<MouseEvent> = (e) => {
    const { startP, endP } = this.state
    const ref = this.ref.current
    const offsetP = this.getOffsetParent(ref.offsetParent)
    /** 保证用户在移动元素的时候不会选择到元素内部的东西 */
    document.body.style.userSelect = 'none'
    // 重新调整大小
    
    const type = (e.srcElement as any).dataset.point
    if (this.state.showPoint && type) {
      this.zoomType = type
      this.drawStatus = true
      stopFollow(e)
      return
    }
    // 点击自身
    if (offsetP !== e.srcElement) {
      return
    } else if (isNum(startP.x)) {
      this.props.onCancel && this.props.onCancel(e, startP, endP);
      this.reset()
      return
    }

    stopFollow(e)
    this.drawStatus = true

    const { x, y } = getControlPosition(e, ref.offsetParent)
    const { clientWidth, clientHeight } = offsetP

    const p = {
      x: (x / clientWidth) * 100,
      y: (y / clientHeight) * 100,
    }
    this.setState({
      startP: { ...p },
      endP: { ...p },
    })
    this.relateOffsetPosition = {
      end: { x, y },
      start: { x, y },
    }
    this.props.onDrawStart && this.props.onDrawStart(e, { ...p });
  }
  draw: EventHandler<MouseEvent> = (e) => {
    const { startP, endP, showPoint } = this.state;
    const { bounds, triggerBounds, onDraw } = this.props;
    if (!this.drawStatus || !isNum(startP.x)) {
      return
    }
    if (e.buttons === 1) {
      stopFollow(e)
      const node = this.ref.current
      let { x, y } = getControlPosition(e, node.offsetParent)
      const { clientWidth, clientHeight } = this.getOffsetParent(node.offsetParent)

      // 边界
      if (bounds) {
        const { left, top, right, bottom } = getBoundPosition(this, e)

        if (left || right) {
          const point = boundLeftRight(startP, endP, this.zoomType)
          const ox = left ? BOUNDS_MOVE_CELL : -BOUNDS_MOVE_CELL
          x = point.x * clientWidth / 100
          triggerBounds && triggerBounds({ x: ox, y: 0 });
        }
        if (top || bottom) {
          const point = boundsTopBottom(startP, endP, this.zoomType)
          const oy = top ? BOUNDS_MOVE_CELL : -BOUNDS_MOVE_CELL
          y = point.y * clientHeight / 100
          triggerBounds && triggerBounds({ x: 0, y: oy });
        }
      }

      const p = {
        x: (x / clientWidth) * 100,
        y: (y / clientHeight) * 100,
      }

      let [start, end] = [{ x: 0, y: 0 }, { x: 0, y: 0 }]
      // 框调整大小
      if (showPoint && this.zoomType) {
        [start, end] = this[this.zoomType].call(this, p)
      } else {
        [start, end] = this.bottomRight(p)
      }

      this.relateOffsetPosition = {
        start: {
          x: start.x * clientWidth / 100,
          y: start.y * clientHeight / 100,
        },
        end: {
          x: end.x * clientWidth / 100,
          y: end.y * clientHeight / 100,
        },
      }
      onDraw && onDraw(e, start, end, {
        ...this.relateOffsetPosition,
        node
      });
    }
  }


  topLeft = ({ x, y }: ControlPosition) => {
    const { endP } = this.state
    this.setState({
      startP: { x, y },
    })
    return [{ x, y }, endP]
  }

  topRight = ({ x, y }: ControlPosition) => {
    const { startP, endP } = this.state
    this.setState({
      startP: { x: startP.x, y },
      endP: { x, y: endP.y },
    })
    return [{ x: startP.x, y }, { x, y: endP.y }]
  }

  bottomLeft = ({ x, y }: ControlPosition) => {
    const { startP, endP } = this.state
    this.setState({
      startP: { x, y: startP.y },
      endP: { x: endP.x, y },
    })
    return [{ x, y: startP.y }, { x: endP.x, y }]
  }

  bottomRight = ({ x, y }: ControlPosition) => {
    const { startP } = this.state
    this.setState({
      endP: { x, y },
    })
    return [startP, { x, y }]
  }

  top = ({ y }: ControlPosition) => {
    const { startP, endP } = this.state
    this.setState({
      startP: { x: startP.x, y },
    })
    return [{ x: startP.x, y }, endP]
  }

  left = ({ x }: ControlPosition) => {
    const { startP, endP } = this.state
    this.setState({
      startP: { x, y: startP.y },
    })
    return [{ x, y: startP.y }, endP]
  }

  right = ({ x }: ControlPosition) => {
    const { startP, endP } = this.state
    this.setState({
      endP: { x, y: endP.y }
    })
    return [startP, { x, y: endP.y }]
  }

  bottom = ({ y }: ControlPosition) => {
    const { startP, endP } = this.state
    this.setState({
      endP: { x: endP.x, y },
    })
    return [startP, { x: endP.x, y }]
  }


  drawStop: EventHandler<MouseEvent> = (e) => {
    /** 取消用户选择限制，用户可以重新选择 */
    document.body.style.userSelect = ''
    if (!this.drawStatus) {
      return
    }
    this.drawStatus = false
    this.zoomType = null
    stopFollow(e)

    const node: any = this.ref.current

    if (this.props.zoomAble) {
      this.setState({ showPoint: true })
    }
    const { startP, endP } = this.state
    const { start, end } = this.relateOffsetPosition
    if (
      Math.abs(start.x - end.x) > MIN_SPACE
      || Math.abs(start.y - end.y) > MIN_SPACE
    ) {
      this.props.onDrawStop && this.props.onDrawStop(
        e,
        startP,
        endP,
        {
          ...this.relateOffsetPosition,
          node
        },
        () => this.reset()
      );
    } else {
      this.reset()
    }
  }

  componentDidMount() {
    this.listener()
  }

  componentWillUnmount() {
    this.removeListener()
    const { start, end } = this.relateOffsetPosition
    const { startP, endP } = this.state
    if (
      Math.abs(startP.x - end.x) > MIN_SPACE
      || Math.abs(start.y - end.y) > MIN_SPACE
    ) {
      this.props.onCancel && this.props.onCancel(null, startP, endP)
    }
  }

  onMouseUp = (_e: MouseEvent, et: any, cb: () => void) => {
    const { clientWidth, clientHeight } = et.node.offsetParent
    this.setState((state) => ({
      startP: {
        x: (et.ox / clientWidth) * 100 + state.startP.x,
        y: (et.oy / clientHeight) * 100 + state.startP.y,
      },
      endP: {
        x: (et.ox / clientWidth) * 100 + state.endP.x,
        y: (et.oy / clientHeight) * 100 + state.endP.y,
      },
    }))
    cb()
  }

  render() {
    const { startP, endP, showPoint } = this.state
    return (
      <Dragger
        onStop={this.onMouseUp}
        onDrag={stop}
        bounds={this.props.bounds}
        triggerBounds={this.props.triggerBounds}
      >
        <div
          style={{
            position: 'absolute',
            left: (startP.x || 0) + '%',
            top: (startP.y || 0) + '%',
            width: (endP.x - startP.x || 0) + '%',
            height: (endP.y - startP.y || 0) + '%',
            visibility: isNum(startP.x) ? 'visible' : 'hidden',
          }}
        >
          {this.props.children}
          <div
            ref={this.ref}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              cursor: 'move',
            }}
            className={styles.matrix}
          />
          {showPoint && (
            <>
              <span
                data-point="topLeft"
                style={{ left: '0', top: '0', cursor: 'nwse-resize' }}
                className={styles.point}
              />
              <span
                data-point="topRight"
                style={{ right: '0', top: '0', cursor: 'nesw-resize' }}
                className={styles.point}
              />
              <span
                data-point="bottomLeft"
                style={{ bottom: '0', left: '0', cursor: 'nesw-resize' }}
                className={styles.point}
              />
              <span
                data-point="bottomRight"
                style={{ bottom: '0', right: '0', cursor: 'nwse-resize' }}
                className={styles.point}
              />
              <span
                data-point="top"
                style={{
                  height: '2px',
                  top: '0',
                  left: '0',
                  right: '0',
                  cursor: 'ns-resize',
                }}
                className={styles.resizeBorder}
              />
              <span
                data-point="right"
                style={{
                  width: '2px',
                  top: '0',
                  right: '0',
                  bottom: '0',
                  cursor: 'ew-resize',
                }}
                className={styles.resizeBorder}
              />
              <span
                data-point="bottom"
                style={{
                  height: '2px',
                  left: '0',
                  bottom: '0',
                  right: '0',
                  cursor: 'ns-resize',
                }}
                className={styles.resizeBorder}
              />
              <span
                data-point="left"
                style={{
                  width: '2px',
                  top: '0',
                  left: '0',
                  bottom: '0',
                  cursor: 'ew-resize',
                }}
                className={styles.resizeBorder}
              />
            </>
          )}
        </div>
      </Dragger>
    )
  }
}

