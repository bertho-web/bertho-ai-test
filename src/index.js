/**
 * bertho-ai-test/src/index.js
 * Passerelle Universelle du Laboratoire de Test Multi-Microservices (0 Émoji).
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
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
    // 2. DIAGNOSTIC RÉSEAU (HEALTH)
    // ─────────────────────────────
    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        service: "bertho-ai-test",
        status: "online",
        environment: env.ENVIRONMENT || "test",
        connectedServices: [
          "BERTHO_AI (Cerveau 8 Modèles)",
          "BERTHO_IMAGE_AI (FLUX.1-Schnell)",
          "BERTHO_SEARCH_AI (Recherche Web Live)",
          "BERTHO_SANDBOX_AI (Exécution Code V8)"
        ]
      });
    }
    
    // ─────────────────────────────
    // 3. VÉRIFICATION MÉTHODE
    // ─────────────────────────────
    if (request.method !== "POST") {
      return json({ success: false, error: "method_not_allowed" }, 405);
    }
    
    // ─────────────────────────────
    // 4. ROUTAGE DES MICROSERVICES
    // ─────────────────────────────
    try {
      const body = await request.json();
      
      // ============================================================
      // A. AIGUILLAGE STUDIO GRAPHIQUE FLUX.1 (Image HD)
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
    model: body.model || "flux2",
    prompt: imagePrompt.trim(),
    steps: body.steps || 4
  })
});
        
        const imageResponse = await env.BERTHO_IMAGE_AI.fetch(imageReq);
        const imageResultText = await imageResponse.text();
        
        return new Response(imageResultText, {
          status: imageResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // ============================================================
      // B. AIGUILLAGE RECHERCHE WEB & ACTUALITÉS EN DIRECT
      // ============================================================
      if (url.pathname === "/search" || body.type === "search") {
        const searchQuery = body.query || body.message || body.prompt;
        if (!searchQuery || typeof searchQuery !== "string" || !searchQuery.trim()) {
          return json({ success: false, error: "query_required" }, 400);
        }
        
        const searchReq = new Request("https://bertho-ai-search.internal/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery.trim() })
        });
        
        const searchResponse = await env.BERTHO_SEARCH_AI.fetch(searchReq);
        const searchResultText = await searchResponse.text();
        
        return new Response(searchResultText, {
          status: searchResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // ============================================================
      // C. AIGUILLAGE BAC À SABLE & EXÉCUTION DE CODE
      // ============================================================
      if (url.pathname === "/sandbox" || body.type === "sandbox" || body.type === "code") {
        const codeToExecute = body.code || body.script || body.message;
        if (!codeToExecute || typeof codeToExecute !== "string" || !codeToExecute.trim()) {
          return json({ success: false, error: "code_required" }, 400);
        }
        
        const sandboxReq = new Request("https://bertho-ai-sandbox.internal/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: codeToExecute.trim(),
            language: body.language || "javascript"
          })
        });
        
        const sandboxResponse = await env.BERTHO_SANDBOX_AI.fetch(sandboxReq);
        const sandboxResultText = await sandboxResponse.text();
        
        return new Response(sandboxResultText, {
          status: sandboxResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // ============================================================
      // D. AIGUILLAGE PAR DÉFAUT VERS LE CERVEAU CENTRAL (8 MODÈLES)
      // ============================================================
      if (!body.message || typeof body.message !== "string" || !body.message.trim()) {
        return json({ success: false, error: "message_required" }, 400);
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
          model: body.model || "turbo",
          image: body.image || null,
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
      console.error("[Bertho AI Lab Gateway Error]:", error);
      return json({
        success: false,
        error: error.message || "gateway_error"
      }, 500);
    }
  }
};