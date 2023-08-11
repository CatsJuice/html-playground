const { useState, useEffect, useRef } = React;

const App = () => {
  const [graphics, setGraphics] = useState([]);
  const size = 140;
  return (
    <>
      <Canvas graphics={graphics} size={size} />
      <Papers size={size} onCreate={(e) => setGraphics([...graphics, e])} />
    </>
  );
};

const Paper = ({
  size = 500,
  color = "#FFBDF2",
  roll = false,
  duration = 330,
}) => {
  const id = useRef(Math.random());
  const animeRef = useRef();
  const maskRef = useRef();
  const rollRef = useRef();
  const shadowRef = useRef();
  const rollLightRef = useRef();
  const distanceRef = useRef(getDistance(size, roll));

  const maskId = `mask-${id.current}`;
  const gradientId = `gradient-${id.current}`;
  const blurId = `blur-${id.current}`;

  useEffect(() => {
    const obj = {
      distance: distanceRef.current,
    };
    const newDistance = getDistance(size, roll);

    function update() {
      distanceRef.current = obj.distance;
      maskRef.current.setAttribute("d", getMaskD(obj.distance, size));
      rollRef.current.setAttribute("d", getRollD(obj.distance, size));
      rollLightRef.current.setAttribute("d", getRollD(obj.distance, size));
      shadowRef.current.setAttribute("d", getShadowD(obj.distance, size));
    }
    animeRef.current && animeRef.current.pause();
    if (duration) {
      animeRef.current = anime({
        targets: obj,
        distance: newDistance,
        easing: "easeInOutQuad",
        duration,
        update,
      });
    } else {
      obj.distance = newDistance;
      update();
    }
  }, [roll]);

  return (
    <svg
      className="paper"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <g mask={`url(#${maskId})`}>
        <rect width={size} height={size} fill={color} />
        <path
          ref={shadowRef}
          fill="black"
          fillOpacity="0.3"
          filter={`url(#${blurId})`}
        />
        <path fill={color} ref={rollRef} />
        <path fill={`url(#${gradientId})`} ref={rollLightRef} />
      </g>
      <mask id={maskId}>
        <path ref={maskRef} fill="white" />
      </mask>

      <defs>
        <linearGradient id={gradientId} x1="0.48" x2="0.6" y1="0.45" y2="0.6">
          <stop offset="0%" stopColor="#ffffff60" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>

        <filter
          id={blurId}
          x="-58"
          y="-45.9995"
          width={size}
          height={size}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          ></feBlend>
          <feGaussianBlur
            stdDeviation={size / 10}
            result="effect1_foregroundBlur_221_5067"
          ></feGaussianBlur>
        </filter>
      </defs>
    </svg>
  );
};

const Papers = ({ size = 200, onCreate }) => {
  const [dragging, setDragging] = useState(false);
  const [out, setOut] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [colors, setColors] = useState(
    new Array(4).fill(0).map(getRandomPaperColor)
  );

  const dockRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const rect = useRef(null);

  const onMouseDown = (e) => dragStart(e.clientX, e.clientY);
  const touchStart = (e) => dragStart(e.touches[0].clientX, e.touches[0].clientY);

  const dragStart = (x, y) =>  {
    setDragging(true);
    startPos.current = { x, y };
    rect.current = dockRef.current.getBoundingClientRect();
  }
  const onMouseMove = (e) => onDrag(e.clientX, e.clientY);
  const touchMove = (e) => onDrag(e.touches[0].clientX, e.touches[0].clientY);
  const onDrag = (x, y) => {
    if (!dragging) return;
    setOffset({
      x: x - startPos.current.x,
      y: y - startPos.current.y,
    });
    const isOut =
      y < rect.current.top || x < rect.current.left || x > rect.current.right;
    setOut(isOut);
  }
  const onEnd = (e) => {
    if (!dragging) return;
    setDragging(false);
    setOffset({ x: 0, y: 0 });
    const paperRect = e.target.getBoundingClientRect();
    if (out) {
      const color = colors.pop();
      onCreate && onCreate({ x: paperRect.left, y: paperRect.top, color });
      setColors([getRandomPaperColor(), ...colors]);
    }
  };

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

  return (
    <div className="dock-wrapper">
      <div className="dock-clip">
        <div
          ref={dockRef}
          className={`dock ${dragging ? "dragging" : ""} ${out ? "out" : ""}`}
        >
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div className="paper-wrapper" key={i}>
                <Paper
                  duration={dragging || !out ? 300 : 0}
                  key={i}
                  size={size}
                  roll={i === 2 && out && dragging}
                  color={colors[i]}
                />
              </div>
            ))}
          <div
            style={{ "--x": `${offset.x}px`, "--y": `${offset.y}px` }}
            className="paper-wrapper"
            onMouseDown={onMouseDown}
            onTouchStart={touchStart}
          >
            <Paper
              color={colors[3]}
              size={size}
              roll={!dragging}
              duration={dragging || !out ? 330 : 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Canvas = ({ graphics = [], size = 200 }) => {
  return (
    <div className="canvas">
      {graphics.map((g, i) => (
        <div
          key={i}
          className="graphic"
          style={{ left: `${g.x}px`, top: `${g.y}px` }}
        >
          <Paper size={size} color={g.color} />
        </div>
      ))}
    </div>
  );
};

ReactDOM.createRoot(root).render(<App />);

// utils
// ------------------------------
function getShadowD(distance = 80, size = 500) {
  const ctx = d3.path();
  const c1 = (distance * 2 + size / 6) * (distance / getDistance(size, true));
  ctx.moveTo(0, 0);
  ctx.lineTo(0, c1);
  ctx.lineTo(c1, 0);
  ctx.closePath();
  return ctx.toString();
}
function getDistance(size, roll = false) {
  return roll ? size / 6 : 0;
}
function getMaskD(distance = 80, size = 500) {
  const c1 = distance * 2 + size / 10;
  const ctx = d3.path();
  ctx.moveTo(0, c1);
  ctx.bezierCurveTo(0, distance * 2, 0, distance * 2, distance, distance);
  ctx.bezierCurveTo(distance * 2, 0, distance * 2, 0, c1, 0);
  ctx.lineTo(size, 0);
  ctx.lineTo(size, size);
  ctx.lineTo(0, size);
  ctx.lineTo(0, c1);
  return ctx.toString();
}
function getRollD(distance = 80, size = 500) {
  const ctx = d3.path();
  const c1 = distance / 1;
  const pointer = [distance * 1.5, distance * 1.3];

  ctx.moveTo(pointer[0], pointer[1]);
  ctx.bezierCurveTo(
    pointer[0],
    pointer[1],
    distance - c1 / 2 - 2,
    distance + c1 / 2 - 2,
    distance - c1 - 2,
    distance + c1 - 2
  );
  ctx.lineTo(distance + c1, distance - c1);
  ctx.bezierCurveTo(
    distance + c1 / 2 - 2,
    distance - c1 / 2 - 2,
    pointer[0],
    pointer[1],
    pointer[0],
    pointer[1]
  );
  ctx.closePath();
  return ctx.toString();
}
function getRandomPaperColor() {
  const colors = [
    "#9A73EF",
    "#F6A89B",
    "#64D183",
    "#66A9ED",
    "#F3CD6F",
    "#D4C8C5",
    "#F8C89D",
    "#F8C89D",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
