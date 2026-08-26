const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: corsHeaders
  });
}

export default {
  async fetch(request, env) {

    // ─────────────────────────────
    // CORS
    // ─────────────────────────────

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }


    // ─────────────────────────────
    // METHOD CHECK
    // ─────────────────────────────

    if (request.method !== "POST") {
      return json(
        {
          success: false,
          error: "method_not_allowed"
        },
        405
      );
    }


    // ─────────────────────────────
    // CHAT
    // ─────────────────────────────

    try {

      const body =
        await request.json();


      // Vérification du message

      if (
        !body.message ||
        typeof body.message !== "string"
      ) {
        return json(
          {
            success: false,
            error: "message_required"
          },
          400
        );
      }


      // Historique de conversation

      const history =
        Array.isArray(body.history)
          ? body.history
          : [];


      // ─────────────────────────────
      // REQUÊTE INTERNE VERS BERTHO AI
      // ─────────────────────────────

      const aiRequest =
        new Request(
          "https://bertho-ai.internal/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "Authorization":
                `Bearer ${env.BERTHO_AI_SECRET}`
            },

            body: JSON.stringify({

  product:
    typeof body.product === "string"
      ? body.product
      : "unknown",

  context:
    body.context &&
    typeof body.context === "object"
      ? body.context
      : {
          product:
            typeof body.product === "string"
              ? body.product
              : "ecosystem",

          area: "ai",

          page: "lab",

          source: "bertho-ai-test",

          language: "fr"
        },

  message:
    body.message,

  history

})
          }
        );


      // ─────────────────────────────
      // SERVICE BINDING
      // ─────────────────────────────

      const response =
        await env.BERTHO_AI.fetch(
          aiRequest
        );


      // ─────────────────────────────
      // RÉCUPÉRATION DE LA RÉPONSE
      // ─────────────────────────────

      const text =
        await response.text();


      // ─────────────────────────────
      // RETOUR AU LAB
      // ─────────────────────────────

      return new Response(
        text,
        {
          status: response.status,

          headers: {
            ...corsHeaders,

            "Content-Type":
              response.headers.get(
                "Content-Type"
              ) ||
              "application/json"
          }
        }
      );


    } catch (error) {

      console.error(
        "BERTHO AI TEST ERROR:",
        error
      );


      return json(
        {
          success: false,
          error:
            error.message ||
            "gateway_error"
        },
        500
      );
    }
  }
};