function Topbar() {
  return (
    <nav className="navbar bg-dark">
      <div className="container-fluid">
        <span className="navbar-brand text-white">
          Navbar
        </span>
        <div className="d-flex gap-2">
          <button className="btn btn-secondary border-0">
            <i className="bi bi-dash-lg"></i>
          </button>
          <button className="btn btn-secondary border-0"></button>
          <button className="btn btn-danger border-0">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Topbar;
