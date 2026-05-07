export default async function handler(req, res) {
  try {
    const body = req.body || {};

    const amount = Number(body.amount);

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Valor não inicializado ou inválido" });
    }

    const response = await fetch(
      "https://multi.paradisepags.com/api/v1/transaction.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.PARADISE_API_KEY || "sk_ab34b5dbce3ccce3e33070e6dcab26344a4c67b88706d5164ec01fb08eeaabac"
        },
        body: JSON.stringify({
          amount: amount, // O valor já vem em centavos do frontend
          description: body.description || "Pagamento via Pix",
          reference: body.reference || `REF-${Date.now()}`,
          source: "api_externa", // Importante para permitir criar PIX sem cadastrar produto na plataforma
          customer: {
            name: body.customer?.name || "Cliente Anônimo",
            email: body.customer?.email || "email@cliente.com",
            document: body.customer?.document || "00000000000",
            phone: body.customer?.phone || "11999999999"
          }
        })
      }
    );

    const data = await response.json();

    // A API da Paradise retorna status: "success" quando a geração funciona
    if (data.status !== "success" && !data.qr_code) {
      return res.status(400).json({ error: "Erro ao gerar PIX", details: data });
    }

    // Retorno formatado para o seu hook use-pix-payment ler corretamente
    return res.json({
      pixCode: data.qr_code,              // Código PIX Copia e Cola
      qr_code: data.qr_code_base64,       // Imagem Base64
      transactionId: data.transaction_id, // ID interno usado para checar o status depois
      amount: data.amount
    });

  } catch (err) {
    return res.status(500).json({
      error: "Erro interno no servidor",
      details: err.message
    });
  }
}
