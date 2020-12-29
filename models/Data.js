const { Client } = require('pg');

const connection = new Client({
    user:process.env.PG_USER,
    host:process.env.PG_HOST,
    database:process.env.PG_DATABASE,
    password:process.env.PG_PASSWORD,
    port:5432
  });
connection.connect();

const STAFFS = ['ken','emi','taro'];
const NUMBER_OF_SHIFTS = 7; //何日先のシフトまで入れることができるか
const OPENTIME = 9; //開店時間
const CLOSETIME = 19; //閉店時間

module.exports = {
    
    findData: () => {
        return new Promise((resolve,reject)=>{
            const pickup_users = {
                text:'SELECT * FROM users;'
            };

            connection.query(pickup_users)
                .then(users=>{
                    const reservations = [];
                    STAFFS.forEach((name,index)=>{
                        const pickup_reservations = {
                            text: `SELECT * FROM reservations.${name};`
                        }
                        connection.query(pickup_reservations)
                            .then(res=>{
                                reservations.push(res.rows);
                                if(index === STAFFS.length-1) {
                                    const data = {
                                        users: users.rows,
                                        reservations
                                    }
                                    resolve(data);
                                }
                            })
                            .catch(e=>console.log(e));
                    })
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
                    const arrangedData = [];
                    res.rows.forEach(obj=>{
                        //オブジェクトのディープコピー
                        const copiedObj = JSON.parse(JSON.stringify(obj))
                        let today = new Date(); //本日
                        console.log('today',today);
                        today.setHours(0,0,0,0); //0:00に設定
                        const today_ts = new Date(today).getTime();
                        console.log('today_ts',today_ts);
                        //現在のタイムスタンプとシフトが更新されたタイムスタンプの差を求める
                        const differential = today_ts - parseInt(copiedObj.updatedat);
                        //differntialの日数換算をする
                        const DaysByDifferential = Math.floor(differential/(24*60*60*1000));

                        // 現在と更新日が一致するとき
                        if(DaysByDifferential===0){
                            arrangedData.push(copiedObj);
                        }
                        // 現在と更新日の差がNUMBER_OF_SHIFTS以内かつ0より大きいとき
                        else if(DaysByDifferential<NUMBER_OF_SHIFTS && DaysByDifferential>0){
                            for(let i=0; i<NUMBER_OF_SHIFTS-DaysByDifferential; i++){
                                for(let j=OPENTIME;j<CLOSETIME;j++){
                                    copiedObj[`d${i}h${j}`] = copiedObj[`d${DaysByDifferential+i}h${j}`];
                                }
                            }
                            for(let i=NUMBER_OF_SHIFTS-DaysByDifferential;i<NUMBER_OF_SHIFTS;i++){
                                for(let j=OPENTIME;j<CLOSETIME;j++){
                                    copiedObj[`d${i}h${j}`] = null;
                                }
                            }
                            arrangedData.push(copiedObj);
                        }else{
                            for(let i=0;i<NUMBER_OF_SHIFTS;i++){
                                for(let j=OPENTIME;j<CLOSETIME;j++){
                                    copiedObj[`d${i}h${j}`] = null;
                                }
                            }
                            arrangedData.push(copiedObj);
                        }
                    });
                    resolve(arrangedData);
                })
                .catch(e=>console.log(e));
        })
    },

    staffRegister: ({name}) =>{
        return new Promise((resolve,reject) => {
            console.log('name in staffregister',name);
            const insert_query = {
                text: `INSERT INTO shifts (name) VALUES('${name}');`
            };
            connection.query(insert_query)
                .then(()=>{
                    const create_query = {
                        text:`CREATE TABLE IF NOT EXISTS reservations.${name} (id SERIAL NOT NULL, line_uid VARCHAR(100), name VARCHAR(100), scheduledate DATE, starttime BIGINT, endtime BIGINT, menu VARCHAR(20));`
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
                        if(i=== NUMBER_OF_SHIFTS-1 && j===CLOSETIME-1){
                            update_query += `d${i}h${j}`+') = ';
                            update_query2 += obj[`d${i}h${j}`]+') ';
                        }else{
                            update_query += `d${i}h${j}`+',';
                            update_query2 += obj[`d${i}h${j}`]+',';
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
    }
}