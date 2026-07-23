export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Método não permitido", { status: 405 });
    }

    try {
      const { question, plan } = await request.json();

      // Validação simples para plano Free
      if (plan === "free" && question.length > 200) {
        return new Response(
          JSON.stringify({ error: "Plano Free permite perguntas curtas." }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      // Chamada à OpenAI
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: question }]
        })
      });

      const data = await response.json();

      return new Response(
        JSON.stringify({ answer: data.choices[0].message.content }),
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Erro interno no Worker." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
