const { Agent } = require('https');
 
 // Funcion para traer politicas y privacidad de cada Taller por nombre de taller
 
 async function GetSMSByWorkshop(phone, workshopName) {
    // Configurar la URL de la API y los datos de la solicitud
    const url = 'https://tuneupapp.somee.com/api/Sms/GetSmsByWorkshop';
    const data = { phone, name: workshopName};
  
    try {
      // Importar dinámicamente el módulo node-fetch
      const { default: fetch } = await import('node-fetch');
  
      // Realizar la solicitud a la API utilizando fetch
      const rawResponse = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        agent: new Agent({ rejectUnauthorized: false })
      });
  
      // Obtener la respuesta del servidor en formato JSON
      const content = await rawResponse.json();
      return content;
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      throw new Error('Error al realizar la solicitud');
    }
  }
  
  
  // Funcion que trae el nombre del taller por numero de telefono asociado

 async function getWorkshopNameByPhone(phone) {
    // Configurar la URL de la API con los parámetros de consulta
    const url = `https://tuneupapp.somee.com/api/Sms/GetWorkshopNameByPhone?phone=${phone}`;
  
    try {
      // Importar dinámicamente el módulo node-fetch
      const { default: fetch } = await import('node-fetch');
  
      // Realizar la solicitud GET a la API utilizando fetch
      const rawResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain'
        },
        agent: new Agent({ rejectUnauthorized: false })
      });
  
      // Verificar el estado de la respuesta
      if (rawResponse.ok) {
        // Obtener el nombre del taller de la respuesta
        const workshopName = await rawResponse.text();
  
        console.log('Response from API:', workshopName); 
        return workshopName;
        
      } else {
        console.error('Error al realizar la solicitud. Estado:', rawResponse.status);
        return null;
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      return null;
    }
  }

// Funcion para traer el estado de un turno en base al numero de turno que le pasa el usuario

async function GetStatusByAppointmentNumber(appointment_number) {
  // Configurar la URL de la API con los parámetros de consulta
  const url = `https://tuneupapp.somee.com/api/Sms/GetStatusByAppointmentNumber?appointment_number=${appointment_number}`;

  try {
    // Importar dinámicamente el módulo node-fetch
    const { default: fetch } = await import('node-fetch');

    // Realizar la solicitud GET a la API utilizando fetch
    const rawResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain'
      },
      agent: new Agent({ rejectUnauthorized: false })
    });

    // Verificar el estado de la respuesta
    if (rawResponse.ok) {
      // Obtener el nombre del taller de la respuesta
      const status = await rawResponse.text();

      console.log('Response from API:', status); 
      return status;
      
    } else {
      console.error('Error al realizar la solicitud. Estado:', rawResponse.status);
      return null;
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
    return null;
  }
}


// Funcion que recibe numero del turno del usuario

async function GetAppointmentNumber(number) {

  bot.on('message', async (msg) => {

    number = msg.text;

  });

}



 // Funcion para traer coordenadas por nombre del Taller
 
 async function GetWorkshopsByLatLength(name) {
  // Configurar la URL de la API y los datos de la solicitud
  const url = `https://tuneupapp.somee.com/api/Taller/WorkshopsByLatLength?name=${name}`;


  try {
    // Importar dinámicamente el módulo node-fetch
    const { default: fetch } = await import('node-fetch');

    // Realizar la solicitud GET a la API utilizando fetch
    const rawResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      agent: new Agent({ rejectUnauthorized: false })
    });

    // Verificar el estado de la respuesta
    if (rawResponse.ok) {
      // Obtener el nombre del taller de la respuesta
      const coordenates = await rawResponse.json();

      console.log('Response from API:', coordenates); 
      return coordenates;
      
    } else {
      console.error('Error al realizar la solicitud. Estado:', rawResponse.status);
      return null;
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
    return null;
  }
}


 // Funcion para traer todos los talleres
 
 async function GetWorkshops() {
  // Configurar la URL de la API y los datos de la solicitud
  const url = `https://tuneupapp.somee.com/api/Taller/Workshops`;


  try {
    // Importar dinámicamente el módulo node-fetch
    const { default: fetch } = await import('node-fetch');

    // Realizar la solicitud GET a la API utilizando fetch
    const rawResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      agent: new Agent({ rejectUnauthorized: false })
    });

    // Verificar el estado de la respuesta
    if (rawResponse.ok) {
      // Obtener el nombre del taller de la respuesta
      const workshops = await rawResponse.json();

      console.log('Response from API:', workshops); 
      return workshops;
      
    } else {
      console.error('Error al realizar la solicitud. Estado:', rawResponse.status);
      return null;
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
    return null;
  }
}

// Funcion que valida el id del chat

async function GetChatIdById(chatId) {
  // Configurar la URL de la API y los datos de la solicitud
  const url = `https://www.tuneupapp.somee.com/api/ChatsData/GetChatIdById?chat_id=${chatId}`;


  try {
    // Importar dinámicamente el módulo node-fetch
    const { default: fetch } = await import('node-fetch');

    // Realizar la solicitud GET a la API utilizando fetch
    const rawResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      agent: new Agent({ rejectUnauthorized: false })
    });

    // Verificar el estado de la respuesta
    if (rawResponse.ok) {
      // Obtener el nombre del taller de la respuesta
      const chat = await rawResponse.json();

      return chat;
      
    } else {
      console.error('Error al realizar la solicitud. Estado:', rawResponse.status);
      return null;
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
    return null;
  }
}

// Función para validar mail del usuario
async function ValidateUserEmail(email) {
  const url = `https://www.tuneupapp.somee.com/api/ChatsData/ValidateUserEmail?email=${email}`;

  try {
    const { default: fetch } = await import('node-fetch');
    const rawResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      agent: new Agent({ rejectUnauthorized: false })
    });

    if (rawResponse.ok) {
      const result = await rawResponse.json();

      return result; 
    } else {
      console.error('Error al validar el correo electrónico. Estado:', rawResponse.status);
      return false;
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
    return null;
  }
}

// Función para crear el ChatId en la base de datos
async function CreateChatId(email, chatId) {
  const url = `https://www.tuneupapp.somee.com/api/ChatsData/CreateChatId?email=${email}&chatId=${chatId}`;

  try {
    const { default: fetch } = await import('node-fetch');
    const rawResponse = await fetch(url, {
      method: 'POST',  // Dependiendo de la API, podría ser necesario cambiar a POST
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      agent: new Agent({ rejectUnauthorized: false })
    });

    if (rawResponse.ok) {
      const result = await rawResponse.json();
      return result
    } else {
      console.error('Error al crear el ChatId. Estado:', rawResponse.status);
      return null;
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
    return null;
  }
}

// Funcion que trae el nombre del usuario a partir del chatId

async function GetUserNameByChatId(chatId) {
  // Configurar la URL de la API y los datos de la solicitud
  const url = `https://www.tuneupapp.somee.com/api/ChatsData/GetUserNameByChatId?chat_id=${chatId}`;


  try {
    // Importar dinámicamente el módulo node-fetch
    const { default: fetch } = await import('node-fetch');

    // Realizar la solicitud GET a la API utilizando fetch
    const rawResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      agent: new Agent({ rejectUnauthorized: false })
    });

    // Verificar el estado de la respuesta
    if (rawResponse.ok) {
      // Obtener el nombre del taller de la respuesta
      const chat = await rawResponse.json();

      return chat;
      
    } else {
      console.error('Error al realizar la solicitud. Estado:', rawResponse.status);
      return null;
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
    return null;
  }
}


// Funcion que trae la lista de talleres con los que interactuo el usuario

async function GetTalleresByInteraction(chatId) {
  // Configurar la URL de la API y los datos de la solicitud
  const url = `https://www.tuneupapp.somee.com/api/ChatsData/GetTalleresByInteraccion?chat_id=${chatId}`;


  try {
    // Importar dinámicamente el módulo node-fetch
    const { default: fetch } = await import('node-fetch');

    // Realizar la solicitud GET a la API utilizando fetch
    const rawResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      agent: new Agent({ rejectUnauthorized: false })
    });

    // Verificar el estado de la respuesta
    if (rawResponse.ok) {
      // Obtener el nombre del taller de la respuesta
      const workshops = await rawResponse.json();

      console.log('Response from API:', workshops); 
      return workshops;
      
    } else {
      console.error('Error al realizar la solicitud. Estado:', rawResponse.status);
      return null;
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
    return null;
  }
}


  module.exports = {
    GetSMSByWorkshop,
    getWorkshopNameByPhone,
    GetStatusByAppointmentNumber,
    GetAppointmentNumber,
    GetWorkshopsByLatLength,
    GetWorkshops,
    GetChatIdById,
    ValidateUserEmail,
    CreateChatId,
    GetUserNameByChatId,
    GetTalleresByInteraction
  };