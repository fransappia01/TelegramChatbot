const TelegramBot = require('node-telegram-bot-api');
const { GetStatusByAppointmentNumber } = require('./Functions/functions');
const Taller = require('./Models/Talleres');

// replace the value below with the Telegram token you receive from @BotFather
const token = '6479922170:AAE7QzyHVLzH3l5i6Afpr114M-OGJZhESxo';

// Objeto para mantener el estado de la conversación por número de teléfono
const conversationState = {};

// Lista de tallers

const bustosFierroTaller = new Taller('Bustos Fierro Taller', { latitude: -31.3972250, longitude: -64.2048260 });
const suspensionMartinTaller = new Taller('Suspension Martin', { latitude: -30.785494, longitude: -64.2048260 });

const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]" 
bot.onText(/\/echo (.+)/, (msg, match) => {
//   'msg' is the received Message from Telegram
//   'match' is the result of executing the regexp above on the text content
//   of the message

   const chatId = msg.chat.id;
   const resp = match[1]; // the captured "whatever"

//   send back the matched "whatever" to the chat
   bot.sendMessage(chatId, resp);
 });



// Listen for any kind of message. There are different kinds of messages.
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  console.log(msg)

    const userMessage = msg.text;

    let userState = conversationState[chatId] || 'start';
    let currentTaller;

    if (userState === 'start') {
      const options = {
        reply_markup: {
          keyboard: [
            [{ text: '1. Bustos Fierro Taller' }],
            [{ text: '2. Suspension Martin' }],
            [{ text: '3. Salir' }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      };
      bot.sendMessage(chatId, 'Bienvenido a Tune Up! Elija el taller con el que quiera consultar sus datos: ', options);
      conversationState[chatId] = 'waitingOption';

    } else if (userState === 'waitingOption') {
      switch (userMessage) {
        case '1. Bustos Fierro Taller':
          bot.sendMessage(chatId, 'Se comunicó con Bustos Fierro Taller, ¿qué operación desea realizar?\n1. Consultar Ubicación\n2. Ver estado del turno\n3. Salir');
          currentTaller = bustosFierroTaller;
          conversationState[chatId] = 'bustosFierro';
          break;
        case '2. Suspension Martin':
          bot.sendMessage(chatId, 'Se comunicó con Suspension Martin, ¿qué operación desea realizar?\n1. Cancelar un turno\n2. Ver estado del turno\n3. Salir');
          currentTaller = suspensionMartinTaller;
          conversationState[chatId] = 'suspensionMartin';
          break;
        case '3':
          bot.sendMessage(chatId, '¡Hasta la próxima! ¡Gracias por usar Tune Up!');
          delete conversationState[chatId];
          break;
        default:
          bot.sendMessage(chatId, 'Opción no válida. Por favor, seleccione una opción válida.');
      }
    } else if (userState === 'bustosFierro') {          
      switch(userMessage) {
        case '1':
        bot.sendMessage(chatId, 'Ha seleccionado la opción para Consultar Ubicación! A continuación, se muestra en el mapa');
        // Puedes enviar la ubicación como una respuesta
        bot.sendLocation(chatId, -31.3972250, -64.2048260, { title: 'Bustos Fierro Taller' });
        break;
        case '2': 
        bot.sendMessage(chatId, 'Ha seleccionado la opción para Ver el estado de un turno! A continuación, ingrese su numero de turno');
        conversationState[chatId] = 'verEstadoTurno';

          if (conversationState[chatId] === 'verEstadoTurno' ) {

            bot.on('message', async (msg) => {
            const userAppointment = msg.text;
            //console.log(userAppointment, "turno");

            const appointment_status = await GetStatusByAppointmentNumber(userAppointment);

            console.log(appointment_status);

            if (appointment_status) {
                await bot.sendMessage(chatId, `Aguanta un momento por favor...`);

                await bot.sendMessage(chatId, `El estado de tu turno es: ${appointment_status}`);
                await bot.sendMessage(chatId, '¿Desea realizar otra acción?\n1. Volver al menú principal\n2. Finalizar conversación');

                conversationState[chatId] = 'VolverOFInalizar';
              } else {
                await bot.sendMessage(chatId, 'El numero de turno no se encuentra registrado. Por favor ingrese un numero de turno válido.');
                //askForNextAction(chatId, 'bustosFierro');
              }
             
                if (conversationState[chatId]  === 'VolverOFInalizar'){
                
                  const userChoice = msg.text;

                    switch(userChoice) {
                      case '1':
                        await bot.sendMessage(chatId, 'Volviste al menu');
                        delete conversationState[chatId];
                        break;
                      case '2':
                        await bot.sendMessage(chatId, 'Saliste');
                        delete conversationState[chatId];
                        break;
                    }
                  
                }
                
            });
                      
        break;
          }
        case '3':
        bot.sendMessage(chatId, 'Hasta la próxima!');
        delete conversationState[chatId];
        break;
        default:
        bot.sendMessage(chatId, 'Opción no válida. Por favor, seleccione una opción válida.');
        break;
      }
    } else if (userState === 'suspensionMartin') {
      switch(userMessage){
        case '1':
        bot.sendMessage(chatId, 'Ha seleccionado la opción para Consultar Ubicación! A continuación, se muestra en el mapa');
        // Puedes enviar la ubicación como una respuesta
        bot.sendLocation(chatId, -30.785494, -64.2048260, { title: 'Suspensión Martin' });
        break;
        case '2':
        bot.sendMessage(chatId, 'Ha seleccionado la opción para Ver el estado de un turno! A continuación, ingrese su numero de turno');
        conversationState[chatId] = 'verEstadoTurno';

        bot.on('message', async (msg) => {

          const userAppointment = msg.text;
          console.log(userAppointment, "turno");

          const appointment_status = await GetStatusByAppointmentNumber(userAppointment);

          if (appointment_status) {
              await bot.sendMessage(msg.from, `El estado de tu turno es: ${appointment_status}`);
            } else {
              await bot.sendMessage(msg.from, 'El numero de turno no se encuentra registrado.');
            }
      
          delete conversationState[chatId];
              
          });
        break;
        case '3':
        bot.sendMessage(chatId, 'Hasta la próxima!');
        delete conversationState[chatId];
        break;
        default:
        bot.sendMessage(chatId, 'Opción no válida. Por favor, seleccione una opción válida.');
        break;
      }
    }
});

