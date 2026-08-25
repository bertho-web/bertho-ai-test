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

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (request.method !== "POST") {
      return json({
        success: false,
        error: "method_not_allowed"
      }, 405);
    }

    try {
      const body = await request.json();

      if (
        !body.message ||
        typeof body.message !== "string"
      ) {
        return json({
          success: false,
          error: "message_required"
        }, 400);
      }

      const history =
        Array.isArray(body.history)
          ? body.history
          : [];

      const response = await fetch(
        "https://bertho-ai.bertho.workers.dev/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Authorization":
              `Bearer ${env.BERTHO_AI_SECRET}`
          },

          body: JSON.stringify({
            message: body.message,
            history
          })
        }
      );

      const data = await response.json();

      return json(
        data,
        response.status
      );

    } catch (error) {
      console.error(
        "AI TEST ERROR:",
        error
      );

      return json({
        success: false,
        error:
          error.message ||
          "gateway_error"
      }, 500);
    }
  }
};