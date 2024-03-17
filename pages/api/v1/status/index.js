function status(request, response) {
  response.status(200).json({ chave: "Bem loco!" });
}

export default status;
