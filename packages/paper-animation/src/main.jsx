const depth = 10;
const rotateX = depth * 2.5;

const App = () => {
  React.useEffect(() => {
    anime({
      targets: ".segment > .segment",
      rotateX: [rotateX, 0],
      easing: "spring(5, 100, 10, 0)",
    });
  }, []);

  return (
    <>
      <div className="move-in">
        <Paper depth={depth} content={<Content />} />
      </div>
    </>
  );
};

ReactDOM.createRoot(root).render(<App />);

const Segment = ({ children, content, level, ...attrs }) => {
  return (
    <div className="segment" {...attrs}>
      <div className="content-wrapper" style={{ "--level": level }}>
        <div className="content">{content}</div>
      </div>
      {children}
    </div>
  );
};

const Segments = ({ depth, content }) => {
  const children =
    depth === 1 ? null : <Segments depth={depth - 1} content={content} />;
  return (
    <Segment data-depth={depth} content={content} level={depth}>
      {children}
    </Segment>
  );
};

const Paper = ({ depth, content }) => {
  const variables = { "--depth": depth };
  return (
    <div className="paper" style={variables}>
      <Segments content={content} depth={depth} />
    </div>
  );
};

const Content = () => {
  return (
    <article>
      <h1>🤗 Hi</h1>
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
