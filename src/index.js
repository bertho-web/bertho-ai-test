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
    // METHOD
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


      // Historique

      const history =
        Array.isArray(body.history)
          ? body.history
          : [];


      // ─────────────────────────
      // CONSTRUCTION DE LA REQUÊTE
      // ─────────────────────────

      const aiRequest =
        new Request(
          "https://bertho-ai.internal/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              message: body.message,
              history
            })
          }
        );


      // ─────────────────────────
      // SERVICE BINDING
      // ─────────────────────────

      const response =
        await env.BERTHO_AI.fetch(
          aiRequest
        );


      // Lire la réponse

      const text =
        await response.text();


      // ─────────────────────────
      // RÉPONSE
      // ─────────────────────────

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