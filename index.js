const express = require("express");
const ngrok = require("ngrok");
const bodyParser = require("body-parser");
const { SkillBuilders } = require("ask-sdk-core");

const app = express();
const PORT = 9000;


app.use(bodyParser.json());


const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Hola, esta es mi skill de prueba, pideme saludar a alguien.")
      .reprompt("¿A quién quieres que salude?")
      .getResponse();
  },
};


const SaludoIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "SaludoIntent"
    );
  },
  handle(handlerInput) {
    
    const nombre = handlerInput.requestEnvelope.request.intent.slots.nombre.value || "amigo";
    
    const speechText = `Hola, ${nombre}. ¡Espero que tengas un gran día!`;

    return handlerInput.responseBuilder.speak(speechText).getResponse();
  },
};


const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Error manejado: ${error.message}`);
    return handlerInput.responseBuilder
      .speak("Lo siento, hubo un problema procesando tu solicitud.")
      .getResponse();
  },
};


const skill = SkillBuilders.custom()
  .addRequestHandlers(LaunchRequestHandler, SaludoIntentHandler)
  .addErrorHandlers(ErrorHandler)
  .create();


app.post("/", async (req, res) => {
  try {
    const response = await skill.invoke(req.body);
    res.json(response);
  } catch (error) {
    console.error("Error procesando la solicitud:", error);
    res.status(500).send("Error interno del servidor");
  }
});


app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);

  try {
    const url = await ngrok.connect(PORT);
    console.log(`Servidor público en: ${url}`);
  } catch (error) {
    console.error("Error iniciando ngrok:", error);
  }
});
