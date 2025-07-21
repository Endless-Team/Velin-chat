function Serverbar() {
  const handleClick = (page: string) => {
    window.electronAPI.send("page:load", page);
  };

  return (
    <>
      <aside className="m-0 w-side vh-100 bg-custom-dark">
        <ul className="m-0 bg-custom-transparent list-unstyled d-flex flex-column align-items-center pt-2">
          <li>
            <img
              className="btn border-0 p-0 rounded bg-primary d-flex align-items-center justify-content-center server-ico"
              src="https://picsum.photos/40"
              alt="Random"
              onClick={() => handleClick("home")}
            />
          </li>
          <li>
            <img
              className="btn my-3 border-0 p-0 rounded bg-primary d-flex align-items-center justify-content-center server-ico"
              src="https://picsum.photos/40"
              alt="Random"
              onClick={() => handleClick("about")}
            />
          </li>
        </ul>
      </aside>
    </>
  );
}

export default Serverbar;
