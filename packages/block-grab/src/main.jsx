const { useState } = React;

const App = () => {
  const [blocks, setBlocks] = React.useState([
    { padding: 5, height: 100, rowHeight: 40 },
    { padding: 5, height: 40, rowHeight: 30 },
    { padding: 5, height: 80, rowHeight: 20 },
    { padding: 5, height: 60, rowHeight: 20 },
  ]);

  const [grabProps, setGrabProps] = React.useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    padding: 0,
    show: false,
  });

  const onMouseEnter = (block, e) => {
    const target = e.target;
    const rect = target.getBoundingClientRect();
    const { top, left, width, height } = rect;
    setGrabProps({
      top: top + block.padding,
      left: left - 20,
      width: 5,
      height: block.rowHeight,
      show: true,
      padding: block.padding,
    });
  };
  const onMouseLeave = (e) => {
    setGrabProps({ ...grabProps, display: "none" });
  };

  const grabHover = (e) => {
    const range = [0, 3];
    const allBlocks = document.querySelectorAll(".block");
    const startRect = allBlocks[range[0]].getBoundingClientRect();
    const endRect = allBlocks[range[1]].getBoundingClientRect();

    console.log(1);
    setGrabProps({
      ...grabProps,
      top: startRect.top,
      height: endRect.bottom - startRect.top,
      display: "block",
    });
  };
  const grabBlur = (e) => {};

  return (
    <div className="blocks">
      {blocks.map((blk, index) => (
        <Block
          key={index}
          {...blk}
          onMouseEnter={(e) => onMouseEnter(blk, e)}
          onMouseLeave={onMouseLeave}
        />
      ))}
      <Grab {...grabProps} onMouseEnter={grabHover} onMouseLeave={grabBlur} />
    </div>
  );
};

const Grab = ({
  left,
  top,
  width,
  height,
  show,
  padding,
  onMouseEnter,
  onMouseLeave,
}) => {
  const style = {
    left: left + "px",
    top: top + "px",
    width: width + "px",
    height: height + "px",
    position: "fixed",
    display: show ? "block" : "none",
    padding: `${padding}px 0`,
  };
  return (
    <div
      className="grab"
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="grab-handle"></div>
    </div>
  );
};

const Block = ({ padding, height, rowHeight, onMouseEnter, onMouseLeave }) => {
  const blockStyle = {
    lineHeight: rowHeight + "px",
    padding: padding + "px",
    height: height + "px",
    backgroundColor: "#ddd",
    borderRadius: "7px",
  };
  return (
    <div
      className="block"
      style={blockStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};

ReactDOM.createRoot(root).render(<App />);
