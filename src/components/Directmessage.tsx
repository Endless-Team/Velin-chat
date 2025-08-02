function DirectmessageComp() {
  return (
    <>
      <div
        className="custom-border vh-100"
      >
        <button
          className="btn"
          onClick={() => {
            window.electronAPI.invoke("user:getAll").then((users) => {
              console.log(users); // mostra tutti gli utenti
            });
          }}
        >
          Test
        </button>
      </div>
    </>
  );
}

export default DirectmessageComp;
