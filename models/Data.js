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
                    resolve(res.rows)
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
    }
}