const fs = require("fs");

const createAssistant = async (openai) => {
  const assistantFilePath = "assistant.json";
  if (!fs.existsSync(assistantFilePath)) {
    const file = await openai.files.create({
      file: fs.createReadStream("kunskapgbt.docx"),
      purpose: "assistants",
    });
    let vectorStore = await openai.beta.vectorStores.create({
      name: "Chat Demo",
      file_ids: [file.id],
    });
    const assistant = await openai.beta.assistants.create({
      name: "BabyK",
      instructions: `BabyKassans AI kombinerar djup kunskap inom kodning och föräldrapenning...`,
      tools: [{ type: "file_search" }],
      tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
      model: "gpt-4",
    });
    fs.writeFileSync(assistantFilePath, JSON.stringify(assistant));
    return assistant;
  } else {
    const assistant = JSON.parse(fs.readFileSync(assistantFilePath));
    return assistant;
  }
};

module.exports = { createAssistant };

