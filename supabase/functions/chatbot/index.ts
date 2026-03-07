import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {

    const { message } = await req.json();

    const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful healthcare assistant. Answer common medical questions simply and safely. Always advise patients to consult a doctor for serious conditions.",
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const reply = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ reply }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {

    return new Response(
      JSON.stringify({
        reply: "Something went wrong. Please try again later.",
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  }
});