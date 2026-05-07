export default async function handler(req, res) {
  const { transactionId } = req.query;

  if (!transactionId) {
    return res.status(400).json({ error: "transactionId não fornecido" });
  }

  try {
    const response = await fetch(
      `https://multi.paradisepags.com/api/v1/query.php?action=get_transaction&id=${transactionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.PARADISE_API_KEY || "sk_ab34b5dbce3ccce3e33070e6dcab26344a4c67b88706d5164ec01fb08eeaabac"
        }
      }
    );

    const data = await response.json();

    // Devolvemos o status (pending, approved, failed, etc) para o front
    res.json({
      status: data.status || "unknown"
    });

  } catch (err) {
    res.status(500).json({
      error: "Erro ao verificar status da transação"
    });
  }
}
