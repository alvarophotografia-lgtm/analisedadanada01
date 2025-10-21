import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, mimeType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Extracting numbers from image using Lovable AI...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extraia todos os números desta imagem de resultados da roleta. Retorne APENAS os números separados por espaços, na ordem exata em que aparecem (esquerda para direita, cima para baixo). Inclua apenas números entre 0-36. Não inclua nenhum outro texto, explicação ou formatação. Se não encontrar números válidos de roleta (0-36), retorne 'NENHUM_NUMERO'."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${imageData}`
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API Error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Muitas requisições. Tente novamente em alguns segundos.');
      }
      if (response.status === 402) {
        throw new Error('Limite de uso atingido. Verifique sua conta Lovable.');
      }
      
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || "";
    
    console.log('AI Response:', extractedText);

    if (extractedText.trim() === 'NENHUM_NUMERO') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Nenhum número válido de roleta encontrado na imagem' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const numbers = extractedText.trim()
      .split(/\s+/)
      .map((n: string) => parseInt(n))
      .filter((n: number) => !isNaN(n) && n >= 0 && n <= 36);

    if (numbers.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Nenhum número válido (0-36) encontrado na imagem' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Extracted numbers:', numbers);

    return new Response(JSON.stringify({ 
      success: true, 
      numbers 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-numbers-from-image function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});