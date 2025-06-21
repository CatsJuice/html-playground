const SAFE_PADDING = 12;

const move = (el, x, y) => {
  el.style.transform = `translate(${x}px, ${y}px)`;
  el.dataset.x = x;
  el.dataset.y = y;
};

const spring1 = new SpringSolver(1.2, 100, 10, 0);
const spring2 = new SpringSolver(0.2, 100, 10, 10);

const computePosition = (options) => {
  const xPos = computeHorizontalPosition(options);
  const yPos = computeVerticalPosition(options);

  const side = xPos.flipSide
    ? xPos.side
    : yPos.flipSide
    ? yPos.side
    : xPos.side;
  const align = xPos.flipAlign
    ? xPos.align
    : yPos.flipAlign
    ? yPos.align
    : xPos.align;

  return {
    x: xPos.x,
    y: yPos.y,
    side,
    align,
  };
};

function computeHorizontalPosition(options) {
  const { anchorRect, menuRect, side, align, alignOffset, sideOffset } =
    options;

  let x;
  if (["bottom", "top"].includes(side)) {
    if (align === "start") {
      x = anchorRect.left + alignOffset;
      if (x + menuRect.width > window.innerWidth && !options.flipAlign) {
        return computeHorizontalPosition({
          ...options,
          align: "end",
          flipAlign: true,
        });
      }
    } else if (align === "end") {
      x = anchorRect.right - menuRect.width + alignOffset;
      if (x < 0 && !options.flipAlign) {
        return computeHorizontalPosition({
          ...options,
          align: "start",
          flipAlign: true,
        });
      }
    } else if (align === "center") {
      x =
        anchorRect.left + (anchorRect.width - menuRect.width) / 2 + alignOffset;
    }
  } else if (side === "left") {
    x = anchorRect.left - menuRect.width - sideOffset;
    if (x < 0 && !options.flipSide) {
      return computeHorizontalPosition({
        ...options,
        align: "right",
        flipSide: true,
      });
    }
  } else if (side === "right") {
    x = anchorRect.right + sideOffset;
    if (x + menuRect.width > window.innerWidth && !options.flipSide) {
      return computeHorizontalPosition({
        ...options,
        align: "left",
        flipSide: true,
      });
    }
  }

  return {
    side,
    align,
    x,
    flipAlign: options.flipAlign,
    flipSide: options.flipSide,
  };
}

function computeVerticalPosition(options) {
  const { anchorRect, menuRect, side, align, alignOffset, sideOffset } =
    options;

  let y;
  if (["left", "right"].includes(side)) {
    if (align === "start") {
      y = anchorRect.top + alignOffset;
      if (y + menuRect.height > window.innerHeight && !options.flipAlign) {
        return computeVerticalPosition({
          ...options,
          align: "bottom",
          flipAlign: true,
        });
      }
    } else if (align === "end") {
      y = anchorRect.bottom - menuRect.height + alignOffset;
      if (y < 0 && !options.flipAlign) {
        return computeVerticalPosition({
          ...options,
          align: "top",
          flipAlign: true,
        });
      }
    } else if (align === "center") {
      y =
        anchorRect.top +
        (anchorRect.height - menuRect.height) / 2 +
        alignOffset;
    }
  } else if (side === "top") {
    y = anchorRect.top - menuRect.height - sideOffset;
    if (y < 0 && !options.flipSide) {
      return computeVerticalPosition({
        ...options,
        side: "bottom",
        flipSide: true,
      });
    }
  } else if (side === "bottom") {
    y = anchorRect.bottom + sideOffset;
    if (y + menuRect.height > window.innerHeight && !options.flipSide) {
      return computeVerticalPosition({
        ...options,
        side: "top",
        flipSide: true,
      });
    }
  }

  return {
    side,
    align,
    y,
    flipAlign: options.flipAlign,
    flipSide: options.flipSide,
  };
}

function approximatelyEqual(a, b, epsilon = 1e-10) {
  return Math.abs(a - b) < epsilon;
}

const Menu = ({ open, onClose, anchorRef, children }) => {
  const hasOpenedRef = React.useRef(false);
  const menuRef = React.useRef(null);
  const animationRef = React.useRef(null);
  const [animating, setAnimating] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      hasOpenedRef.current = true;
    }
    if (hasOpenedRef.current) {
      setAnimating(true);
    }
  }, [open]);

  React.useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    if (open && animating) {
      const anchorRect = anchor.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();

      const { x, y, side, align } = computePosition({
        anchorRect,
        menuRect,
        align: "start",
        side: "bottom",
        alignOffset: 0,
        sideOffset: 12,
      });
      menuRef.current.style.left = `${x}px`;
      menuRef.current.style.top = `${y}px`;
      menuRef.current.style.opacity = 0;
      menuRef.current.dataset.side = side;
      menuRef.current.dataset.align = align;

      const opacity = [0, 1];
      const scaleX = [0.5, 1];
      const scaleY = [0, 1];

      const start = Date.now();
      const animate = () => {
        const elapsed = (Date.now() - start) / 1000;
        const progress = spring1.solve(elapsed);
        menuRef.current.style.opacity =
          opacity[0] + (opacity[1] - opacity[0]) * progress;
        menuRef.current.style.transform = `scaleX(${
          scaleX[0] + (scaleX[1] - scaleX[0]) * progress
        }) scaleY(${scaleY[0] + (scaleY[1] - scaleY[0]) * progress})`;

        if (
          approximatelyEqual(progress, 1, 1e-5) &&
          approximatelyEqual(progress, 1, 1e-5)
        ) {
          setAnimating(false);
          return;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    }

    if (!open && animating) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      const { opacity: opacityStr, transform } = menuRef.current.style;
      const initialScaleX = transform
        ? Number(transform.split("scaleX(")[1].split(")")[0])
        : 1;
      const initialScaleY = transform
        ? Number(transform.split("scaleY(")[1].split(")")[0])
        : 1;
      const initialOpacity = opacityStr ? Number(opacityStr) : 1;

      const opacity = [initialOpacity, 0];
      const scaleX = [initialScaleX, 0.5];
      const scaleY = [initialScaleY, 0];

      const start = Date.now();
      const animate = () => {
        const elapsed = (Date.now() - start) / 1000;
        const progress = spring2.solve(elapsed);
        menuRef.current.style.opacity =
          opacity[0] + (opacity[1] - opacity[0]) * progress;
        menuRef.current.style.transform = `scaleX(${
          scaleX[0] + (scaleX[1] - scaleX[0]) * progress
        }) scaleY(${scaleY[0] + (scaleY[1] - scaleY[0]) * progress})`;

        if (
          approximatelyEqual(progress, 1, 1e-5) &&
          approximatelyEqual(progress, 1, 1e-5)
        ) {
          setAnimating(false);
          return;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    }
  }, [open, animating, anchorRef]);

  if (!open && !animating) return null;

  return ReactDOM.createPortal(
    <div className="menu-mask" onClick={onClose}>
      <div className="menu" ref={menuRef}>
        {children}
      </div>
    </div>,
    document.body
  );
};

const Trigger = ({ open, onClose, onClick }) => {
  const ref = React.useRef(null);

  const checkIfOutOfBounds = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const tx = el.dataset.x ? Number(el.dataset.x) : 0;
    const ty = el.dataset.y ? Number(el.dataset.y) : 0;

    let correctedTX = tx;
    let correctedTY = ty;

    const box = el.getBoundingClientRect();

    if (box.left < SAFE_PADDING) {
      correctedTX = tx + (SAFE_PADDING - box.left);
    } else if (box.right > window.innerWidth - SAFE_PADDING) {
      correctedTX = tx - (box.right - (window.innerWidth - SAFE_PADDING));
    }

    if (box.top < SAFE_PADDING) {
      correctedTY = ty + (SAFE_PADDING - box.top);
    } else if (box.bottom > window.innerHeight - SAFE_PADDING) {
      correctedTY = ty - (box.bottom - (window.innerHeight - SAFE_PADDING));
    }

    if (correctedTX === tx && correctedTY === ty) return;

    const start = Date.now();
    const duration = 120;

    const tick = () => {
      const progress = (Date.now() - start) / duration;
      const x = tx + (correctedTX - tx) * progress;
      const y = ty + (correctedTY - ty) * progress;
      move(el, x, y);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, []);

  const handleClick = React.useCallback(() => {
    onClick();
  }, [onClick]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = -1;
    let startY = -1;
    let startTime = -1;
    let isDragging = false;
    let raf = null;
    let prevX = 0;
    let prevY = 0;

    const onDragStart = ({ x, y }) => {
      startX = x;
      startY = y;
      startTime = Date.now();
      isDragging = true;
      prevX = el.dataset.x ? Number(el.dataset.x) : 0;
      prevY = el.dataset.y ? Number(el.dataset.y) : 0;
    };

    const onDrag = ({ x, y }) => {
      if (!isDragging) return;
      const dx = x - startX;
      const dy = y - startY;
      if (raf) cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        move(el, prevX + dx, prevY + dy);
      });
    };

    const onDragEnd = () => {
      const currX = el.dataset.x ? Number(el.dataset.x) : 0;
      const currY = el.dataset.y ? Number(el.dataset.y) : 0;
      const isClick =
        Date.now() - startTime < 1000 &&
        Math.abs(currX - prevX) < 5 &&
        Math.abs(currY - prevY) < 5;

      if (isClick) {
        handleClick();
      }

      startTime = -1;
      isDragging = false;
      raf = null;

      checkIfOutOfBounds();
    };

    // mouse
    const onMouseDown = (e) => {
      onDragStart({ x: e.clientX, y: e.clientY });
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };
    const onMouseMove = (e) => {
      onDrag({ x: e.clientX, y: e.clientY });
    };
    const onMouseUp = (e) => {
      onDragEnd();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    // touch
    const onTouchStart = (e) => {
      onDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);
    };
    const onTouchMove = (e) => {
      onDrag({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    };
    const onTouchEnd = (e) => {
      onDragEnd();
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("touchstart", onTouchStart);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("touchstart", onTouchStart);
    };
  }, [handleClick, checkIfOutOfBounds]);

  return (
    <button className="trigger" aria-expanded={!!open} ref={ref}>
      <span className="trigger__line line-1" />
      <span className="trigger__line line-2" />

      <Menu open={open} anchorRef={ref} onClose={onClose} />
    </button>
  );
};

const App = () => {
  const [open, setOpen] = React.useState(false);
  const onClose = React.useCallback(() => {
    setOpen(false);
  }, []);

  const autoPlay = React.useCallback(() => {
    const i = setInterval(() => {
      setOpen((prev) => !prev);
    }, 2000);

    return () => clearInterval(i);
  }, []);

  React.useEffect(() => {
    const stop = autoPlay();
    window.addEventListener("mousemove", () => stop(), { once: true });
    return () => stop();
  }, []);

  return (
    <Trigger open={open} onClick={() => setOpen(!open)} onClose={onClose} />
  );
};

ReactDOM.createRoot(root).render(<App />);
