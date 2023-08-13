const { useState, useEffect, useRef } = React;

const App = () => {
  const [list] = useState([
    { label: "Item 1" },
    { label: "Item 2" },
    {
      label: "Item 3",
      defaultExpanded: false,
      children: [
        { label: "Item 3.1" },
        { label: "Item 3.2" },
        {
          label: "Item 3.3",
          children: [
            { label: "Item 3.3.1" },
            { label: "Item 3.3.2" },
            {
              label: "Item 3.3.3",
              children: [
                { label: "Item 3.3.3.a" },
                { label: "Item 3.3.3.b" },
                { label: "Item 3.3.3.c" },
              ],
            },
          ],
        },
        { label: "Item 3.4" },
      ],
    },
    { label: "Item 4" },
    { label: "Item 5" },
    { label: "Item 6" },
    {
      label: "Item 7",
      defaultExpanded: false,
      children: [
        { label: "Item 7.1" },
        { label: "Item 7.2" },
        { label: "Item 7.3" },
        { label: "Item 7.4" },
      ],
    },
    { label: "Item 8" },
    { label: "Item 9" },
    { label: "Item 10" },
  ]);

  return <List list={list} />;
};

const List = ({ list }) => {
  return (
    <ul>
      {list.map((item, i) => (
        <ListItem item={item} key={i} />
      ))}
    </ul>
  );
};

const ListItem = ({ item }) => {
  const [expanded, setExpanded] = useState(item.defaultExpanded || false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current || !listRef.current.childNodes[0]) return;
    const lis = listRef.current.childNodes[0].childNodes;
    lis.forEach((li, i) => {
      dynamics.animate(
        li,
        {
          marginTop: expanded ? 0 : -li.offsetHeight,
          opacity: expanded ? 1 : 0,
        },
        {
          type: dynamics.spring,
          frequency: 200,
          friction: 200,
          duration: 1500,
          delay: i * 40,
        }
      );
    });
  }, [expanded]);

  return item.children ? (
    <li className={["expandable", expanded ? "expanded" : ""].join(" ")}>
      <span onClick={() => setExpanded(!expanded)}>{item.label}</span>
      <div ref={listRef}>
        <List list={item.children} />
      </div>
    </li>
  ) : (
    <li>{item.label}</li>
  );
};

ReactDOM.createRoot(root).render(<App />);
