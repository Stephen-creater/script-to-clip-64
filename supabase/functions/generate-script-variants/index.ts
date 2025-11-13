import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { baseScript, count = 5 } = await req.json();

    if (!baseScript || typeof baseScript !== "string") {
      throw new Error("baseScript is required and must be a string");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating ${count} script variants for: ${baseScript.substring(0, 50)}...`);

    const systemPrompt = `你是一个专业的文案创作助手。你的任务是根据用户提供的原始文案，生成多个不同表达方式的变体文案。

要求：
1. 保持原文案的核心意思和信息点
2. 使用不同的表达方式、句式结构
3. 可以调整语气、风格（正式/轻松/幽默/专业等）
4. 长度应与原文案相近
5. 每个变体都应该独立且完整
6. 返回纯文本数组，不要包含任何标记或序号

请生成 ${count} 个高质量的文案变体。`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `原始文案：\n${baseScript}\n\n请生成 ${count} 个不同表达方式的变体。` },
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("AI服务请求过于频繁，请稍后再试");
      }
      if (response.status === 402) {
        throw new Error("AI服务额度不足，请充值后继续使用");
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI服务调用失败");
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error("AI未返回有效内容");
    }

    console.log("AI generated text:", generatedText);

    // 解析AI返回的文本，尝试分割成多个变体
    let variants: string[] = [];
    
    // 尝试按行分割（AI可能返回带序号的列表）
    const lines = generatedText.split("\n").filter((line: string) => line.trim());
    
    if (lines.length >= count) {
      // 移除可能的序号前缀
      variants = lines.slice(0, count).map((line: string) => 
        line.replace(/^[\d]+[、.。]\s*/, "").trim()
      );
    } else {
      // 如果没有足够的行，尝试按句号分割
      const sentences = generatedText.split(/[。！？]/).filter((s: string) => s.trim());
      if (sentences.length >= count) {
        variants = sentences.slice(0, count).map((s: string) => s.trim());
      } else {
        // 如果还是不够，直接返回整段文本作为一个变体
        variants = [generatedText.trim()];
      }
    }

    // 过滤掉过短的变体
    variants = variants.filter((v: string) => v.length > 10);

    if (variants.length === 0) {
      throw new Error("AI生成的内容无法解析，请重试");
    }

    console.log(`Successfully generated ${variants.length} variants`);

    return new Response(
      JSON.stringify({ variants }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate-script-variants:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        variants: []
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
