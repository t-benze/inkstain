export const extractSVGShapeAttributes = (
  element: SVGGraphicsElement,
  scale: number
) => {
  const attributes: { [key: string]: string } = {};
  [
    'x',
    'y',
    'x1',
    'y1',
    'x2',
    'y2',
    'width',
    'height',
    'rx',
    'ry',
    'stroke',
    'stroke-width',
    'fill',
    'cx',
    'cy',
    'd',
  ].forEach((attribute) => {
    const value = element.getAttribute(attribute);
    if (value) {
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        attributes[attribute] = (parseFloat(value) / scale).toFixed(2);
      } else {
        attributes[attribute] = value;
      }
    }
  });
  return attributes;
};

export const restoreSVGShapeAttributes = (
  attributes: object,
  scale: number
) => {
  const newAttributes: { [key: string]: string } = {};
  Object.entries(attributes).forEach(([key, value]) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      newAttributes[key] = (parseFloat(value) * scale).toFixed(2);
    } else {
      newAttributes[key] = value;
    }
  });
  return newAttributes;
};

export const translatePath = (
  pathData: string,
  dx: number,
  dy: number
): string => {
  return pathData.replace(
    /([ML])\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/g,
    (match, command, x, y) => {
      const newX = parseFloat(x) + dx;
      const newY = parseFloat(y) + dy;
      return `${command}${newX.toFixed(2)},${newY.toFixed(2)}`;
    }
  );
};

export const fitLineToRect = (line: SVGGraphicsElement, newRect: DOMRect) => {
  const y1 = parseFloat(line.getAttribute('y1') || '0');
  const y2 = parseFloat(line.getAttribute('y2') || '0');
  if (y1 > y2) {
    line.setAttribute('x1', `${newRect.x}`);
    line.setAttribute('y1', `${newRect.y + newRect.height}`);
    line.setAttribute('x2', `${newRect.x + newRect.width}`);
    line.setAttribute('y2', `${newRect.y}`);
  } else {
    line.setAttribute('x1', `${newRect.x}`);
    line.setAttribute('y1', `${newRect.y}`);
    line.setAttribute('x2', `${newRect.x + newRect.width}`);
    line.setAttribute('y2', `${newRect.y + newRect.height}`);
  }
};
