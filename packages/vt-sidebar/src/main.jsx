const App = () => {
  const [isOpen, setIsOpen] = React.useState(true);

  const toggle = React.useCallback(() => {
    document.startViewTransition(() => {
      setIsOpen(!isOpen);
    });
  }, [isOpen]);

  return (
    <main className={isOpen ? "open" : "closed"}>
      <div className="sidebar">Sidebar</div>
      <div className="content">
        <button onClick={toggle}>Toggle</button>
        <iframe src="https://affine.fail" border="0"></iframe>
      </div>
    </main>
  );
};

ReactDOM.createRoot(root).render(<App />);
