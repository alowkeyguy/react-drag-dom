import * as React from 'react'
import DragFrame from '../dragFrame'
import {getAreasPoint, resumeOffsetParentPoint } from "../utils/utils"


interface IPoint extends ControlPosition {
  id: string
}
interface IProps {
  bounds?: HTMLElement
  points: IPoint[]
  setPoints: (points: IPoint[]) => void
  triggerBounds?: (p: ControlPosition) => ControlPosition
  createPointView: (points: IPoint[]) => HTMLElement
}

interface IState {
  pArray: IPoint[]
}
export default class BatchMove extends React.Component<IProps, IState> {
  state = {
    pArray: []
  }

  drawStop = (
    _e: HTMLElement,
    start: ControlPosition,
    end: ControlPosition
  ) => {
    const {points, setPoints} = this.props
    const [pointsArr, valueP ] = getAreasPoint(start, end, points);
    this.setState({
      pArray: pointsArr
    })
    setPoints(valueP);
  };
  cancel = (
    _e: HTMLElement,
    start: ControlPosition,
    end: ControlPosition
  ) => {
    const { points, setPoints } = this.props;
    setPoints([...points, ...resumeOffsetParentPoint(start, end, this.state.pArray)]);
    this.setState({
      pArray: []
    })
  };

  render () {
    const { bounds, triggerBounds, createPointView } = this.props;
    const pArray = this.state.pArray
    return (
      <DragFrame
        bounds={bounds}
        triggerBounds={triggerBounds}
        onDrawStop={this.drawStop}
        onCancel={this.cancel}
      >
        {createPointView(pArray)}
      </DragFrame>
    );
  }
}