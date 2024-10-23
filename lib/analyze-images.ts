export async function analyzeImages(images: string[]): Promise<string> {
    if (images.length === 0) return "";

    try {
        const imagePrompts = images.map(url => ({
            type: "image_url",
            image_url: { url }
        }));

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Describe what you see in these images concisely but comprehensively."
                            },
                            ...imagePrompts
                        ]
                    }
                ],
                model: "llama-3.2-11b-vision-preview",
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error analyzing images:', error);
        return "Error analyzing images.";
    }
}
