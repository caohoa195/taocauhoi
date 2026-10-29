import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(express.json({ limit: '50mb' }));

    // Gemini AI client helper
    const getAI = () => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY chưa được cấu hình. Vui lòng kiểm tra lại API key trong Settings > Secrets.");
        }
        return new GoogleGenAI({
            apiKey,
            httpOptions: {
                headers: {
                    'User-Agent': 'aistudio-build',
                }
            }
        });
    };

    // Health check for deployment
    app.get("/api/health", (req, res) => {
        res.json({ status: "ok" });
    });

    // API routes
    app.post("/api/generate-exam", async (req, res) => {
        try {
            const { parts } = req.body;
            const ai = getAI();
            
            const response = await ai.models.generateContent({ 
                model: "gemini-3.8-flash",
                contents: [{ role: "user", parts }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            questions: { type: Type.STRING },
                            answers: { type: Type.STRING }
                        },
                        required: ["questions", "answers"]
                    }
                }
            });

            if (!response.text) {
                throw new Error("AI không phản hồi nội dung đề thi.");
            }

            const cleanText = response.text.replace(/```json\n?|\n?```/g, '').trim();
            res.json(JSON.parse(cleanText));
        } catch (error: any) {
            console.error("Error generating exam:", error);
            let message = error.message || "Lỗi không xác định";
            if (message.includes("API key not valid") || message.includes("API_KEY_INVALID")) {
                message = "API key không hợp lệ hoặc đã hết hạn. Vui lòng chọn hoặc cấu hình lại API key.";
            }
            res.status(500).json({ error: message });
        }
    });

    app.post("/api/grade-submission", async (req, res) => {
        try {
            const { parts } = req.body;
            const ai = getAI();
            
            const response = await ai.models.generateContent({ 
                model: "gemini-3.8-flash",
                contents: [{ role: "user", parts }],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            feedback: { type: Type.STRING },
                            score: { type: Type.STRING }
                        },
                        required: ["feedback", "score"]
                    }
                }
            });

            if (!response.text) {
                throw new Error("AI không phản hồi kết quả chấm thi.");
            }

            const cleanText = response.text.replace(/```json\n?|\n?```/g, '').trim();
            res.json(JSON.parse(cleanText));
        } catch (error: any) {
            console.error("Error grading submission:", error);
            let message = error.message || "Lỗi không xác định";
            if (message.includes("API key not valid") || message.includes("API_KEY_INVALID")) {
                message = "API key không hợp lệ hoặc đã hết hạn. Vui lòng chọn hoặc cấu hình lại API key.";
            }
            res.status(500).json({ error: message });
        }
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
        const { createServer } = await import("vite");
        const vite = await createServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer().catch(console.error);
