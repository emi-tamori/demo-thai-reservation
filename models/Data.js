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
                    const nowTime = new Date().getTime();
                    const arrangedData = [];
                    res.rows.forEach(obj=>{
                        const copiedObj = JSON.parse(JSON.stringify(obj))
                        const today = new Date(nowTime).getDate();
                        console.log('updatedat',copiedObj.updatedat);
                        const updatedAt = new Date(parseInt(copiedObj.updatedat)).getDate();
                        console.log('today updatedAt',today,updatedAt);
                        if(nowTime-parseInt(copiedObj.updatedat)<24*60*60*1000 && today===updatedAt){
                            arrangedData.push(copiedObj);
                        }else if(nowTime-parseInt(copiedObj.updatedat)<24*60*60*1000*NUMBER_OF_SHIFTS && today !== updatedAt){
                            const gap = today - updatedAt;
                            console.log('gap:',gap);
                            for(let i=0; i<NUMBER_OF_SHIFTS-gap; i++){
                                for(let j=OPENTIME;j<CLOSETIME;j++){
                                    copiedObj[`d${i}h${j}`] = copiedObj[`d${gap+i}h${j}`];
                                }
                            }
                            for(let i=NUMBER_OF_SHIFTS-gap;i<NUMBER_OF_SHIFTS;i++){
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
                    console.log('スタッフ登録完了');
                    resolve('スタッフ登録完了');
                })
        })
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