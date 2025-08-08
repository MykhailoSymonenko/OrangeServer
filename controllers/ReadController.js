import ModbusRTU from "modbus-serial";

import { exec } from "child_process";




// Асинхронна функція для зчитування даних з Modbus та публікації їх у MQTT
export const readModbusData = async function (
  client,
  mqttClient,
  map,
  writeMap,
  isAddMap,
  deviceID
) {
  const restartService = () => {
    exec("echo 'admin' | sudo -S systemctl restart my-app.service", (error, stdout, stderr) => {
      if (error) return console.error(`❌ Помилка виконання: ${error.message}`);
      if (stderr) return console.error(`⚠ Системне повідомлення: ${stderr}`);
      console.log(`✅ Сервіс перезапущено: ${stdout}`);
    });
  };

  // Вихід, якщо карти відсутні
  if (!map || !writeMap) {
    restartService();
    return;
  }

  const parsedData = writeMap ? map.concat(writeMap) : map;
  if (!(parsedData && typeof parsedData[Symbol.iterator] === 'function')) {
    restartService();
    return;
  }

  //const client = new ModbusRTU();
  try {
    //await client.connectTCP(IPaddress, { port });
    //client.setID(1);

    const publishMap = new Map();

    for (const item of parsedData) {
      const { address, size, type, name } = item;

      if (!address || !type || !name) continue;

      let response;
      switch (type) {
        case 'InputRegister':
          response = await client.readInputRegisters(address, size || 1);
          break;
        case 'DiscreteInput':
          response = await client.readDiscreteInputs(address, size || 1);
          break;
        case 'HoldingRegister':
          response = await client.readHoldingRegisters(address, size || 1);
          break;
        case 'Coil':
          response = await client.readCoils(address, size || 1);
          break;
        default:
          console.warn(`❓ Невідомий тип регістра: ${type}`);
          continue;
      }

      let result;
      if (size === 2) {
        result = modbusRegisterToFloat(response);
      } else {
        result = response.data?.[0];
      }

      if (typeof result === 'boolean') {
        publishMap.set(name, result.toString());
      } else {
        const formatted = isNaN(result) ? 'NaN' : parseFloat(result).toFixed(2);
        publishMap.set(name, formatted);
      }
    }

    const dataToPublish = Array.from(publishMap.entries())
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    publishMessage(isAddMap===0 ? `HP${deviceID}/all` : `HP${deviceID}/add`, dataToPublish, mqttClient);
  } catch (err) {
    console.error(`❌ Помилка Modbus: ${err.message}`);
  } finally {
    try {
      //await client.close();
    } catch (e) {
      console.warn('⚠ Не вдалося закрити зʼєднання Modbus:', e.message);
    }
  }
};


function modbusRegisterToFloat(registers) {

    // Перетворення регістрів у float
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);

    view.setUint16(0, registers.data[1], false); // Молодший регістр перший
    view.setUint16(2, registers.data[0], false);
    // view.setUint16(0, registers.data[0], false); // Молодший регістр перший
    // view.setUint16(2, registers.data[1], false);

    return view.getFloat32(0, false); // Перетворення в float
}



function publishMessage(topic, message, mqttClient) {
    //console.log(`Sending Topic: ${topic}, Message: ${message}`);
    mqttClient.publish(topic, message, { qos: 0, retain: false });
}
