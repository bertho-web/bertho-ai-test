/**
 * bertho-ai-test/src/index.js
 * Passerelle de Laboratoire de Test Multi-Workers (0 Émoji).
 */

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
    const url = new URL(request.url);
    
    // ─────────────────────────────
    // 1. CORS PREFLIGHT
    // ─────────────────────────────
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    
    // ─────────────────────────────
    // 2. METHOD CHECK
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
    // 3. TRAITEMENT DES TESTS
    // ─────────────────────────────
    try {
      const body = await request.json();
      
      // ============================================================
      // 🎨 AIGUILLAGE VERS LE WORKER D'IMAGE FLUX.1 (SI DEMANDE IMAGE)
      // ============================================================
      if (url.pathname === "/image" || body.type === "image") {
        const imagePrompt = body.prompt || body.message;
        
        if (!imagePrompt || typeof imagePrompt !== "string" || !imagePrompt.trim()) {
          return json({ success: false, error: "prompt_required" }, 400);
        }
        
        const imageReq = new Request("https://bertho-ai-image.internal/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: imagePrompt.trim(),
            steps: body.steps || 4
          })
        });
        
        const imageResponse = await env.BERTHO_IMAGE_AI.fetch(imageReq);
        const imageResultText = await imageResponse.text();
        
        return new Response(imageResultText, {
          status: imageResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      
      // ============================================================
      // 💬 AIGUILLAGE VERS LE CERVEAU CENTRAL TEXTE / VISION
      // ============================================================
      if (!body.message || typeof body.message !== "string" || !body.message.trim()) {
        return json(
          {
            success: false,
            error: "message_required"
          },
          400
        );
      }
      
      const history = Array.isArray(body.history) ? body.history : [];
      
      const aiRequest = new Request("https://bertho-ai.internal/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.BERTHO_AI_SECRET}`
        },
        body: JSON.stringify({
          product: typeof body.product === "string" ? body.product : "unknown",
          context: body.context && typeof body.context === "object" ?
            body.context :
            {
              product: typeof body.product === "string" ? body.product : "ecosystem",
              area: "ai",
              page: "lab",
              source: "bertho-ai-test",
              language: "fr"
            },
          message: body.message.trim(),
          history
        })
      });
      
      const response = await env.BERTHO_AI.fetch(aiRequest);
      const text = await response.text();
      
      return new Response(text, {
        status: response.status,
        headers: {
          ...corsHeaders,
          "Content-Type": response.headers.get("Content-Type") || "application/json"
        }
      });
      
    } catch (error) {
      console.error("BERTHO AI TEST ERROR:", error);
      return json(
        {
          success: false,
          error: error.message || "gateway_error"
        },
        500
      );
    }
  }
};