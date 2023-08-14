const rectSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect stroke="#666" width="100" y="20" height="80" fill="currentColor" />
</svg>`;

const circleSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle stroke="#666" cx="50" cy="50" r="50" fill="currentColor" />
</svg>`;

const triangleSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon stroke="#666" points="50,0 100,100 0,100" fill="currentColor" />
</svg>`;

const rhombicSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon stroke="#666" points="50,0 100,50 50,100 0,50" fill="currentColor" />
</svg>`;

const roundedSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect stroke="#666" width="100" height="100" rx="10" fill="currentColor" />
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
  z1: { x: 0, y: 5, scale: 1, rotate: 0, origin: "50% 100%" },
  z2: { x: -15, y: -7, scale: 0.75, rotate: 0, origin: "20% 20%" },
  z3: { x: 15, y: -7, scale: 0.75, rotate: 0, origin: "80% 20%" },
  hidden: { x: 0, y: 120, scale: 0, origin: "50% 50%" },
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
                <Shape key={i} shape={shape} order={data.order[i]} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Shape = ({ shape, order }) => {
  const shapeRef = useRef();
  const fillShapeRef = useRef();

  useEffect(() => {
    const pos = position[order <= 3 ? `z${order}` : "hidden"];
    shapeRef.current.style.setProperty("--x", `${pos.x}px`);
    shapeRef.current.style.setProperty("--y", `${pos.y}px`);
    shapeRef.current.style.setProperty("--scale", String(pos.scale || 1));
    shapeRef.current.style.setProperty(
      "--rotate",
      `${pos.rotate || 0}deg` || 0
    );
    shapeRef.current.style.zIndex = 999 - order;
    shapeRef.current.style.transformOrigin = pos.origin;

    if (fillShapeRef.current) {
      fillShapeRef.current.style.setProperty("--y", "100px");
      fillShapeRef.current.style.setProperty("--scale", "0.9");
      fillShapeRef.current.style.zIndex = 999;
    }
  }, [shape, order]);

  let startPos = { x: 0, y: 0 };
  let dragging = false;
  let outside = false;
  let rect = null;

  useEffect(() => {
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", touchMove);
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", onEnd);
    };
  });

  function onDragStart(e) {
    if (order !== 1) return;
    // setDragging(true);
    dragging = true;
    shapeRef.current.classList.add("dragging");
    startPos = { x: e.x, y: e.y };
    rect = document.querySelector(".toolbar").getBoundingClientRect();
  }
  function onDrag(e) {
    if (!dragging) return;
    shapeRef.current.style.setProperty("--offset-x", `${e.x - startPos.x}px`);
    shapeRef.current.style.setProperty("--offset-y", `${e.y - startPos.y}px`);
    const x = e.x;
    const y = e.y;
    const isOut = y < rect.top || x < rect.left || x > rect.right;
    if (isOut !== outside) {
      fillShapeRef.current.style.setProperty("--y", isOut ? "5px" : "100px");
      fillShapeRef.current.style.setProperty("--scale", isOut ? "1" : "0.9");
    }
    outside = isOut;
  }
  function touchMove(e) {
    if (!dragging) return;
    onDrag({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }
  function onMouseMove(e) {
    if (!dragging) return;
    onDrag({ x: e.clientX, y: e.clientY });
  }
  function onEnd() {
    if (!dragging) return;
    dragging = false;

    if (outside) {

      fillShapeRef.current.style.setProperty("transition", "none")
      fillShapeRef.current.style.setProperty("--y", "100px");
      shapeRef.current.style.setProperty("--offset-x", `${0}px`);
      shapeRef.current.style.setProperty("--offset-y", `${0}px`);
      setTimeout(() => {
        shapeRef.current.classList.remove("dragging");
        fillShapeRef.current.style.removeProperty("transition")
      })
    } else {
      shapeRef.current.classList.remove("dragging");
      shapeRef.current.style.setProperty("--offset-x", `${0}px`);
      shapeRef.current.style.setProperty("--offset-y", `${0}px`);
      fillShapeRef.current.style.setProperty("--y", "100px");
    }
  }

  return (
    <>
      <div
        onMouseDown={(e) => onDragStart({ x: e.clientX, y: e.clientY })}
        onMouseMove={(e) => onDrag({ x: e.clientX, y: e.clientY })}
        ref={shapeRef}
        className="shape"
        dangerouslySetInnerHTML={{ __html: shape.svg }}
      />
      {order === 1 ? (
        <div
          className="shape"
          ref={fillShapeRef}
          dangerouslySetInnerHTML={{ __html: shape.svg }}
        />
      ) : null}
    </>
  );
};

ReactDOM.createRoot(root).render(<App />);
