# react-drag-dom

> React draggable component

[![NPM](https://img.shields.io/npm/v/react-drag-dom.svg)](https://www.npmjs.com/package/react-drag-dom) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Application
When you are asked to set a point on a scalable graph, ues it. in this components, Coordinates are in percent

## Install

```bash
npm install --save @tuya-fe/react-drag-dom
```

## Usage
[demon](./example/src/App.js)

## Dragger
Property | Description | 	Type | Default
-------- | ----------- |  ---- | -------
disabled | forbid drag | boolean | false
bounds | boundaries of movement，go beyond will trigger `triggerBounds` | ReactNode | --
triggerBounds | triggered when out of boundaries | ({x, y}) => {x, Y} | --
offsetParent | assign relative position element | ReactNode
onStart | drag start | function | --
onDrag | -- | function | --
onStop | -- | function | --
onClick | -- | function | --

## DragFrame
Property | Description | Type | Default
-------- | ----------- | ---- | -------
offsetParent | assign relative position element | ReactNode
bounds | boundaries of movement，go beyond will trigger `triggerBounds` | ReactNode | --
triggerBounds | triggered when out of boundaries | ({x, y}) => {x, Y} | --
zoomAble | if resize selected areas | boolean | false
onDrawStart | draw start | function | --
onDraw | drawing | function | --
onDrawStop | draw end | function | --
onCancel | complete select | function | --

## demo
![demo](./example/src/img/demo.gif)

## License

MIT © [alowkeyguy](https://github.com/alowkeyguy)
