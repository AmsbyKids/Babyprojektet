const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const { createAssistant } = require("./openai.service");

(async () => {
  const assistant = await createAssistant(openai);

  app.get("/", (req, res) => {
    res.send("Hello, the app is running!");
  });

  app.get("/start", async (req, res) => {
    const thread = await openai.beta.threads.create();
    return res.json({ thread_id: thread.id });
  });

  app.post("/chat", async (req, res) => {
    const assistantId = assistant.id;
    const threadId = req.body.thread_id;
    const message = req.body.message;
    if (!threadId) {
      return res.status(400).json({ error: "Missing thread_id" });
    }
    console.log(`Received message: ${message} for thread ID: ${threadId}`);
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });
    const messages = await openai.beta.threads.messages.list(run.thread_id);
    const response = messages.data[0].content[0].text.value;
    return res.json({ response });
  });

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();

