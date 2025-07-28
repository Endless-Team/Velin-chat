function Topbar() {
  return (
    <>
      <nav className="navbar bg-custom-dark drag">
        <div className="container-fluid">
          <span className="navbar-brand text-white ms-4">Dove</span>
          <div className="d-flex gap-2">
            <button
              className="btn text-white border-0 no-drag custom-button"
              onClick={() => window.electronAPI.invoke("window:minimize")}
            >
              <i className="bi bi-dash-lg"></i>
            </button>
            <button
              className="btn text-white border-0 no-drag custom-button"
              onClick={() => window.electronAPI.invoke("window:maximize")}
            >
              <i className="bi bi-square"></i>
            </button>
            <button
              className="btn text-white border-0 no-drag custom-button"
              onClick={() => window.electronAPI.invoke("window:close")}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      </nav>
      <style>
        {`
          .custom-button:hover {
            color: rgb(255, 255, 0) !important;
            background-color: rgba(255, 255, 0, 0.1) !important;
          }
        `}
      </style>
    </>
  );
}

export default Topbar;
