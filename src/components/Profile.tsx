function Profile({ user }: { user: any }) {
  return (
    <div
      className="position-fixed bottom-0 start-0 m-3 bg-custom-dark rounded d-flex align-items-center justify-content-between px-3 border border-white"
      style={{ width: 200, height: 50 }}
    >
      <p className="mb-0 text-white">{user.username}</p>
      <button
        onClick={() => {
          window.electronAPI.send("user:logout");
        }}
        className="btn rounded-circle bg-danger"
        style={{
          width: 40,
          height: 40,
          color: "white",
          border: "none",
        }}
      >
        <i className="bi bi-power"></i>
      </button>
    </div>
  );
}

export default Profile;
