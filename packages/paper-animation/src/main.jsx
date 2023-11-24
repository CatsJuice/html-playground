const segments = 8;
const centerIndex = 3;
const rotateX = 360 / segments;
const easing = "spring(5, 100, 10, 0)";

const App = () => {
  return (
    <div className="move-in">
      <Paper
        segments={segments}
        centerIndex={Math.min(segments - 1, Math.max(0, centerIndex))}
        content={<Content />}
      />
    </div>
  );
};

ReactDOM.createRoot(root).render(<App />);

const Context = React.createContext();

const Segment = ({ children, index, direction, ...attrs }) => {
  const { content } = React.useContext(Context);
  return (
    <div className="segment" {...attrs} data-direction={direction}>
      <div className="content-wrapper" style={{ "--index": index }}>
        <div className="content">{content}</div>
      </div>
      {children}
    </div>
  );
};

const Segments = ({ level, direction, root, index }) => {
  if (!level) return null;

  const { centerIndex, segments } = React.useContext(Context);
  if (root) {
    const up = centerIndex;
    const down = segments - up - 1;
    const vars = {
      "--segments": segments,
      "--segments-up": up,
      "--segments-down": down,
    };
    return (
      <Segment data-root={true} style={vars} index={up}>
        <Segments index={up - 1} level={up} direction="up" />
        <Segments index={up + 1} level={down} direction="down" />
      </Segment>
    );
  }

  const children =
    level === 1 ? null : (
      <Segments
        direction={direction}
        index={direction === "up" ? index - 1 : index + 1}
        level={level - 1}
      />
    );
  return (
    <Segment direction={direction} index={index}>
      {children}
    </Segment>
  );
};

const Paper = ({ segments, centerIndex, content }) => {
  React.useEffect(() => {
    anime({
      targets: '.segment[data-direction="up"]',
      rotateX: [-rotateX, 0],
      easing,
    });
    anime({
      targets: '.segment[data-direction="down"]',
      rotateX: [rotateX, 0],
      easing,
    });
  }, []);

  return (
    <Context.Provider value={{ segments, centerIndex, content }}>
      <div className="paper">
        <Segments level={segments} root={true} />
      </div>
    </Context.Provider>
  );
};

const Content = () => {
  return (
    <article>
      <h1>🤗 Effects</h1>
      <p>
        Effects are an
        <a href="https://react.dev/learn/escape-hatches" target="_blank">
          “escape hatch”
        </a>
        : you use them when you need to “step outside React” and when there is
        no better built-in solution for your use case. If you find yourself
        often needing to manually write Effects, it’s usually a sign that you
        need to extract some
        <a
          href="https://react.dev/learn/reusing-logic-with-custom-hooks"
          target="_blank"
        >
          custom Hooks
        </a>
        for common behaviors your components rely on.
      </p>
      <p>
        For example, this
        <code>useChatRoom</code> custom Hook “hides” the logic of your Effect
        behind a more declarative API
      </p>
    </article>
  );
};
