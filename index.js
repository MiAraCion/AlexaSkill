const express = require("express");
const ngrok = require("ngrok");
const bodyParser = require("body-parser");
const { SkillBuilders } = require("ask-sdk-core");

const app = express();
const PORT = 3000;

// Middleware para analizar JSON
app.use(bodyParser.json());

// Configurar el Skill de Alexa
const skill = SkillBuilders.custom()
  .addRequestHandlers({
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === "LaunchRequest";
    },
    handle(handlerInput) {
      return handlerInput.responseBuilder
        .speak("Hola, bienvenido a mi primera Skill de Alexa.")
        .getResponse();
    },
  })
  .create(); // Usar create() en lugar de lambda()

// Endpoint para recibir solicitudes de Alexa
app.post("/", async (req, res) => {
  try {
    const response = await skill.invoke(req.body); // Usa invoke() en lugar de lambda()
    res.json(response);
  } catch (error) {
    console.error("Error procesando la solicitud:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// Iniciar el servidor y exponer con ngrok
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);

  // Iniciar ngrok
  const url = await ngrok.connect(PORT);
  console.log(`Servidor público en: ${url}`);
});
