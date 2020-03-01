import React, { useState, useRef, useEffect } from 'react'
import { v4 } from 'uuid'

import Dragger, {DragFrame, BatchAdd, BatchMove} from 'react-drag-dom'
import './index.css'
const bgImg = require('./img/bg.jpeg')

const [MAX, MIN] = [3, 0.5];
const POINT_SCALE = 0.2;
const MOVE_CELl = 4
const DEFAULT_POINTS = [
  {
    x: 50,
    y: 50,
    id: v4()
  },
  {
    x: 60,
    y: 60,
    id: v4()
  }
];

const TAB_MENU = [
  {
    name: "创建点",
    type: "CREATE"
  },
  {
    name: "框选",
    type: "SELECT"
  },
  {
    name: "框选移动",
    type: "SELECT_MOVE"
  },
  {
    name: "批量创建",
    type: "BATCH_CREATE"
  }
];
const Tab = ({type, setType, className}) => {

  return (
    <div className={className}>
      {TAB_MENU.map(item => (
        <div
          key={item.type}
          onClick={() => setType(type === item.type ? null : item.type)}
          className={`tabCell ${item.type === type ? "tabCellChecked" : ""}`}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}


const Icon = ({point}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: point.x + "%",
        top: point.y + "%",
        width: "1px",
        height: "1px",
        ...point.style
      }}
    >
      <div className="icon"></div>
    </div>
  );
}

const content = (arr) => arr.map(point => <Icon key={point.id} point={point} />)


const App = () => {
  const [zoom, setZoom] = useState(1);
  const [points, setPoints] = useState(DEFAULT_POINTS);
  const [p, setP] = useState({ x: 0, y: 0 }); // 拖动位置
  const [current, setCurrent] = useState({x: 0, y: 0})
  const [checked, setChecked] = useState([])
  const [type, setType] = useState(null)
  const contentRef = useRef(null);
  const imgRef = useRef(null)

  useEffect(() => {
    if (type !== 'SELECT') {
      setChecked([])
    }
  }, [type])


  const moveBg = ({x, y}) => {
    const { clientWidth, clientHeight } = imgRef.current;
    const percentX = (x / clientWidth) * 100 * zoom;
    const percentY = (y / clientHeight) * 100 * zoom;
    const [left, top] = [p.x + percentX, p.y + percentY];
    setP({
      x: left,
      y: top
    });
    return {
      x,
      y
    };
  }
  const onMouseDown = (e) => {
    setCurrent(p);
  };
  const onMouseMove = (e) => {
    if (e.buttons === 1) {
      const { movementX, movementY } = e.nativeEvent;
      // 拖动图片
      moveBg({
        x: movementX,
        y: movementY
      });
    }
  };

  const onMouseUp = (e) => {
    const { clientWidth, clientHeight } = e.nativeEvent.srcElement
    const x = (e.nativeEvent.offsetX / clientWidth) * 100
    const y = (e.nativeEvent.offsetY / clientHeight) * 100
    const a = Math.abs(p.x - current.x)
    const b = Math.abs(p.y - current.y)


    // 点击(添加点位)
    if ((a === 0 && b === 0 && type === "CREATE")) {
      setPoints([
        ...points,
        {
          x,
          y,
          id: v4()
        }
      ]);
    }
  }

  const changePoints = (arr) => {
    const map = {};
    arr.forEach((item, i) => (map[item.id] = item));

    setPoints(
      points.map(point => map[point.id] ? map[point.id] : point
      )
    );
  }

  const onStop = (e, data, point, cb) => {
    e.stopPropagation();
    const {x, y} = data
    const { offsetWidth, offsetHeight } = imgRef.current
    changePoints([
      {
        ...point,
        x: (x / offsetWidth) * 100,
        y: (y / offsetHeight) * 100,
      }
    ]);

    cb()
  }

  const batchSelect = (start, end, cb) => {
    const ids =[]
    points.forEach(point => {
      if (point.x > start.x && point.x < end.x) {
        if (point.y > start.y && point.y < end.y) {
          ids.push(point.id);
        }
      }
    });
    setChecked(ids)
    cb()
  }

  return (
    <div className="wrap">
      <Tab className="tab" type={type} setType={setType} />
      <div className="content" ref={contentRef}>
        <div className="scale">
          <div
            className="scaleBtn"
            onClick={() => setZoom(Math.min(zoom + POINT_SCALE, MAX))}
          >
            +
          </div>
          <div
            className="scaleBtn"
            onClick={() => setZoom(Math.max(zoom - POINT_SCALE, MIN))}
          >
            -
          </div>
        </div>
        <div
          className="img"
          style={{
            backgroundImage: `url(${bgImg})`,
            left: p.x - ((zoom - 1) / 2) * 100 + "%",
            top: p.y - ((zoom - 1) / 2) * 100 + "%",
            width: zoom * 100 + "%",
            height: zoom * 100 + "%"
          }}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          ref={imgRef}
        >
          {points.map(point => (
            <Dragger
              onStop={(e, data, cb) => onStop(e, data, point, cb)}
              key={point.id}
              bounds={contentRef.current}
              triggerBounds={({ x, y }) => moveBg({ x: x * 4, y: y * 4 })}
            >
              <div
                style={{
                  position: "absolute",
                  left: point.x + "%",
                  top: point.y + "%",
                  width: "1px",
                  height: "1px"
                }}
              >
                <div
                  style={
                    checked.includes(point.id) ? { borderColor: "red" } : {}
                  }
                  className="icon"
                ></div>
              </div>
            </Dragger>
          ))}
          {type === "SELECT" && (
            <DragFrame
              triggerBounds={({ x, y }) => moveBg({ x: x * MOVE_CELl, y: y * MOVE_CELl })}
              bounds={contentRef.current}
              onDrawStop={(_e, start, end, _offsetP, cb) =>
                batchSelect(start, end, cb)
              }
            />
          )}
          {type === "SELECT_MOVE" && (
            <BatchMove
              bounds={contentRef.current}
              points={points}
              setPoints={setPoints}
              triggerBounds={({ x, y }) => moveBg({ x: x * MOVE_CELl, y: y * MOVE_CELl })}
              createPointView={content}
            />
          )}
          {type === "BATCH_CREATE" && (
            <BatchAdd
              xN={3}
              yN={3}
              bounds={contentRef.current}
              points={points}
              setPoints={setPoints}
              triggerBounds={({ x, y }) => moveBg({ x: x * MOVE_CELl, y: y * MOVE_CELl })}
              createPointView={content}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App
