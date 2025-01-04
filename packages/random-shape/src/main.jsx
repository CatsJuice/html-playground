const center = [50, 50];
const points = 500;
const radius = 20;
const moveRange = [-2, 5];
const initialPath = [];
const duration = 300;
for (let i = 0; i < points; i++) {
  const angle = (i / points) * 2 * Math.PI;
  const x = center[0] + Math.cos(angle) * radius;
  const y = center[1] + Math.sin(angle) * radius;
  initialPath.push([x, y]);
}

const randomPath = () => {
  return initialPath.map((_, i) => {
    const angle = (i / points) * 2 * Math.PI;
    const move = moveRange[0] + (moveRange[1] - moveRange[0]) * Math.random();
    const newRadius = radius + move;
    const newX = center[0] + Math.cos(angle) * newRadius;
    const newY = center[1] + Math.sin(angle) * newRadius;
    return [newX, newY];
  });
};

const pathToD = (path) => {
  return `M${path.map(([x, y]) => `${x} ${y}`).join(" ")}Z`;
};

const App = () => {
  const pathRef = React.useRef(null);
  const pathDataRef = React.useRef(initialPath);

  const next = React.useCallback(() => {
    const from = pathDataRef.current;
    const to = randomPath();

    return new Promise((resolve) => {
      const startTime = Date.now();

      const tick = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentPath = from.map((point, i) => {
          const [initialX, initialY] = point;
          const [targetX, targetY] = to[i];
          const x = initialX + (targetX - initialX) * progress;
          const y = initialY + (targetY - initialY) * progress;
          return [x, y];
        });

        pathRef.current.setAttribute("d", pathToD(currentPath));

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          pathDataRef.current = to;
          resolve();
        }
      };

      tick();
    });
  }, []);

  const loop = React.useCallback(() => {
    next().then(() => {
      loop();
    });
  }, []);

  React.useEffect(() => {
    loop();
  }, [loop]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className="shape"
    >
      <path ref={pathRef} fill="currentColor" />
    </svg>
  );
};

ReactDOM.createRoot(root).render(<App />);
