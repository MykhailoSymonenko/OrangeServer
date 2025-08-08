import ModbusRTU from "modbus-serial";


export const connectAndWriteArray = async function (floatValue, sensorID, clientModbus, itemType, itemSize) {
    // const modbusWriteIP = "192.168.0.242";
    // const modbusWritePort = 502;
    let attempt = 0;
    const maxAttempts = 3; // Максимальна кількість спроб підключення
    const delay = 2000; // Затримка між спробами (2 секунди)
    //const clientModbus = new ModbusRTU();
    while (attempt < maxAttempts) {
        try {
            console.log(`Спроба підключення... (${attempt + 1}/${maxAttempts})`);
            //await clientModbus.connectTCP(modbusWriteIP, { port: modbusWritePort });
            //clientModbus.setID(1);

            if(itemType === "Coil"){
                console.log('1')
                await clientModbus.writeCoil(sensorID, floatValue);
            }else{
                const registers = (itemSize === null) ? [floatValue] : floatToRegisters(floatValue);
                //const sensorAddress = flag ? sensorID  : parseInt(sensorID, 10)  + 10;
                const sensorAddress = sensorID;
                console.log('start')
                await clientModbus.writeRegisters(sensorAddress, registers);
                console.log('end')
            }
            //clientModbus.close();
            console.log(`Число ${floatValue} в датчик ${sensorID} записано!`);
            return; // Виходимо з функції після успішного виконання
        } catch (error) {
            attempt++;
            console.error(`Помилка підключення: ${error.message}`);
            if (attempt < maxAttempts) {
                console.log(`Чекаємо ${delay / 1000} секунд перед наступною спробою...`);
                await new Promise(resolve => setTimeout(resolve, delay)); // Затримка перед повтором
            } else {
                console.log("Не вдалося підключитися після кількох спроб.");
                console.log(`Число ${floatValue} в датчик ${sensorID} НЕ записано!`);
                //clientModbus.close();
            }
        }
    }
}



function floatToRegisters(value) {
    const buffer = Buffer.alloc(4);
    //buffer.writeFloatBE(value, 0); // Записуємо float у буфер (Big Endian)
    //return [buffer.readUInt16BE(0), buffer.readUInt16BE(2)];
    buffer.writeFloatLE(value, 0); // Записуємо float у буфер (Little Endian)
    return [buffer.readUInt16LE(0), buffer.readUInt16LE(2)];
}

