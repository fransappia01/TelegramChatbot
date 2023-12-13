const TelegramBot = require('node-telegram-bot-api');
const Taller = require('./Models/Talleres');
const { GetStatusByAppointmentNumber, GetWorkshopsByLatLength, GetWorkshops, GetChatIdById, ValidateUserEmail, CreateChatId, GetUserNameByChatId } = require('./Functions/functions');
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
  console.log(chatId);

    //validar primer chat
  var validateFirstChat = await GetChatIdById(chatId);

  let userState = conversationState[chatId] || 'start';

  let workshops = []; 


  // 1.  Validacion de primer chat
  // Caso de uso de primer chat
  // usuario habla, bot responde "Bievenido..., solicita mail" , consume endpoint https://www.tuneupapp.somee.com/api/ChatsData/ValidateUserEmail?email=
  // si devuelve true la validacion, consumo este endpoint https://www.tuneupapp.somee.com/api/ChatsData/CreateChatId?email=&chatId=  POST
  // consumir endpoint de talleres asginados a ese usuario (revisar)
  // seguir el flujo comun del bot

  // caso de uso distinto de primer chat
  // traer el chat id, getChatid, siempre es true
  // consumir endpoint GetchatById
  // seguir con el flujo del bot

  switch (userState) {
    case 'start':

     // Ahora empieza con la validacion del mail en primer lugar

     if (validateFirstChat){
      //aca no es el primer chat

      var username = await GetUserNameByChatId(chatId);
      bot.sendMessage(chatId, `Bienvenido nuevamente a TuneUp, ${username}!`);

  
    }
    else{
      //aca seria primer chat
      bot.sendMessage(chatId, 'Bienvenido por primera vez a TuneUp!\n A continuación te solicitamos tu mail para verificar que estas registrado en nuestra aplicación.');
      conversationState[chatId] = 'waitingUserEmail';
      break;
    }
    

      // Cuando el usuario ya esta verificado, se obtiene la lista de talleres enumerada
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

    console.log(userMessage);

      if(userMessage === '17'){
        bot.sendMessage(chatId, 'Hasta la próxima!! Para comenzar otro chat envie nuevamente un mensaje.');
        delete conversationState[chatId];
      
      }else {
          selectedWorkshopName = numeroTallerMap[userMessage];


          // ESTO AHORA ES LUEGO DE LA VALIDACION CUANDO SELECCIONE UN TALLER
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

        case 'waitingUserEmail':
          switch(userMessage){
            default:
                //logica cuando usuario manda email
                const email = userMessage;

                const isEmailValid = await ValidateUserEmail(email);

                if (isEmailValid) {
                  // El correo electrónico es válido
                  bot.sendMessage(chatId, '¡Correo electrónico validado con éxito!');

                  const createdChatId = await CreateChatId(email, chatId);

                    if (createdChatId) {
                      bot.sendMessage(chatId, `ChatId guardado en la base de datos`);
                    } else {
                      bot.sendMessage(chatId, 'No se pudo crear el ChatId. Por favor, inténtalo de nuevo.');
                    }
                  conversationState[chatId] = 'start';  // Cambiar el estado para seguir con el flujo del bot

                } else {
                  // El correo electrónico no es válido
                  bot.sendMessage(chatId, 'El correo electrónico no es válido. Por favor, inténtalo de nuevo.');
                  conversationState[chatId] = 'waitingUserEmail'
                  
                }
            }
            break; 

      case 'decisionUsuario':
        switch (userMessage) {
          case '1':
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