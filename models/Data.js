(()=>{
    const { Client } = require('pg');
    const nodemailer = require('nodemailer');
    const e = require('express');

    const connection = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      });
      connection.connect();

    const {
        OPENTIME, //開店時間
        CLOSETIME, //閉店時間
        NUMBER_OF_SHIFTS, //何日先のシフトまで入力するか
        SHIFTS_LEFT,　//南日前までのシフトを残すか
        ADMIN_EMAIL_FROM, //Gメールの送り元(id,secret,refreshが登録されたもの)
        ADMIN_EMAIL_TO, //Gメールの送り先
        MENU, //施術メニュー（メニュー名、時間、料金）
    } = require('../params/back');

    // const NUMBER_OF_SHIFTS = 7; //何日先のシフトまで入れることができるか
    // const SHIFTS_LEFT = 7; //何日前までのシフトを残すか
    // const OPENTIME = 12; //開店時間
    // const CLOSETIME = 24; //閉店時間
    // const ADMIN_EMAIL_FROM = 'kentaro523@gmail.com';
    // const ADMIN_EMAIL_TO = 'waruemon.xyz@gmail.com';

    // const MENU = [
    //     {
    //         menu: 'タイ式（ストレッチ）',
    //         timeAndPrice: [[30,3000],[45,4000],[60,5000],[90,7000],[120,9000]]
    //     },
    //     {
    //         menu: 'タイ式（アロマ）',
    //         timeAndPrice: [[45,5000],[60,7000],[90,9000],[120,12000]]
    //     },
    //     {
    //         menu: '足つぼマッサージ',
    //         timeAndPrice: [[30,3000],[60,5000]]
    //     }
    // ]

    //予約の重複チェックを行う関数
    const doubleBookingCheck = (startTime,endTime,staffName,id) => {
        return new Promise((resolve,reject) => {
            let answer = null;
            const select_query = {
                text:`SELECT * FROM reservations.${staffName} WHERE endtime>=${startTime};`
            }
            connection.query(select_query)
                .then(res=>{
                    if(res.rows.length){
                        const filteredArray = res.rows.filter(object=>{
                            return ((object.id != id)&&((object.starttime>=startTime && object.starttime<endTime) || (object.endtime>startTime && object.endtime<=endTime) || (object.starttime>=startTime && object.endtime<=endTime) || (object.starttime<=startTime && object.endtime>=endTime)));
                        });
                        answer = filteredArray.length ? false : true;
                    }else{
                        answer = true;
                    }
                    resolve(answer);
                })
                .catch(e=>console.log(e));
        });
    }

    //スタッフのシフトデータをupdatedatと今日のタイムスタンプを比較し、ずれている分だけシフトさせる関数
    const shiftDifferential = (data) => {
        const shiftedData = [];
        data.forEach(obj=>{
            //オブジェクトのディープコピー
            const copiedData = JSON.parse(JSON.stringify(obj));

            //ディファレンシャル（シフト更新日と本日の日数差）の算出
            const today = new Date(new Date().getTime()+9*60*60*1000);
            const today_ts = new Date(`${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()} 00:00:00`).getTime() -9*60*60*1000;
            console.log('ts',today_ts);
            // const today_ts = new Date(new Date(nowTime).toLocaleString()).getTime() -9*60*60*1000;
            const differential = Math.floor((today_ts-parseInt(copiedData.updatedat))/(24*60*60*1000));
            // const differential = 15; //test用
            console.log('differential',today_ts,copiedData.updatedat,differential);

            //ディファレンシャルが存在する時に、シフトデータのシフト処理を行う
            if(differential>0){
                //シフトデータの二次元配列化
                const shiftArray = [];

                //p要素の抽出
                for(let i=SHIFTS_LEFT; i>0; i--){
                    const tempArray = [];
                    for(let j=OPENTIME; j<CLOSETIME; j++){
                        tempArray.push(copiedData[`p${i}h${j}`]);
                    }
                    shiftArray.push(tempArray);
                }

                //d要素の抽出
                for(let i=0; i<NUMBER_OF_SHIFTS; i++){
                    const tempArray = [];
                    for(let j=OPENTIME; j<CLOSETIME; j++){
                        tempArray.push(copiedData[`d${i}h${j}`]);
                    }
                    shiftArray.push(tempArray);
                }

                // console.log('shiftArray1',shiftArray);

                if(differential<NUMBER_OF_SHIFTS+SHIFTS_LEFT){
                    shiftArray.splice(0,differential); //配列末尾からdifferential分だけ削除
                    for(let i=0; i<differential; i++){
                        const tempArray = [];
                        for(let j=OPENTIME; j<CLOSETIME; j++){
                            //tempArray.push(null);
                            tempArray.push(1);
                        }
                        shiftArray.push(tempArray);
                    }
                    // console.log('shiftArray2',shiftArray);

                }else if(differential>=NUMBER_OF_SHIFTS+SHIFTS_LEFT){
                    shiftArray.splice(0); //配列内全削除
                    for(let i=0; i<NUMBER_OF_SHIFTS+SHIFTS_LEFT; i++){
                        const tempArray = [];
                        for(let j=OPENTIME; j<CLOSETIME; j++){
                            //tempArray.push(null);
                            tempArray.push(1);
                        }
                        shiftArray.push(tempArray);
                    }
                    // console.log('shiftArray3',shiftArray);
                }
                // console.log('copiedData before',copiedData);
                //加工したshiftArrayでcopiedDataのシフトデータを書き換えにいく
                //pの書き換え
                for(let i=0; i<SHIFTS_LEFT; i++){
                    for(let j=0; j<CLOSETIME-OPENTIME; j++){
                        copiedData[`p${SHIFTS_LEFT-i}h${j+OPENTIME}`] = shiftArray[i][j];
                    }
                }

                //dの書き換え
                for(let i=0; i<NUMBER_OF_SHIFTS; i++){
                    for(let j=0; j<CLOSETIME-OPENTIME; j++){
                        copiedData[`d${i}h${j+OPENTIME}`] = shiftArray[NUMBER_OF_SHIFTS+i][j];
                    }
                }
                // console.log('copiedData after',copiedData);
            }
            shiftedData.push(copiedData);
        });
        return shiftedData;
    }


    //gmailを送る関数
    const gmailSend = (staffName,date,menu) => {
        
        //Gmail送信設定
        const message = {
        from: ADMIN_EMAIL_FROM,
        to: ADMIN_EMAIL_TO,
        subject: `${staffName}さんに予約が入りました！！`,
        text: `${date}に${menu}で予約が入りました！`
        };

        const auth = {
        type: 'OAuth2',
        user: ADMIN_EMAIL_FROM,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN
        };

        const transport = {
        service: 'gmail',
        auth: auth
        };

        const transporter = nodemailer.createTransport(transport);
        transporter.sendMail(message,(err,response)=>{
        console.log(err || response);
        });
    }

    module.exports = {
        
        findData: () => {
            return new Promise((resolve,reject)=>{
                const pickup_users = {
                    text:'SELECT * FROM users;'
                };

                connection.query(pickup_users)
                    .then(users=>{
                        const pickup_staffs = {
                            text: 'SELECT * FROM shifts;'
                        }
                        connection.query(pickup_staffs)
                            .then(staffs=>{
                                if(staffs.rows.length){
                                    const arrangedStaffs = shiftDifferential(staffs.rows);
                                    const reservations = [];
                                    arrangedStaffs.forEach((staff,index)=>{
                                        const pickup_reservations = {
                                            text: `SELECT * FROM reservations.${staff.name};`
                                        }
                                        connection.query(pickup_reservations)
                                            .then(res=>{
                                                reservations.push(res.rows);
                                                if(index === staffs.rows.length-1) {
                                                    const data = {
                                                        users: users.rows,
                                                        staffs: arrangedStaffs,
                                                        reservations
                                                    }
                                                    resolve(data);
                                                }
                                            })
                                            .catch(e=>console.log(e));
                                    })
                                }else{
                                    resolve([]);
                                }
                            })
                            .catch(e=>console.log(e));
                    })
                    .catch(e=>console.log(e))
            });
        },

        updateUser: ({id,name,cuttime,shampootime,colortime,spatime}) => {
            return new Promise((resolve,reject)=>{

                const update_query = {
                    text:`UPDATE users SET (display_name,cuttime,shampootime,colortime,spatime) = ('${name}',${cuttime},${shampootime},${colortime},${spatime}) WHERE id=${id};`
                }

                connection.query(update_query)
                    .then(res=>{
                        console.log('お客さま情報更新成功');
                        resolve('お客さま情報更新成功');
                    })
                    .catch(e=>console.log(e.stack));
            });
        },

        getStaffs: () => {
            return new Promise((resolve,reject)=>{
                const pickup_staffs = {
                    text:'SELECT * from shifts;'
                };
                connection.query(pickup_staffs)
                    .then(res=>{
                        console.log('res.rows',res.rows);
                        const arrangedData = shiftDifferential(res.rows);
                        console.log('arrangedData', arrangedData);
                        resolve(arrangedData);
                    })
                    .catch(e=>console.log(e));
            })
        },

        staffRegister: ({name}) =>{
            return new Promise((resolve,reject) => {

                //スタッフデータ生成時にシフトデータの初期値を1に設定する
                let today = new Date();
                today.setHours(0,0,0,0); //0:00にセット
                const today_ts = new Date(today).getTime() -9*60*60*1000;
                let insert_query = 'INSERT INTO shifts (name, updatedat, ';
                let insert_query2 = ` VALUES('${name}',${today_ts},`;
                for(let i=0;i<NUMBER_OF_SHIFTS;i++){
                    for(let j=OPENTIME;j<CLOSETIME;j++){
                        if(i=== NUMBER_OF_SHIFTS-1 && j===CLOSETIME-1){
                            insert_query += `d${i}h${j}`+')';
                            insert_query2 += 1+');';
                        }else{
                            insert_query += `d${i}h${j}`+',';
                            insert_query2 += 1+',';
                        }
                    }
                }
                insert_query += insert_query2;
                console.log('insert_query:',insert_query);
                connection.query(insert_query)
                    .then(()=>{
                        const create_query = {
                            text:`CREATE TABLE IF NOT EXISTS reservations.${name} (id SERIAL NOT NULL, line_uid VARCHAR(50), name VARCHAR(30), scheduledate DATE, starttime BIGINT, endtime BIGINT, menu SMALLINT, treattime SMALLINT, staff VARCHAR(30));`
                        };
                        connection.query(create_query)
                            .then(()=>{
                                console.log('スタッフ登録完了');
                                resolve('スタッフ登録完了');
                            })
                            .catch(e=>console.log(e));
                    })
                    .catch(e=>console.log(e));
            });
        },

        staffDeleter: (name) => {
            return new Promise((resolve,reject)=>{
                const delete_shifts = {
                    text: `DELETE FROM shifts WHERE name='${name}';`
                };
                connection.query(delete_shifts)
                    .then(()=>{
                        const delete_reservations = {
                            text: `DROP TABLE reservations.${name};`
                        }
                        connection.query(delete_reservations)
                            .then(()=>{
                                console.log('スタッフ削除完了');
                                resolve('スタッフを削除しました');
                            })
                            .catch(e=>console.log(e));
                    })
                    .catch(e=>console.log(e));
            });
        },

        shiftRegister: (data) => {
            return new Promise((resolve,reject)=>{
                //UPDATEクエリ文生成
                data.forEach((obj,index)=>{
                    let update_query = 'UPDATE shifts SET (updatedat,';
                    let update_query2 = `(${obj.updatedat},`;
                    for(let i=0;i<NUMBER_OF_SHIFTS;i++){
                        for(let j=OPENTIME;j<CLOSETIME;j++){
                            update_query += `d${i}h${j}`+',';
                            update_query2 += obj[`d${i}h${j}`]+',';
                        }
                    }
                    for(let k=1;k<SHIFTS_LEFT+1;k++){
                        for(let l=OPENTIME;l<CLOSETIME;l++){
                            if(k=== SHIFTS_LEFT && l===CLOSETIME-1){
                                update_query += `p${k}h${l}`+') = ';
                                update_query2 += obj[`p${k}h${l}`]+') ';
                            }else{
                                update_query += `p${k}h${l}`+',';
                                update_query2 += obj[`p${k}h${l}`]+',';
                            }
                        }
                    }
                    update_query += update_query2 + `WHERE id=${obj.id};`;
                    console.log('update_query:',update_query);

                    //データアップデート
                    connection.query(update_query)
                        .then(()=>{
                            console.log(`${obj.name}のシフトデータ更新成功!`);
                            if(index===data.length-1) resolve('データ更新成功');
                        })
                        .catch(e=>console.log(e));
                })
            })
        },

        updateReservationData: ({customerName,staffName,selectedYear,selectedMonth,selectedDay,sHour,sMin,menu,treattime,id}) => {
            return new Promise((resolve,reject) => {
                const startTime = new Date(`${selectedYear}/${selectedMonth}/${selectedDay} ${sHour}:$${sMin}`).getTime() -9*60*60*1000;
                const endTime = startTime + MENU[menu].timeAndPrice[treattime][0]*60*1000;
                const scheduleDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;

                //予約重複チェック
                doubleBookingCheck(startTime,endTime,staffName,id)
                    .then(answer=>{
                        console.log('answer:',answer);
                        if(answer){
                            const update_query = {
                                text:`UPDATE reservations.${staffName} SET (name,scheduledate,starttime,endtime,menu,treattime,staff) = ('${customerName}','${scheduleDate}',${startTime},${endTime},${menu},${treattime},'${staffName}') WHERE id=${id};`
                            };
                            connection.query(update_query)
                                .then(()=>{
                                    console.log('予約データ更新成功');
                                    resolve('予約データ更新成功');
                                })
                                .catch(e=>console.log(e));
                        }else{
                            console.log('重複あり');
                            resolve('予約に重複があるため、予約データを更新できません');
                        }
                    })
                    .catch(e=>console.log(e));
            });
        },

        deleteReservationData: (staffName,id) => {
            return new Promise((resolve,reject)=>{
                const select_query = {
                    text: `SELECT * FROM reservations.${staffName} WHERE id=${id};`
                }
                connection.query(select_query)
                    .then(res=>{
                        const lineId = res.rows[0].line_uid;
                        if(lineId){
                            const update_query = {
                                text: `UPDATE users SET visits=visits-1 WHERE line_uid='${lineId}';`
                            }
                            connection.query(update_query)
                                .then(()=>console.log('visits1減'))
                                .catch(e=>console.log(e));
                        }
                        const delete_query = {
                            text:`DELETE FROM reservations.${staffName} WHERE id=${id};`
                        }
                        connection.query(delete_query)
                            .then(()=>{
                                console.log('データ削除成功');
                                resolve('予約データ削除しました');
                            })
                            .catch(e=>console.log(e));
                    })
                    .catch(e=>console.log(e));
                
            });
        },

        createReservation: ({customerName,staffName,selectedYear,selectedMonth,selectedDay,sHour,sMin,menu,treattime}) => {
            return new Promise((resolve,reject)=>{
                const startTime = new Date(`${selectedYear}/${selectedMonth}/${selectedDay} ${sHour}:$${sMin}`).getTime() -9*60*60*1000;
                const endTime = startTime + MENU[menu].timeAndPrice[treattime][0]*60*1000;
                const scheduleDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;

                //予約重複チェック
                doubleBookingCheck(startTime,endTime,staffName,-1)
                    .then(answer=>{
                        if(answer){
                            const insert_query = {
                                text:`INSERT INTO reservations.${staffName} (name,scheduledate,starttime,endtime,menu,treattime,staff) VALUES ('${customerName}','${scheduleDate}',${startTime},${endTime},${menu},${treattime},'${staffName}');`
                            };
                            connection.query(insert_query)
                                .then(()=>{
                                    console.log('予約データ作成成功');
                                    gmailSend(staffName,scheduleDate,menu);
                                    resolve('新規予約データ作成成功');
                                })
                                .catch(e=>console.log(e));
                        }else{
                            console.log('重複あり');
                            resolve('予約に重複があるため、新規予約登録できません');
                        }
                    })
                    .catch(e=>console.log(e));
            });
        }
    }
})();