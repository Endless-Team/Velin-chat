function Directmessage() {
  return (
    <>
      <button
      className="btn"
        onClick={() => {
          window.electronAPI.invoke("user:getAll").then((users) => {
            console.log(users); // mostra tutti gli utenti
          });
        }}
      >clicca qua gai</button>
    </>
  );
}

export default Directmessage;
