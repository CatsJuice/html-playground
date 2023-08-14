const rectSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect stroke="#222" width="100" height="80" fill="currentColor" />
</svg>`;

const circleSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle stroke="#222" cx="50" cy="50" r="50" fill="currentColor" />
</svg>`;

const triangleSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon stroke="#222" points="50,0 100,100 0,100" fill="currentColor" />
</svg>`;

const rhombicSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon stroke="#222" points="50,0 100,50 50,100 0,50" fill="currentColor" />
</svg>`;

const roundedSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect stroke="#222" width="100" height="100" rx="10" fill="currentColor" />
</svg>`;

const { useState, useRef, useEffect } = React;

const shapes = [
  { name: "rect", svg: rectSvg },
  { name: "circle", svg: circleSvg },
  { name: "triangle", svg: triangleSvg },
  { name: "rhombic", svg: rhombicSvg },
  { name: "rounded", svg: roundedSvg },
];
const shapesMap = shapes.reduce((acc, { name, svg }) => {
  acc[name] = svg;
  return acc;
}, {});

const position = {
  z1: {
    normal: { x: 0, y: 10 },
    expand: { x: 0, y: 30 },
  },
  z2: {
    normal: { x: -15, y: -7 },
    expand: { x: -30, y: -30 },
  },
  z3: {
    normal: { x: 15, y: -7 },
    expand: { x: 30, y: -30 },
  },
  z1Enter: {
    normal: { x: 0, y: 120 },
  },
  z3Leave: {
    normal: { x: 0, y: 120 },
  },
};

const App = () => {
  const [data, setData] = useState({
    activeShape: shapes[0].name,
    order: shapes.map((_, i) => i + 1),
  });

  const active = (name) => {
    const { order } = data;
    const index = shapes.findIndex(({ name: n }) => n === name);
    const prevOrder = order[index];
    const newOrder = order.map((o, i) =>
      o < prevOrder ? o + 1 : o === prevOrder ? 1 : o
    );
    setData({ ...data, activeShape: name, order: newOrder });
  };

  return (
    <>
      <div className="selector">
        {shapes.map(({ name, svg }, index) => (
          <div className="selector-item" key={name}>
            <div
              onClick={() => active(name)}
              className={[
                "selector-item-svg",
                data.activeShape === name && "active",
              ]
                .filter(Boolean)
                .join(" ")}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <div>{data.order[index]}</div>
          </div>
        ))}
      </div>
      <div className="toolbar-card">
        <div className="toolbar-clip">
          <div className="toolbar">
            <div className="shapes">
              {shapes.map((shape, i) => (
                <Shape shape={shape} order={data.order[i]} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Shape = ({ shape, order = 1 }) => {

  const shapeRef = useRef();
  const oldOrder = useRef();

  useEffect(() => {
    let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
    if (order > 3) {
      y1 = 50
      y2 = 100
    } else {
      if (order === 1) {
        if (oldOrder.current) {
          if (oldOrder.current > 3) {
            y1 = 45
          } else {
            if (oldOrder.current === 2) {
              x1 = -30
              y1 = -30
            }
            else if (oldOrder.current === 3) {
              x1 = 30
              y1 = -30
            }
          }
        } else {
          y1 = 10
          x1 = 0
        }
        y2 = 10
        x2 = 0
      }
      else if (order === 2) {
        y2 = -10
        x2 = -10
      }
      else if (order === 3) {
        y2 = -10
        x2 = 10
      }
    }
    anime({
      targets: shapeRef.current,
      keyframes: [
        { translateX: x1, translateY: y1 },
        { translateX: x2, translateY: y2, zIndex: 999 - order },
      ],
      duration: 400,
      easing: "easeInOutQuad",
    });
    oldOrder.current = order;
  }, [shape, order])

  return (
    <div
      ref={shapeRef}
      className="shape" 
      dangerouslySetInnerHTML={{ __html: shape.svg }}
    />
  );
};

ReactDOM.createRoot(root).render(<App />);
