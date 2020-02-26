/**
 * Default CSS definition for typescript,
 * will be overridden with file-specific definitions by rollup
 */
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

interface SvgrComponent extends React.StatelessComponent<React.SVGAttributes<SVGElement>> {}

declare module '*.svg' {
  const svgUrl: string;
  const svgComponent: SvgrComponent;
  export default svgUrl;
  export { svgComponent as ReactComponent }
}

type DraggableEventHandler = (e: MouseEvent, data: DraggableData) => void | false


type EventHandler<T> = (e: T) => void

interface DraggableData {
  node: HTMLElement
  x: number
  y: number
  deltaX: number
  deltaY: number
  ox?: number
  oy?: number
}

interface Bounds {
  left: number
  top: number
  right: number
  bottom: number
}
interface ControlPosition { x: number; y: number }

interface PositionOffsetControlPosition {
  x: number | string
  y: number | string
}

interface DraggableCoreState {
  allowAnyClick: boolean
  cancel: string
  children: HTMLElement
  disabled: boolean
  enableUserSelectHack: boolean
  offsetParent: HTMLElement
  grid: [number, number]
  handle: string
  onStart: any
  onDrag: any
  onStop: any
  onMouseDown: (e: MouseEvent) => void
  scale: number
}
