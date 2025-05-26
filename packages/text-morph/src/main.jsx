const { animate, createSpring } = anime;

const TextMorphContext = React.createContext();
const TextMorphProvider = ({ children }) => {
  const [map, setMap] = React.useState({
    xxx: [],
  });
  return (
    <TextMorphContext.Provider value={{ map, setMap }}>
      {children}
    </TextMorphContext.Provider>
  );
};

const TextChar = ({ char, id, index }) => {
  const finalId = `${id}:${index}:${char}`;
  return (
    <span data-id={finalId} data-char={char}>
      {char}
    </span>
  );
};

const DURATION = 360;
const ease = "inOutCubic";
const TextMorph = ({ id, text, ...attrs }) => {
  const ref = React.useRef(null);
  const { map, setMap } = React.useContext(TextMorphContext);

  const currentMapRef = React.useRef(null);

  React.useEffect(() => {
    const spans = ref.current.querySelectorAll("span");
    const currentMap = [];
    spans.forEach((span, index) => {
      const char = span.dataset.char;
      currentMap.push({
        char,
        index,
        box: span.getBoundingClientRect(),
        style: getComputedStyle(span),
      });
    });

    currentMapRef.current = currentMap;

    setMap((prev) => ({ ...prev, [id]: currentMap }));
  }, [text, setMap]);

  // apply animation when mounted
  React.useEffect(() => {
    const currentMap = currentMapRef.current;
    const spans = ref.current.querySelectorAll("span");
    // apply animation
    if (map[id]) {
      spans.forEach((span) => {
        span.style.opacity = "0";
      });

      const animations = [];
      const oldMap = [...map[id]];
      const newMap = [...currentMap];
      oldMap.forEach((item) => {
        const matchInNewMap = newMap.find(
          (newItem) => newItem.char === item.char
        );
        if (matchInNewMap) {
          animations.push({
            type: "morph",
            char: item.char,
            oldBox: item.box,
            newBox: matchInNewMap.box,
            oldStyle: item.style,
            newStyle: matchInNewMap.style,
          });
          // remove both in newMap and oldMap
          newMap.splice(newMap.indexOf(matchInNewMap), 1);
          oldMap.splice(oldMap.indexOf(item), 1);
        } else {
          animations.push({
            type: "fade-out",
            char: item.char,
            box: item.box,
            style: item.style,
          });
        }
      });
      newMap.forEach((item) => {
        animations.push({
          type: "fade-in",
          box: item.box,
          char: item.char,
          style: item.style,
        });
      });

      const animationContainer = document.createElement("div");
      animationContainer.style.position = "fixed";
      animationContainer.style.top = "0";
      animationContainer.style.left = "0";
      animationContainer.style.width = "100%";
      animationContainer.style.height = "100%";
      animationContainer.style.zIndex = "1000";
      animationContainer.style.pointerEvents = "none";
      document.body.appendChild(animationContainer);

      Promise.all(
        animations
          .map((animation) => {
            const span = document.createElement("span");
            animationContainer.appendChild(span);
            span.textContent = animation.char;
            span.style.position = "absolute";
            if (animation.type === "morph") {
              span.style.left = `${animation.oldBox.left}px`;
              span.style.top = `${animation.oldBox.top}px`;
              span.style.fontSize = animation.oldStyle.fontSize;
              span.style.fontFamily = animation.oldStyle.fontFamily;
              span.style.color = animation.oldStyle.color;
              span.style.fontWeight = animation.oldStyle.fontWeight;

              return animate(span, {
                left: `${animation.newBox.left}px`,
                top: `${animation.newBox.top}px`,
                fontSize: animation.newStyle.fontSize,
                fontFamily: animation.newStyle.fontFamily,
                color: animation.newStyle.color,
                duration: DURATION,
                ease,
              });
            } else if (animation.type === "fade-out") {
              span.style.left = `${animation.box.left}px`;
              span.style.top = `${animation.box.top}px`;
              span.style.fontSize = animation.style.fontSize;
              span.style.fontFamily = animation.style.fontFamily;
              span.style.color = animation.style.color;
              span.style.fontWeight = animation.style.fontWeight;
              return animate(span, {
                opacity: { from: 1, to: 0 },
                duration: DURATION / 2,
                ease,
              });
            } else if (animation.type === "fade-in") {
              span.style.left = `${animation.box.left}px`;
              span.style.top = `${animation.box.top}px`;
              span.style.fontSize = animation.style.fontSize;
              span.style.fontFamily = animation.style.fontFamily;
              span.style.color = animation.style.color;
              span.style.fontWeight = animation.style.fontWeight;
              return animate(span, {
                opacity: { from: 0, to: 1 },
                duration: DURATION / 2,
                delay: DURATION / 2,
                ease,
              });
            }
          })
          .map(
            (anim) =>
              new Promise((resolve) => {
                anim.onComplete = () => resolve();
              })
          )
      ).then(() => {
        animationContainer.remove();
        spans.forEach((span) => {
          span.style.opacity = "1";
        });
      });
    }
  }, []);

  return (
    <div ref={ref} {...attrs}>
      {text.split("").map((char, index) => {
        return <TextChar key={`${id}.${index}`} char={char} id={id} />;
      })}
    </div>
  );
};

const App = () => {
  const [text1, setText1] = React.useState(
    "Blink-182’s Mark Hoppus got cancer—and then accidentally shared his diagnosis with the public over social media. Turns out getting sick renewed his faith, healed his old friendships, and reminded him what makes life worth living."
  );
  const [text2, setText2] = React.useState(
    "The writer and his girlfriend move to the Dominican Republic, joining the rapidly expanding community of expats who claim to have found paradise. They promptly get robbed at gunpoint. To cope, he investigates the country."
  );
  const [isText1, setIsText1] = React.useState(true);
  const [autoplay, setAutoplay] = React.useState(true);

  const toggle = React.useCallback(() => {
    setIsText1((prev) => !prev);
  }, []);

  React.useEffect(() => {
    if (autoplay) {
      toggle();
      const interval = setInterval(toggle, 2000);
      return () => clearInterval(interval);
    }
    return () => {};
  }, [autoplay, toggle]);

  React.useEffect(() => {
    const onMove = () => setAutoplay(false);
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <TextMorphProvider>
      <div className="app">
        <button onClick={toggle}>Show {isText1 ? "Text 2" : "Text 1"}</button>
        <div className="inputs">
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Text 1"
            rows={5}
          />
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Text 2"
            rows={5}
          />
        </div>
        <div className="text-container">
          {isText1 ? (
            <TextMorph key="text1" id="text" text={text1} />
          ) : (
            <TextMorph
              key="text2"
              id="text"
              text={text2}
              style={{ fontWeight: "500" }}
            />
          )}
        </div>
      </div>
    </TextMorphProvider>
  );
};

ReactDOM.createRoot(root).render(<App />);
