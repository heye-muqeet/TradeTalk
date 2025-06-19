import axios from "axios";

const OPENAI_API_KEY = "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";

export const getOpenAIResponse = async (input: string, context: string): Promise<string> => {
    const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: context },
                { role: "user", content: input },
            ],
            max_tokens: 100,
        },
        { headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" } }
    );
    return response.data.choices[0].message.content.trim();
};
