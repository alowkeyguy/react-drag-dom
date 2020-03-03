import * as React from 'react'
import { v4 } from 'uuid'
import DragFrame from '../dragFrame'
import { createCSSTransform } from "../utils/domFns";
import { resumeOffsetParentPoint } from "../utils/utils";

interface IPosition {
  start: ControlPosition
  end: ControlPosition
  node: HTMLElement
}

interface IPArray extends IPoint {
  style?: string
  offsetX?: number
  offsetY?: number
}

interface IProps {
  xN: number
  yN: number
  points?: IPoint[]
  setPoints: (points: IPoint[]) => void
  bounds?: HTMLElement
  triggerBounds?: (p: ControlPosition) => ControlPosition
  createPointView?: (points: IPoint[]) => HTMLElement
  pointBaseInfo?: any
  id?: string
}

interface IState {
  pArray: IPArray[]
}

class BatchAdd extends React.Component<IProps, IState> {
  state = {
    pArray: []
  };

  static defaultProps = {
    id: 'id',
    points: []
  }

  draw = (
    _e: HTMLElement,
    _startP: ControlPosition,
    _endP: ControlPosition,
    position: IPosition
  ) => {
    const { xN, yN, id = 'id' } = this.props;
    const { start, end } = position;
    const xCell = ((end.x - start.x) * (xN - 1)) / ((xN - 1) * (xN - 1) || 1);
    const yCell = ((end.y - start.y) * (yN - 1)) / ((yN - 1) * (yN - 1) || 1);

    const nArr = new Array(xN * yN).fill(0).map((_item, i) => {
      const ox = xCell * (i % xN);
      const oy = (yCell * (i - (i % xN))) / xN;
      return {
        x: 0,
        y: 0,
        [id]: v4(),
        style: createCSSTransform({
          x: ox,
          y: oy
        }),
        offsetX: ox,
        offsetY: oy
      };
    });
    this.setState({
      pArray: nArr
    });
  };
  drawStop = (
    _e: HTMLElement,
    _startP: ControlPosition,
    _endP: ControlPosition,
    position: IPosition
  ) => {
    const pArray = this.state.pArray;
    const { id = 'id', pointBaseInfo } = this.props
    const baseX = position.end.x - position.start.x;
    const baseY = position.end.y - position.start.y;
    const nArr = pArray.map((item: IPArray) => ({
      ...pointBaseInfo,
      x: item.x + ((item.offsetX || 0) / baseX) * 100,
      y: item.y + ((item.offsetY || 0) / baseY) * 100,
      [id]: item[id]
    }));
    this.setState({
      pArray: nArr
    });
  };

  cancel = (_e: HTMLElement, start: ControlPosition, end: ControlPosition) => {
    const { setPoints, points = [] } = this.props;
    setPoints([
      ...points,
      ...resumeOffsetParentPoint(start, end, this.state.pArray)
    ]);
  };

  render() {
    const { createPointView, bounds, triggerBounds } = this.props;
    const pArray = this.state.pArray;
    return (
      <DragFrame
        zoomAble
        onDraw={this.draw}
        onDrawStop={this.drawStop}
        onCancel={this.cancel}
        bounds={bounds}
        triggerBounds={triggerBounds}
      >
        {createPointView ? createPointView(pArray) : null}
      </DragFrame>
    );
  }
};

export default BatchAdd;
