const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const { SkillBuilders } = require("ask-sdk-core");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" } // Permite conexiones desde cualquier origen (AJUSTA SI ES NECESARIO)
});

const PORT = process.env.PORT || 3000; // Puerto dinámico para Render

app.use(bodyParser.json());

// 📌 Ruta de prueba para verificar que el servidor está activo
app.get("/", (req, res) => {
    res.send("Servidor Alexa WebSocket activo 🚀");
});

// 📌 WebSocket: Manejar conexiones de clientes (PC2, PC3, etc.)
io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    socket.on("disconnect", () => {
        console.log("Cliente desconectado:", socket.id);
    });
});

// 📌 Alexa: Manejo de solicitudes
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

        // 📢 WebSocket: Enviar mensaje a todos los clientes conectados
        io.emit("mensaje", `Alexa dice: Hola, ${nombre}`);

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

// 📌 Endpoint de Alexa
app.post("/", async (req, res) => {
    try {
        const response = await skill.invoke(req.body);
        res.json(response);
    } catch (error) {
        console.error("Error procesando la solicitud:", error);
        res.status(500).send("Error interno del servidor");
    }
});

// 📌 Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT} 🚀`);
});
