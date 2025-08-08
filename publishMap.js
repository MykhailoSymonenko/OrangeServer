// Імпортуємо бібліотеку mqtt
import mqtt from "mqtt"

// Параметри підключення
const protocol = "mqtt";
const mqttHost = "3.79.235.175";
const port = "1883";
const topic = "map/read"; // Замініть на потрібний топік

// Створення клієнта MQTT
const client = mqtt.connect(`${protocol}://${mqttHost}:${port}`);

// Дані для надсилання
const message = `InputRegister  12007  OU_Evaporation_T  2
InputRegister  12507  OU_Evaporation_T_1  2
InputRegister  12563  OU_Evaporation_T_2  2
InputRegister  8041  AT_Outdoor_Res  2
InputRegister  12005  OU_Condensation_T  2
InputRegister  12505  OU_Condensation_T_1  2
InputRegister  12561  OU_Condensation_T_2  2
InputRegister  12009  OU_RPr_Discharge  2
InputRegister  12509  OU_RPr_Discharge_1  2
InputRegister  12565  OU_RPr_Discharge_2  2
InputRegister  12011  OU_RPr_Suction  2
InputRegister  12511  OU_RPr_Suction_1  2
InputRegister  12567  OU_RPr_Suction_2  2
InputRegister  12053  OU_PWM_Source_Out  2
InputRegister  12553  OU_PWM_Source_Out_1  2
InputRegister  12603  OU_PWM_Source_Out_2  2
InputRegister  12033  OU_Curr_Electric_Power  2
InputRegister  12533  OU_Curr_Electric_Power_1  2
InputRegister  12589  OU_Curr_Electric_Power_2  2
InputRegister  12035  OU_Curr_Freq  
InputRegister  12535  OU_Curr_Freq_1  
InputRegister  12591  OU_Curr_Freq_2  
InputRegister  12031  OU_Suction_Super_Heat  2
InputRegister  12531  OU_Suction_Super_Heat_1  2
InputRegister  12587  OU_Suction_Super_Heat_2  2
InputRegister  12029  OU_Discharge_Super_Heat  2
InputRegister  12529  OU_Discharge_Super_Heat_1  2
InputRegister  12585  OU_Discharge_Super_Heat_2  2
InputRegister  12001  OU_RT_Discharge  2
InputRegister  12501  OU_RT_Discharge_1  2
InputRegister  12557  OU_RT_Discharge_2  2
InputRegister  12003  OU_RT_Suction  2
InputRegister  12503  OU_RT_Suction_1  2
InputRegister  12559  OU_RT_Suction_2  2
InputRegister  12017  OU_RT_Evaporation  2
InputRegister  12517  OU_RT_Evaporation_1  2
InputRegister  12573  OU_RT_Evaporation_2  2
InputRegister  12055  OU_EEV_Prc  2
InputRegister  12555  OU_EEV_Prc_1  2
InputRegister  12605  OU_EEV_Prc_2  2
InputRegister  2161  RT_Cond1.Output  2
InputRegister  10923  NVRAM_Mng.UI_Curr_COP  2
InputRegister  10949  NVRAM_Mng.UI_Curr_COP_1  2
InputRegister  10975  NVRAM_Mng.UI_Curr_COP_2  2
InputRegister  10925  NVRAM_Mng.Disp_Curr_kW  2
InputRegister  10951  NVRAM_Mng.Disp_Curr_kW_1  2
InputRegister  10977  NVRAM_Mng.Disp_Curr_kW_2  2
InputRegister  2081  WF_Flow.Output  2
InputRegister  2141  WT_Return.Output  2
InputRegister  2061  WPr_Return.Output  2
InputRegister  2121  WT_Flow.Output  2
InputRegister  8037  AO_PW  2
InputRegister  12023  OU_GeoT_Outlet  2
InputRegister  12521  OU_GeoT_Outlet_1  2
InputRegister  12577  OU_GeoT_Outlet_2  2
DiscreteInput  4704  OU_DO_Comp
DiscreteInput  4804  OU_DO_Comp_1  
DiscreteInput  4904  OU_DO_Comp_2  
InputRegister  8005  UI_Result_SensorHP_C  2
InputRegister  8013  UI_Result_SensorDHW  2
InputRegister  8009  UI_Result_SensorHP_H  2
InputRegister  1001  Status_HP  
InputRegister  12047  OU_Crit_Alarm_No
InputRegister  12547  OU_Crit_Alarm_No_1
InputRegister  12601  OU_Crit_Alarm_No_2
InputRegister  12049  OU_Dang_Alarm_No
InputRegister  12549  OU_Dang_Alarm_No_1  
InputRegister  12602  OU_Dang_Alarm_No_2  
InputRegister  2701  Setp_Heating  2
InputRegister  2601  Setp_Cooling  2
InputRegister  2801  Setp_DWHT  2
DiscreteInput  4053  DO_BUH1  
DiscreteInput  4055  DO_BUH2  
DiscreteInput  4709  OU_DO_Out_4Way  
DiscreteInput  4809  OU_DO_Out_4Way_1
DiscreteInput  4909  OU_DO_Out_4Way_2
InputRegister  12027  OU_RT_Inject_Outlet  2
InputRegister  12527  OU_RT_Inject_Outlet_1  2
InputRegister  12583  OU_RT_Inject_Outlet_2  2
InputRegister  12025  OU_RT_Inject_Inlet  2
InputRegister  12525  OU_RT_Inject_Inlet_1  2
InputRegister  12581  OU_RT_Inject_Inlet_2  2
InputRegister  12051  OU_AO_Inject  2
InputRegister  12551  OU_AO_Inject_1  2
DiscreteInput  4006  DO_PW
DiscreteInput  3019  OfflineAlrm_CPCOE_1.Active
Coil  2  Al_retain.Active
HoldingRegister  148  ErrRetainWrite[1]  2
HoldingRegister  150  ErrRetainWrite[2]  2
HoldingRegister  152  ErrRetainWrite[3]  2
HoldingRegister  154  ErrRetainWrite[4]  2
HoldingRegister  156  ErrRetainWrite[5]  2
DiscreteInput  3001  WT_Return_Fault.Active  
DiscreteInput  3005  WF_Outlet_Fault.Active
DiscreteInput  3006  WT_BufferTank_Fault.Active
DiscreteInput  3007  DHWT_Tank_Fault.Active
DiscreteInput  3008  RT_Cond1_Fault.Active
DiscreteInput  3002  WT_Flow_Fault.Active
DiscreteInput  3003  AT_Outdoor_Fault.Active  
DiscreteInput  3010  WPr_Outlet_Low_Fault.Active
DiscreteInput  3011  WPr_Outlet_High_Fault.Active
DiscreteInput  3012  WF_Outlet_Low_Fault.Active
DiscreteInput  3013  Max_Time_AL.Active
DiscreteInput  3014  WT_PGR1_Fault.Active  
DiscreteInput  3015  WT_PGR2_Fault.Active  
DiscreteInput  3016  WT_PGR3_Fault.Active  
DiscreteInput  3017  WT_PGR4_Fault.Active  
DiscreteInput  3018  WT_PGR5_Fault.Active  
DiscreteInput  3019  OfflineAlrm_CPCOE_1.Active  
DiscreteInput  3020  CfgErrAlrm_CPCOE_1.Active  
DiscreteInput  3021  OU_Line_Break.Active  
DiscreteInput  3022  OU_Crit_Alarm.Active  
DiscreteInput  3023  OU_Dang_Alarm.Active  
DiscreteInput  3024  OU_Line_Break_1.Active  
DiscreteInput  3025  OU_Crit_Alarm_1.Active  
DiscreteInput  3026  OU_Dang_Alarm_1.Active  
DiscreteInput  3027  OU_Crit_Alarm_2.Active  
DiscreteInput  3028  OU_Dang_Alarm_2.Active  
DiscreteInput  3029  OU_Line_Break_2.Active`;

// Підключення до брокера
client.on('connect', () => {
    console.log("Connected to MQTT broker");
    
    // Публікація повідомлення
    client.publish(topic, message, { qos: 0, retain: true }, (err) => {
        if (err) {
            console.error("Error publishing message:", err);
        } else {
            console.log("Message published successfully");
        }
        client.end(); // Завершити підключення після публікації
    });
});

// Обробка помилок
client.on('error', (err) => {
    console.error("MQTT connection error:", err);
});
