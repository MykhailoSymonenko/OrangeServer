import mqtt from "mqtt";
import ModbusRTU from "modbus-serial";
import { readModbusData } from './controllers/ReadController.js';
import { connectAndWriteArray } from './controllers/WriteController.js';
import { exec } from "child_process";
import os from "os";
import dotenv from "dotenv";
dotenv.config();
console.log("fifth test")
function getMacAddress() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
      for (const config of iface) {
        if (!config.internal && config.mac && config.mac !== '00:00:00:00:00:00') {
          return config.mac.replace(/:/g, '').toLowerCase();
        }
      }
    }
    return 'unknown';
}

function getTemperature() {
  return new Promise((resolve, reject) => {
    exec("cat /sys/class/thermal/thermal_zone0/temp", (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`);
        return;
      }
      const temp = parseInt(stdout) / 1000;
      resolve(temp);
    });
  });
}

var mqttClient;

const protocol = "mqtt";
const mqttHost = "3.70.239.113"
const port = "1883";
//const modbusReadIP = "10.10.10.254";
const modbusReadIP = process.env.IP_ADDRESS_CONTROLLER;
const modbusReadPort = parseInt(process.env.PORT_CONTROLLER, 10);
//const modbusReadPort = 502;
//const modbusWriteIP = "10.10.10.254";
//const modbusWritePort = 502;
const modbusWriteIP = modbusReadIP;
const modbusWritePort = modbusReadPort;


const clientModbus = new ModbusRTU();
await clientModbus.connectTCP(modbusReadIP, { port: modbusReadPort });
clientModbus.setID(1);

const deviceID = process.env.DEVICE_ID;

let map;
let writeMap;
let mapAdd;
let writeMapAdd;
let settingsData = {};

// Додаємо змінні для контролю читання
let isWriting = false;
let writeTimeout = null;
let readInterval = null;
let lastWriteTime = 0;

// Функція для читання конкретного регістру після запису
async function readSpecificRegister(registerInfo) {
    try {
        console.log(`📖 Миттєве читання регістру: ${registerInfo.name}`);
        
        // Створюємо тимчасовий масив з одним регістром для читання
        const tempMap = [registerInfo];
        if(writeMapAdd.includes(registerInfo)) await readModbusData(clientModbus, mqttClient, tempMap, [], 1, deviceID);
        else await readModbusData(clientModbus, mqttClient, tempMap, [], 0, deviceID);
        
        console.log(`✅ Миттєве читання завершено для: ${registerInfo.name}`);
    } catch (error) {
        console.error(`❌ Помилка при миттєвому читанні регістру ${registerInfo.name}:`, error);
    }
}

// Функція для безпечного скидання прапора запису
function resetWriteFlag() {
    if (writeTimeout) {
        clearTimeout(writeTimeout);
        writeTimeout = null;
    }
    isWriting = false;
    console.log("🔄 Регулярне читання відновлено");
}

// Модифікована функція для обробки запису
async function handleWrite(message, registerInfo) {
    const writeStartTime = Date.now();
    
    try {
        // Встановлюємо прапор, що відбувається запис
        isWriting = true;
        lastWriteTime = writeStartTime;
        
        // Очищаємо попередній таймер, якщо він існує
        if (writeTimeout) {
            clearTimeout(writeTimeout);
            writeTimeout = null;
        }
        
        console.log(`📝 Запис даних у регістр: ${registerInfo.name}`);
        
        // Виконуємо запис з таймаутом
        const writePromise = connectAndWriteArray(JSON.parse(message.toString()), registerInfo.address, clientModbus, registerInfo.type, registerInfo.size);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Write timeout')), 5000);
        });
        
        await Promise.race([writePromise, timeoutPromise]);
        
        console.log(`✅ Запис завершено для: ${registerInfo.name}`);
        
        // Після успішного запису виконуємо миттєве читання
        await readSpecificRegister(registerInfo);
        
        // Встановлюємо таймер для відновлення регулярного читання
        writeTimeout = setTimeout(() => {
            // Перевіряємо, чи це все ще актуальна операція запису
            if (lastWriteTime === writeStartTime) {
                resetWriteFlag();
            }
        }, 500); // Затримка 500мс для стабільності
        
    } catch (error) {
        console.error(`❌ Помилка при записі в регістр ${registerInfo.name}:`, error);
        // У разі помилки також відновлюємо читання
        if (lastWriteTime === writeStartTime) {
            resetWriteFlag();
        }
    }
}

// Функція для підключення до MQTT брокера
async function connectToBroker() {
    const clientId = "client" + Math.random().toString(36).substring(7);
    const hostURL = `${protocol}://${mqttHost}:${port}`;
    const options = {
        keepalive: 60,
        clientId: clientId,
        protocolId: "MQTT",
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
    };

    mqttClient = mqtt.connect(hostURL, options);

    mqttClient.on("error", (err) => {
        console.log("Error: ", err);
        mqttClient.end();
    });

    mqttClient.on("reconnect", () => {
        console.log("Reconnecting...");
    });

    mqttClient.on("connect", () => {
        mqttClient.subscribe("map/read", (err) => {
            if (!err) {
                console.log("Subscribed to topic: map/read");
            }
        });
        mqttClient.subscribe("map/write", (err) => {
            if (!err) {
                console.log("Subscribed to topic: map/write");
            }
        });
        mqttClient.subscribe("map/rAdd", (err) => {
            if (!err) {
                console.log("Subscribed to topic: map/rAdd");
            }
        });
        mqttClient.subscribe("map/wAdd", (err) => {
            if (!err) {
                console.log("Subscribed to topic: map/wAdd");
            }
        });
        mqttClient.subscribe("map/subscribeForConnectingOranges", (err) => {
            if (!err) {
                console.log("Subscribed to topic: map/subscribeForConnectingOranges");
            }
        });

        mqttClient.on('message', (topic, message) => {
            if (topic === "map/write"){
                writeMap = message.toString();
                writeMap = writeMap.split('\n');
                writeMap = writeMap.map(line => {
                    const [type, address, name, size] = line.split(/\s+/);
                    if(!(name in settingsData)) settingsData[name] = null;
                    return { type, address: Number(address), name, size: size ? Number(size) : null };
                });
            
                for(let item of writeMap){
                    mqttClient.subscribe(`HP${deviceID}/in/${item.name}`, (err) => {
                        if (!err) {
                            console.log(`Subscribed to topic: HP${deviceID}/in/${item.name}`);
                        }
                    });
                }
            } else if (topic === "map/wAdd"){
                writeMapAdd = message.toString();
                writeMapAdd = writeMapAdd.split('\n');
                writeMapAdd = writeMapAdd.map(line => {
                    const [type, address, name, size] = line.split(/\s+/);
                    if(!(name in settingsData)) settingsData[name] = null;
                    return { type, address: Number(address), name, size: size ? Number(size) : null };
                });
            
                for(let item of writeMapAdd){
                    mqttClient.subscribe(`HP${deviceID}/in/${item.name}`, (err) => {
                        if (!err) {
                            console.log(`Subscribed to topic: HP${deviceID}/in/${item.name}`);
                        }
                    });
                }
            } else if(topic === "map/subscribeForConnectingOranges"){
                let oranges = message.toString();
                const orangesArr = oranges.split('\n');

                const containsDeviceID = orangesArr.some(line => line.includes(deviceID));

                if (!containsDeviceID) {
                    oranges += "\n" + deviceID;
                    mqttClient.publish("map/subscribeForConnectingOranges", oranges, { qos: 0, retain: true });
                }
            }
        });
    });

    mqttClient.on('message', (topic, message) => {
        if (topic === "map/read"){
            map = message.toString();
            map = map.split('\n');
            map = map.map(line => {
                const [type, address, name, size] = line.split(/\s+/);
                return { type, address: Number(address), name, size: size ? Number(size) : null };
            });
        }else if (topic === "map/rAdd"){
            mapAdd = message.toString();
            mapAdd = mapAdd.split('\n');
            mapAdd = mapAdd.map(line => {
                const [type, address, name, size] = line.split(/\s+/);
                return { type, address: Number(address), name, size: size ? Number(size) : null };
            });
        }
        else if (topic === "map/write"){
            writeMap = message.toString();
            writeMap = writeMap.split('\n');
            writeMap = writeMap.map(line => {
                const [type, address, name, size] = line.split(/\s+/);
                return { type, address: Number(address), name, size: size ? Number(size) : null };
            });
        }else if (topic === "map/wAdd"){
            writeMapAdd = message.toString();
            writeMapAdd = writeMapAdd.split('\n');
            writeMapAdd = writeMapAdd.map(line => {
                const [type, address, name, size] = line.split(/\s+/);
                return { type, address: Number(address), name, size: size ? Number(size) : null };
            });
        }else if(topic.includes("/in/")){
            let existingSensor = false;
            console.log("start write")
            const topicArr = topic.split('/');
            for(let item of writeMap){
                if(item.name === topicArr[2]){
                    existingSensor = true;
                    // Викликаємо нову функцію для обробки запису
                    handleWrite(message, item);
                    break;
                }
            }
            if(!existingSensor){
                for(let item of writeMapAdd){
                if(item.name === topicArr[2]){
                    existingSensor = true;
                    // Викликаємо нову функцію для обробки запису
                    handleWrite(message, item);
                    break;
                }
            }
            }
        }
    });
}

await connectToBroker();

async function readAndWriteDataToBroker() {
    console.log(5);
    
    // Перевіряємо, чи не відбувається запис
    if (isWriting) {
        // Додаткова перевірка на "заморожений" стан
        const timeSinceLastWrite = Date.now() - lastWriteTime;
        if (timeSinceLastWrite > 10000) { // Якщо минуло більше 10 секунд
            console.log("⚠️  Принудове скидання прапора запису (таймаут)");
            resetWriteFlag();
        } else {
            console.log("⏸️  Пропускаємо регулярне читання - відбувається запис");
            return;
        }
    }

    if (!mqttClient.connected) {
        console.error("❌ MQTT-клієнт відключений! Повторюю підключення...");
        await mqttClient.reconnect();
        return;
    }

    // Виконуємо регулярне читання всіх регістрів
    try {
        readModbusData(clientModbus, mqttClient, map, writeMap, 0, deviceID);
    } catch (error) {
        console.error("❌ Помилка при регулярному читанні:", error);
    }
}

// Запускаємо регулярне читання
readInterval = setInterval(() => readAndWriteDataToBroker(), 3000);




async function readSlowMapToBroker() {
    if (isWriting) {
        const timeSinceLastWrite = Date.now() - lastWriteTime;
        if (timeSinceLastWrite > 10000) {
            console.log("⚠️ Принудове скидання прапора запису (таймаут)");
            resetWriteFlag();
        } else {
            console.log("⏸️ Пропускаємо читання повільної карти — відбувається запис");
            return;
        }
    }

    if (!mqttClient.connected) {
        console.error("❌ MQTT відключений! Спроба перепідключення...");
        await mqttClient.reconnect();
        return;
    }

    try {
        // 🔄 Читання іншої мапи — можеш замінити на потрібну
        readModbusData(clientModbus, mqttClient, mapAdd, writeMapAdd, 1, deviceID);
    } catch (error) {
        console.error("❌ Помилка при читанні повільної мапи:", error);
    }
}

// Запускаємо читання кожні 30 секунд
const slowReadInterval = setInterval(() => readSlowMapToBroker(), 30000);


// Функція для коректного завершення програми
process.on('SIGINT', () => {
    console.log('\n🛑 Отримано сигнал завершення...');
    
    if (readInterval) {
        clearInterval(readInterval);
    }
    if (writeTimeout) {
        clearTimeout(writeTimeout);
    }
    
    if (mqttClient) {
        mqttClient.end();
    }
    
    if (clientModbus) {
        clientModbus.close();
    }
    
    console.log('✅ Програма завершена');
    process.exit(0);
});
