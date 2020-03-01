export const resumeOffsetParentPoint = (
  start: ControlPosition,
  end: ControlPosition,
  arr: any[],
) => {
  const baseX = end.x - start.x;
  const baseY = end.y - start.y;
  return arr.length
    ? arr.map(item => ({
        ...item,
        x: (item.x * baseX) / 100 + start.x,
        y: (item.y * baseY) / 100 + start.y
      }))
    : [];
};

export const getAreasPoint = (
  start: ControlPosition,
  end: ControlPosition,
  arr: any[]) => {
  const points: any[] = [];
  const valueP: any[] = [];
  arr.forEach((item) => {
    if (
      start.x < item.x &&
      item.x < end.x &&
      start.y < item.y &&
      item.y < end.y
    ) {
      points.push({
        ...item,
        x: ((item.x - start.x) * 100) / (end.x - start.x),
        y: ((item.y - start.y) * 100) / (end.y - start.y)
      });
    } else {
      valueP.push({ ...item });
    }
  });
  return [ points, valueP ];
};