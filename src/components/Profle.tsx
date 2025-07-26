function Profile() {
  return (
    <>
      <div
        className="position-fixed bottom-0 start-0 m-3 bg-custom-dark rounded"
        style={{ width: 200, height: 50 }}
      >
        <button
          onClick={() => {
            window.electronAPI.send("user:logout");
          }}
          className="btn btn-primary"
        >
          Bottone
        </button>
      </div>
    </>
  );
}

export default Profile;
