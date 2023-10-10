const TelegramBot = require('node-telegram-bot-api');
const Taller = require('./Models/Talleres');
const { GetStatusByAppointmentNumber } = require('./Functions/functions');

// Reemplaza el valor a continuación con el token de Telegram que obtuviste de @BotFather
const token = '6479922170:AAE7QzyHVLzH3l5i6Afpr114M-OGJZhESxo';

// Objeto para mantener el estado de la conversación por número de teléfono
const conversationState = {};

// Lista de talleres
const bustosFierroTaller = new Taller('Bustos Fierro Taller', { latitude: -31.3972250, longitude: -64.2048260 },'Horarios de atención al cliente:\n• Lunes a Viernes: de 8:00 a 13:00 hs. \n• Sábados: de 10:00 a  13:00 hs.');
const suspensionMartinTaller = new Taller('Suspension Martin', { latitude: -30.785494, longitude: -64.2048260 },'Horarios de atención al cliente:\n• Lunes a Viernes: de 8:00 a 17:00 hs. \n• Sábados: de 10:00 a  17:00 hs.');

const bot = new TelegramBot(token, { polling: true });

// Escucha cualquier tipo de mensaje
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  let userState = conversationState[chatId] || 'start';
  let currentTaller;

  switch (userState) {
    case 'start':
      bot.sendMessage(chatId, 'Bienvenido a Tune Up! Elija el taller con el que quiera consultar sus datos:\n1. Bustos Fierro Taller\n2. Suspension Martin\n3. Salir');
      conversationState[chatId] = 'waitingOption';
      break;
    case 'waitingOption':
      switch (userMessage) {
        case '1':
          bot.sendMessage(chatId, 'Se comunicó con Bustos Fierro Taller, ¿qué operación desea realizar?\n1. Consultar Ubicación\n2. Ver estado del turno\n3. Consultar Horarios de atención al cliente \n4. Salir');
          currentTaller = bustosFierroTaller;
          conversationState[chatId] = 'bustosFierro';
          break;
        case '2':
          bot.sendMessage(chatId, 'Se comunicó con Suspension Martin, ¿qué operación desea realizar?\n1. Consultar Ubicación\n2. Ver estado del turno\n3. Consultar Horarios de atención al cliente \n4. Salir');
          currentTaller = suspensionMartinTaller;
          conversationState[chatId] = 'suspensionMartin';
          break;
        case '3':
          bot.sendMessage(chatId, '¡Hasta la próxima! ¡Gracias por usar Tune Up!');
          delete conversationState[chatId];
          break;
        default:
          bot.sendMessage(chatId, 'Opción no válida. Por favor, seleccione una opción válida.');
          break;
      }
      break;
    case 'bustosFierro':
      switch (userMessage) {
        case '1':
          await bot.sendMessage(chatId, 'Ha seleccionado la opción para Consultar Ubicación! A continuación, se muestra en el mapa');
          await bot.sendLocation(chatId, bustosFierroTaller.location.latitude, bustosFierroTaller.location.longitude, { title: bustosFierroTaller.name });
          await bot.sendMessage(chatId, 'Desea realizar otra acción?\n1. Volver al menú principal\n2. Finalizar conversación.')
          conversationState[chatId] = 'decisionUsuario';
          break;
        case '2':
          bot.sendMessage(chatId, 'Ha seleccionado la opción para Ver el estado de un turno! A continuación, ingrese su número de turno');
          conversationState[chatId] = 'verEstadoTurno';
          break;
        case '3':
          await bot.sendMessage(chatId, suspensionMartinTaller.schedules);
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

      case 'suspensionMartin':
        switch (userMessage) {
          case '1':
            await bot.sendMessage(chatId, 'Ha seleccionado la opción para Consultar Ubicación! A continuación, se muestra en el mapa');
            await bot.sendLocation(chatId, suspensionMartinTaller.location.latitude, suspensionMartinTaller.location.longitude, { title: suspensionMartinTaller.name });
            await bot.sendMessage(chatId, 'Desea realizar otra acción?\n1. Volver al menú principal\n2. Finalizar conversación.')
            conversationState[chatId] = 'decisionUsuario';
            break;
          case '2':
            bot.sendMessage(chatId, 'Ha seleccionado la opción para Ver el estado de un turno! A continuación, ingrese su número de turno');
            conversationState[chatId] = 'verEstadoTurno';
            break;
          case '3':
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
});



