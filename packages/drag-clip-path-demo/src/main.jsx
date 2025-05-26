const radius = 36;
let gap = 12;

const App = () => {
  const cardRef = React.useRef(null);
  const circleRef = React.useRef(null);

  React.useEffect(() => {
    const handleWheel = (e) => {
      const { deltaY } = e;
      gap = Math.min(200, Math.max(12, gap + deltaY / 10));
    };

    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  React.useEffect(() => {
    const card = cardRef.current;
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { width, height, left, top } = card.getBoundingClientRect();
      const cardX = clientX - left;
      const cardY = clientY - top;

      const limitedX = Math.max(Math.min(left + width, clientX), left);
      const limitedY = Math.max(Math.min(top + height, clientY), top);

      circleRef.current.style.transform = `translate(${limitedX - radius}px, ${
        limitedY - radius
      }px)`;
      circleRef.current.style.width = `${radius * 2}px`;
      circleRef.current.style.height = `${radius * 2}px`;

      const limitedCardX = limitedX - left;
      const limitedCardY = limitedY - top;

      // const dynamicGap = Math.max(
      //   Math.min(
      //     width / 2 - Math.abs(limitedCardX - width / 2),
      //     width / 2 - Math.abs(width / 2 - limitedCardX)
      //   ),
      //   gap
      // );

      card.style.setProperty("--mask-x", `${limitedCardX}px`);
      card.style.setProperty("--mask-y", `${limitedCardY}px`);
      card.style.setProperty("--mask-radius", `${radius + gap}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <div className="card" ref={cardRef} />
      <div className="circle" ref={circleRef} />
    </>
  );
};

ReactDOM.createRoot(root).render(<App />);
