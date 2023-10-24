const TelegramBot = require('node-telegram-bot-api');
const Taller = require('./Models/Talleres');
const { GetStatusByAppointmentNumber, GetWorkshopsByLatLength, GetWorkshops } = require('./Functions/functions');
require('dotenv').config();


// Token .env
const token = process.env.TELEGRAM_TOKEN;


// Objeto para mantener el estado de la conversación por número de teléfono
const conversationState = {};
let selectedValues = { selectedWorkshopName: null, currentTaller: null };
let numeroTallerMap = {};

let currentTaller;
let selectedWorkshopName;

// Lista de talleres
const bustosFierroTaller = new Taller('Bustos Fierro Taller','Horarios de atención al cliente:\n• Lunes a Viernes: de 8:00 a 13:00 hs. \n• Sábados: de 10:00 a  13:00 hs.');
const suspensionMartinTaller = new Taller('Suspension Martin','Horarios de atención al cliente:\n• Lunes a Viernes: de 8:00 a 17:00 hs. \n• Sábados: de 10:00 a  17:00 hs.');

const bot = new TelegramBot(token, { polling: true });

// Escucha cualquier tipo de mensaje
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  let userState = conversationState[chatId] || 'start';

  let workshops = []; 

  switch (userState) {
    case 'start':
      // Cuando el usuario inicia la conversación, obtén la lista de talleres y envíala enumerada
      GetWorkshops()
        .then(async (workshopsData) => {

          workshops = workshopsData; 
          if (workshops) {

            workshops.forEach((workshop, index) => {
              numeroTallerMap[index + 1] = workshop.name;
            });

            // workshops es un array con la lista de talleres
            let message = 'Bienvenido a Tune Up! Elija el taller con el que quiera consultar sus datos:\n';
            workshops.forEach((workshop, index) => {
              message += `${index + 1}. ${workshop.name}\n`;
            });
            message += `${workshops.length + 1}. Salir`;

            bot.sendMessage(chatId, message);
            conversationState[chatId] = 'waitingOption';
          } else {
            await bot.sendMessage(chatId, 'No se pudieron obtener la lista de talleres.');
          }
        })
        .catch((error) => {
          console.error('Error al obtener la lista de talleres:', error);
        });
      break;
    case 'waitingOption':
      if (userMessage) {
          selectedWorkshopName = numeroTallerMap[userMessage];
        if (selectedWorkshopName) {
          currentTaller = selectedWorkshopName;

          console.log("wo",selectedWorkshopName)
          //conversationState[chatId] = selectedWorkshopName;
          bot.sendMessage(chatId, `Se comunicó con ${selectedWorkshopName}, ¿qué operación desea realizar?\n1. Consultar Ubicación\n2. Ver estado del turno\n3. Consultar Horarios de atención al cliente \n4. Salir`);
          conversationState[chatId] = 'TallerOpciones';
          //selectedWorkshopName = numeroTallerMap[userMessage];

        } else {
          bot.sendMessage(chatId, 'Opción no válida. Por favor, seleccione una opción válida.');
        }
      } else {
        // Maneja otras acciones o mensajes
      }

      break;

      case 'TallerOpciones':
        switch (userMessage) {
          case '1':

            if (currentTaller){
            GetWorkshopsByLatLength(currentTaller)
            .then(async (coordenates) => {
              if (coordenates) {
            await bot.sendMessage(chatId, 'Ha seleccionado la opción para Consultar Ubicación! A continuación, se muestra en el mapa');
            await bot.sendLocation(chatId, coordenates.latitude, coordenates.length, { title: currentTaller});
            await bot.sendMessage(chatId, 'Desea realizar otra acción?\n1. Volver al menú principal\n2. Finalizar conversación.')
            conversationState[chatId] = 'decisionUsuario';
              }
              else{
                await bot.sendMessage(chatId, 'No se pudieron obtener las coordenadas del taller.');
                conversationState[chatId] = 'decisionUsuario';
              }          
              });
            }
            else{
              return "No llega el nombre del taller";
            }
            break;
          case '2':
            bot.sendMessage(chatId, 'Ha seleccionado la opción para Ver el estado de un turno! A continuación, ingrese su número de turno');
            conversationState[chatId] = 'verEstadoTurno';
            break;
          case '3':
            await bot.sendMessage(chatId, bustosFierroTaller.schedules);
            await bot.sendMessage(chatId, 'Desea realizar otra acción?\n1. Volver al menú principal\n2. Finalizar conversación.')
            conversationState[chatId] = 'decisionUsuario';
            break;
          case '4':
            bot.sendMessage(chatId, 'Hasta la próxima!');
            delete conversationState[chatId];
            break;
          default:
            bot.sendMessage(chatId, 'Opción no válida. Por favor, seleccione una opción válida.');
            break;
        }
        break;

      case 'verEstadoTurno':
        switch(userMessage){
          default:
          const number = msg.text;
          const appointmentStatus = await GetStatusByAppointmentNumber(number);

          if (appointmentStatus) {
            await bot.sendMessage(chatId, `El estado de tu turno es: ${appointmentStatus}`);
            await bot.sendMessage(chatId, 'Desea realizar otra acción?\n1. Volver al menú principal\n2. Finalizar conversación.')
            conversationState[chatId] = 'decisionUsuario';
          } else {
            await bot.sendMessage(chatId, 'El número de turno no se encuentra registrado o es inválido. Por favor, ingrese un numero de turno válido.');
          }
        }
        break;

      case 'decisionUsuario':
        switch (userMessage) {
          case '1':
            bot.sendMessage(chatId, 'Bienvenido de nuevo al menú principal! Elija el taller con el que quiera consultar sus datos:\n1. Bustos Fierro Taller\n2. Suspension Martin\n3. Salir');
            conversationState[chatId] = 'waitingOption';
            break;
          case '2':
            bot.sendMessage(chatId, 'Nos vemos la próxima! Para iniciar una nueva conversación, simplemente envíe un mensaje.');
            delete conversationState[chatId];
            break;
          default:
            bot.sendMessage(chatId, 'Opción no válida. Por favor, seleccione una opción válida.');
            break;
        }
        break;   
  }
  
  bot.on("polling_error", (msg) => console.log(msg));

});

process.on('uncaughtException', function (error) {
	console.log("\x1b[31m", "Exception: ", error, "\x1b[0m");
});