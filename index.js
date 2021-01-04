const express = require('express');
const app = express();
const line = require('@line/bot-sdk');
const path = require('path');
const { Client } = require('pg');
const router = require('./routers/index');
const apiRouter = require('./routers/api');
const multipart = require('connect-multiparty');
const nodemailer = require('nodemailer');
const Flex = require('./models/Flex');

const PORT = process.env.PORT || 5000

// const INITIAL_TREAT = [20,10,40,15,30,15,10];

const MENU = [
  {
    menu: 'タイ式（ストレッチ）',
    timeAndPrice: [[30,3000],[45,4000],[60,5000],[90,7000],[120,9000]]
  },
  {
    menu: 'タイ式（アロマ）',
    timeAndPrice: [[45,5000],[60,7000],[90,9000],[120,12000]]
  },
  {
    menu: '足つぼマッサージ',
    timeAndPrice: [[30,5000],[60,7000],[90,9000],[120,12000]]
  }
]
const WEEK = [ "日", "月", "火", "水", "木", "金", "土" ];
const OPENTIME = 12; //開店時間
const CLOSETIME = 24; //閉店時間
const LAST_ORDER = 1; //閉店の何時間前まで予約可能か
const REGULAR_CLOSE = []; //定休日の曜日
const FUTURE_LIMIT = 3; //何日先まで予約可能かの上限
const NUMBER_OF_SHIFTS = 7; //何日先のシフトまで入れることができるか

const config = {
    channelAccessToken:process.env.ACCESS_TOKEN,
    channelSecret:process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

const connection = new Client({
    user:process.env.PG_USER,
    host:process.env.PG_HOST,
    database:process.env.PG_DATABASE,
    password:process.env.PG_PASSWORD,
    port:5432
  });

connection.connect();

//ユーザーテーブルの作成
const create_userTable = {
  text:'CREATE TABLE IF NOT EXISTS users (id SERIAL NOT NULL, line_uid VARCHAR(100), display_name VARCHAR(50), timestamp BIGINT);'
};
  
connection.query(create_userTable)
  .then(()=>{
      console.log('table users created successfully!!');
  })
  .catch(e=>console.log(e));

//シフト文字列の生成
let shiftText = 'CREATE TABLE IF NOT EXISTS shifts (id SERIAL NOT NULL, name VARCHAR(50), email VARCHAR(100) , updatedat BIGINT, ';
for(let i=0; i<NUMBER_OF_SHIFTS; i++){
  for(j=OPENTIME; j<CLOSETIME; j++){
    if(i === NUMBER_OF_SHIFTS-1 && j === CLOSETIME-1){
      shiftText += 'd'+i+'h'+j+' SMALLINT'+');';
    }else{
      shiftText += 'd'+i+'h'+j+' SMALLINT'+',';
    }
  }
}
//シフトテーブルの生成
connection.query(shiftText)
  .then(()=>console.log('shifts created successfully!'))
  .catch(e=>console.log(e));

//スキーマの作成
const create_schema ={
  text:'CREATE SCHEMA IF NOT EXISTS reservations'
};
connection.query(create_schema)
  .then(()=>console.log('schema created successfully'))
  .catch(e=>console.log(e));

app
  .use(express.static(path.join(__dirname,'public')))
  .use(multipart())
  .post('/hook',line.middleware(config),(req,res)=> lineBot(req,res))
  .use(express.json()) //これが/apiルーティングの前にこないと、ダメ
  .use(express.urlencoded({extended:true}))　//これが/apiルーティングの前にこないと、ダメ
  .use('/',router)
  .use('/api',apiRouter)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .listen(PORT,()=>console.log(`Listening on ${PORT}`));

const lineBot = (req,res) => {
  res.status(200).end();
  const events = req.body.events;
  const promises = [];

  for(let i=0;i<events.length;i++){
    const ev = events[i];
    console.log("ev:",ev);

    switch(ev.type){
      case 'follow':
        promises.push(greeting_follow(ev));
        break;
      
      case 'message':
        promises.push(handleMessageEvent(ev));
        break;
      
      case 'postback':
        promises.push(handlePostbackEvent(ev));
        break;
    }
  }

  Promise
    .all(promises)
    .then(console.log('all promises passed'))
    .catch(e=>console.error(e.stack));
}

const greeting_follow = async (ev) => {
    const profile = await client.getProfile(ev.source.userId);

    const table_insert = {
        text:'INSERT INTO users (line_uid,display_name,timestamp,cuttime,shampootime,colortime,spatime) VALUES($1,$2,$3,$4,$5,$6,$7);',
        values:[ev.source.userId,profile.displayName,ev.timestamp,INITIAL_TREAT[0],INITIAL_TREAT[1],INITIAL_TREAT[2],INITIAL_TREAT[3]]
      };

    connection.query(table_insert)
    .then(()=>{
        console.log('insert successfully!!')
    })
    .catch(e=>console.log(e));
    
    return client.replyMessage(ev.replyToken,{
        "type":"text",
        "text":`${profile.displayName}さん、フォローありがとうございます\uDBC0\uDC04`
    });
}

const handleMessageEvent = async (ev) => {
    console.log('ev:',ev);
    const profile = await client.getProfile(ev.source.userId);
    const text = (ev.message.type === 'text') ? ev.message.text : '';

    if(text === '予約'){
      const nextReservation = await checkNextReservation(ev);
      console.log('次の予約',nextReservation);
      if(!nextReservation.length){
        const flexMessage = Flex.makeMenuChoice();
        return client.replyMessage(ev.replyToken,flexMessage);
      }
      else{
        return client.replyMessage(ev.replyToken,{
          "type":"text",
          "text":"すでに次回予約が入っています><;"
        });
      }
    }
    else if(text === '予約確認'){
      const nextReservation = await checkNextReservation(ev);
      console.log('nextRev in confirm',nextReservation);
      if(nextReservation.length){
        const startTimestamp = nextReservation[0].starttime;
        const endTimestamp = nextReservation[0].endtime;

        //施術時間の取得(分単位)
        const treatTime = (endTimestamp - startTimestamp)/(60*1000);

        //予約日時の表記取得
        const date = dateConversion(startTimestamp);

        //メニュー表記の取得
        const menuArray = nextReservation[0].menu.split('%');
        let menu = '';
        menuArray.forEach((value,index) => {
          if(index !== 0){
            menu += ',' + MENU[parseInt(value)];
          }else{
            menu += MENU[parseInt(value)];
          }
        });

        return client.replyMessage(ev.replyToken,{
          "type":"text",
          "text":`次回予約は${date}から${treatTime}分間、${menu}でお取りしてます\uDBC0\uDC22`
        });
      }else{
        return client.replyMessage(ev.replyToken,{
          "type":"text",
          "text":"次回の予約は入っておりません。"
        })
      }

    }else if(text === '予約キャンセル'){
      const nextReservation = await checkNextReservation(ev);
      if(nextReservation.length){
        const startTimestamp = nextReservation[0].starttime;
        const endTimestamp = nextReservation[0].endtime;

        //施術時間の取得
        const treatTime = (endTimestamp - startTimestamp)/(60*1000);

        //予約日時の表記取得
        const date = dateConversion(startTimestamp);

        //メニュー表記の取得
        const menuArray = nextReservation[0].menu.split('%');
        let menu = '';
        menuArray.forEach((value,index) => {
          if(index !== 0){
            menu += ',' + MENU[parseInt(value)];
          }else{
            menu += MENU[parseInt(value)];
          }
        });

        //削除対象予約特定用パラメータ
        const id = nextReservation[0].id;
        const staff = nextReservation[0].staff;

        return client.replyMessage(ev.replyToken,{
          "type":"flex",
          "altText": "cancel message",
          "contents":
          {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": `次回の予約は${date}から${treatTime}分間、${menu}でおとりしてます。この予約をキャンセルしますか？`,
                  "size": "lg",
                  "wrap": true
                }
              ]
            },
            "footer": {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "予約をキャンセルする",
                    "data": `delete&${staff}&${id}`
                  }
                }
              ]
            }
          }
        });
      }   
      else{
        return client.replyMessage(ev.replyToken,{
          "type":"text",
          "text":"次回予約は入っておりません。"
        });
      }
    } 
    else{
      return client.replyMessage(ev.replyToken,{
        "type":"text",
        "text":`${text}`
      });
  }
}

const handlePostbackEvent = async (ev) => {
    console.log('postback ev:',ev);
    const profile = await client.getProfile(ev.source.userId);
    const data = ev.postback.data;
    const splitData = data.split('&');

    if(splitData[0] === 'menu'){
      const selectedMenu = parseInt(splitData[1]);
      const flexMessage = Flex.makeTimeChoice(selectedMenu);
      return client.replyMessage(ev.replyToken,flexMessage);
    }

    else if(splitData[0] === 'end'){
      const selectedMenu = parseInt(splitData[1]);
      const selectedTime = parseInt(splitData[2]);
      const flexMessage = Flex.makeDateChoice(selectedMenu,selectedTime);
      return client.replyMessage(ev.replyToken,flexMessage);
    }
    
    else if(splitData[0] === 'date'){
      const orderedMenu = parseInt(splitData[1]);
      const selectedTime = parseInt(splitData[2]);
      const selectedDate = ev.postback.params.date;

      //「過去の日にち」、「定休日」、「futureLimit以降」の予約はできないようフィルタリングする
      const today_y = new Date().getFullYear();
      const today_m = new Date().getMonth() + 1;
      const today_d = new Date().getDate();
      const today = new Date(`${today_y}/${today_m}/${today_d} 0:00`).getTime() - 9*60*60*1000;
      const targetDate = new Date(`${selectedDate} 0:00`).getTime() - 9*60*60*1000;

      //選択日が過去でないことの判定
      if(targetDate>=today){
        const targetDay = new Date(`${selectedDate}`).getDay();
        const dayCheck = REGULAR_CLOSE.some(day => day === targetDay);
        //定休日でないことの判定
        if(!dayCheck){
          const futureLimit = today + FUTURE_LIMIT*24*60*60*1000;
          //予約可能な範囲の日であることの確認
          if(targetDate <= futureLimit){
            
            //shiftsテーブルからデータを取得
            const select_shifts = {
              text: 'SELECT * FROM shifts;'
            }
            connection.query(select_shifts)
              .then( async (res) => {
                //スタッフ人数分のreservableArrayを取得
                if(res.rows.length){
                  const reservableArray = [];
                  for(let i=0; i<res.rows.length; i++){
                    const staff_reservable = await checkReservable(ev,orderedMenu,selectedTime,selectedDate,res.rows[i]);
                    reservableArray.push(staff_reservable);
                  }
                  console.log('reservableArray:',reservableArray);

                  //予約可能時間帯とボタン色配列を生成
                  const time = [];
                  const color = [];
                  for(let i=0; i<CLOSETIME-OPENTIME; i++){
                    let count = 0;
                    for(let j=0; j<reservableArray.length; j++){
                      if(reservableArray[j][i].length) count++;
                    }
                    if(count>0){
                      time.push(i);
                      color.push('#00AA00');
                    }else{
                      time.push(-1);
                      color.push('#FF0000');
                    }
                  }
                  const flexMessage = Flex.askTime(orderedMenu,selectedTime,selectedDate,time,color);
                  return client.replyMessage(ev.replyToken,flexMessage);

                }else{
                  console.log('登録されたスタッフがいません');
                }
              })
              .catch(e=>console.log(e));
          }else{
            return client.replyMessage(ev.replyToken,{
              "type":"text",
              "text":`${FUTURE_LIMIT}日より先の予約はできません><;`
            });
          }
        }else{
          return client.replyMessage(ev.replyToken,{
            "type":"text",
            "text":"定休日には予約できません><;"
          });
        }
      }else{
        return client.replyMessage(ev.replyToken,{
          "type":"text",
          "text":"過去の日にちには予約できません><;"
        });
      }
    }
    
    else if(splitData[0] === 'time'){
        const orderedMenu = parseInt(splitData[1]);
        const selectedTime = parseInt(splitData[2]);
        const selectedDate = splitData[3];
        const selectedTimeZone = parseInt(splitData[4]);

        //予約不可の時間帯は-1が返ってくるためそれを条件分岐
        if(selectedTimeZone !== -1){
          //選んだ時間が過去の時間かを判定する
          const targetDateTime = new Date(`${selectedDate} ${9+selectedTimeZone}:00`).getTime() - 9*60*60*1000;
          console.log('targetDateTime:',targetDateTime);
          const nowTime = new Date().getTime();
          console.log('nowTime:',nowTime);
          if(targetDateTime>nowTime){
            confirmation(ev,orderedMenu,selectedTime,selectedDate,selectedTimeZone);
          }else{
            return client.replyMessage(ev.replyToken,{
              "type":"text",
              "text":"申し訳ありません。過去の時間は選べません><;"
            });
          }
        }else{
          return client.replyMessage(ev.replyToken,{
            "type":"text",
            "text":"申し訳ありません。この時間帯には予約可能な時間がありません><;"
          });
        }
    }
    
    else if(splitData[0] === 'yes'){
        const orderedMenu = splitData[1];
        const selectedDate = splitData[2];
        const fixedTime = parseInt(splitData[3]);
        const staffName = splitData[4];
       
        //施術時間の取得
        const treatTime = await calcTreatTime(ev.source.userId,orderedMenu);

        //予約日時の表記取得
        const date = dateConversion(fixedTime);

        //メニュー表記の取得
        const menuArray = orderedMenu.split('%');
        let menu = '';
        menuArray.forEach((value,index) => {
          if(index !== 0){
            menu += ',' + MENU[parseInt(value)];
          }else{
            menu += MENU[parseInt(value)];
          }
        })

        //予約完了時間の計算
        const endTime = fixedTime + treatTime*60*1000;

        //シフトデータの取得
        const select_query = {
          text: 'SELECT * FROM shifts;'
        }
        connection.query(select_query)
          .then(async(res)=>{
            if(res.rows.length){
              //予約確定前の最終チェック→予約ブッキング無しfalse、予約ブッキングありtrue
              const check = await finalCheck(ev,selectedDate,fixedTime,endTime,staffName);
              if(check === 'nextIs'){
                return client.replyMessage(ev.replyToken,{
                  "type":"text",
                  "text":"すでに次回予約が入っています><;"
                });
              }
              if(!check){
                const insertQuery = {
                  text:`INSERT INTO reservations.${staffName} (line_uid, name, scheduledate, starttime, endtime, menu, staff) VALUES($1,$2,$3,$4,$5,$6,$7);`,
                  values:[ev.source.userId,profile.displayName,selectedDate,fixedTime,endTime,orderedMenu,staffName]
                };
                connection.query(insertQuery)
                  .then(res=>{
                    console.log('データ格納成功！');
                    client.replyMessage(ev.replyToken,{
                      "type":"text",
                      "text":`${date}に${menu}で予約をお取りしたました（スタッフ：${staffName}）`
                    });
                    gmailSend(staffName,date,menu)
                      .then(message=>{console.log(message)})
                      .catch(e=>console.log(e));
                  })
                  .catch(e=>console.log(e));
              }else{
                return client.replyMessage(ev.replyToken,{
                  "type":"text",
                  "text":"先に予約を取られてしまいました><; 申し訳ありませんが、再度別の時間で予約を取ってください。"
                });
              }
            }else{
              console.log('スタッフデータが１件もありません');
            }
          })
    }
    
    else if(splitData[0] === 'no'){
      const orderedMenu = splitData[1];
      const selectedDate = splitData[2];
      const selectedTime = splitData[3];
      const num = parseInt(splitData[4]);
      if(num === -1){
        return client.replyMessage(ev.replyToken,{
          "type":"text",
          "text":"申し訳ありません。この時間帯には予約可能な時間がありません><;"
        });
      }else{
        confirmation(ev,orderedMenu,selectedDate,selectedTime,num);
      }
    }
    
    else if(splitData[0] === 'delete'){
      const staff = splitData[1];
      const id = parseInt(splitData[2]);

      const deleteQuery = {
        text:`DELETE FROM reservations.${staff} WHERE id = $1;`,
        values:[`${id}`]
      };
      connection.query(deleteQuery)
        .then(res=>{
          console.log('予約キャンセル成功');
          client.replyMessage(ev.replyToken,{
            "type":"text",
            "text":"予約をキャンセルしました。またのご予約をお願いします。"
          });
        })
        .catch(e=>console.log(e));
    }
}

const dateConversion = (timestamp) => {
  const d = new Date(parseInt(timestamp));
  const month = d.getMonth()+1;
  const date = d.getDate();
  const day = d.getDay();
  const hour = ('0' + (d.getHours()+9)).slice(-2);
  const min = ('0' + d.getMinutes()).slice(-2);
  console.log(`${month}月${date}日(${WEEK[day]}) ${hour}:${min}`);
  return `${month}月${date}日(${WEEK[day]}) ${hour}:${min}`;
}


const calcTreatTime = (id,menu) => {
  return new Promise((resolve,reject)=>{
    const selectQuery = {
      text: 'SELECT * FROM users WHERE line_uid = $1;',
      values: [`${id}`]
    };
    connection.query(selectQuery)
      .then(res=>{
        if(res.rows.length){
          const info = res.rows[0];
          const menuArray = menu.split('%');
          const treatArray = [info.cuttime,info.shampootime,info.colortime,info.spatime,INITIAL_TREAT[4],INITIAL_TREAT[5],INITIAL_TREAT[6]];
          let treatTime = 0;
          menuArray.forEach(value=>{
            treatTime += treatArray[parseInt(value)];
          });
          resolve(treatTime);
        }else{
          console.log('LINE　IDに一致するユーザーが見つかりません。');
          return;
        }
      })
      .catch(e=>console.log(e));
  });
}

const confirmation = (ev,menu,time,date,timeZone) => {

  //シフトデータの取得
  const select_query = {
    text:'SELECT * FROM shifts;'
  }
  connection.query(select_query)
    .then(async(res)=>{
      if(res.rows.length){
        //各スタッフの予約数
        const numberOfReservations = await getNumberOfReservations(date,res.rows);
        console.log('numberOfReservations:',numberOfReservations);
        const splitDate = date.split('-');
        const selectedTime = 9 + parseInt(time);

        //スタッフ人数分のreservableArrayを取得
        const reservableArray = [];
        for(let i=0; i<res.rows.length; i++){
          const staff_reservable = await checkReservable(ev,menu,time,date,res.rows[i]);
          reservableArray.push(staff_reservable);
        }
        // console.log('reservableArray=',reservableArray);

        //対象時間の候補抜き出し
        const targets = reservableArray.map( array => {
          return array[timeZone];
        });
        console.log('targets:',targets);

        //誰の予約とするかを決定する（その日の予約数が一番少ないスタッフ）
        const maskingArray = [];
        for(let i=0; i<targets.length; i++){
          if(targets[i].length){
            maskingArray.push(numberOfReservations[i]);
          }else{
            maskingArray.push(-1);
          }
        }
        console.log('maskignArray=',maskingArray);

        //予約可能かつ予約回数が一番少ないスタッフを選定する
        let tempNumber = 1000;
        let staffNumber;
        maskingArray.forEach((value,index)=>{
          if(value>=0 && value<tempNumber){
            tempNumber = value;
            staffNumber = index;
          }
        });
        const staffName = res.rows[staffNumber].name;

        const candidates = targets[staffNumber];
        console.log('candidates=',candidates);

        // const n_dash = (n>=candidates.length-1) ? -1 : n+1;
        // console.log('n_dash:',n_dash);

        // const proposalTime = dateConversion(candidates[n]);

        // return client.replyMessage(ev.replyToken,{
        //   "type":"flex",
        //   "altText":"menuSelect",
        //   "contents":
        //   {
        //     "type": "bubble",
        //     "body": {
        //       "type": "box",
        //       "layout": "vertical",
        //       "contents": [
        //         {
        //           "type": "text",
        //           "text":  `次回予約は${proposalTime}でよろしいですか？`,
        //           "size": "lg",
        //           "wrap": true
        //         }
        //       ]
        //     },
        //     "footer": {
        //       "type": "box",
        //       "layout": "horizontal",
        //       "contents": [
        //         {
        //           "type": "button",
        //           "action": {
        //             "type": "postback",
        //             "label": "はい",
        //             "data": `yes&${menu}&${date}&${candidates[n]}&${staffName}`
        //           }
        //         },
        //         {
        //           "type": "button",
        //           "action": {
        //             "type": "postback",
        //             "label": "いいえ",
        //             "data": `no&${menu}&${date}&${time}&${n_dash}`
        //           }
        //         }
        //       ]
        //     }
        //   }
        // });
      }else{
        console.log('スタッフデータが１件も入っていません');
      }
    })  
}

const checkNextReservation = (ev) => {
  return new Promise((resolve,reject)=>{
    const id = ev.source.userId;
    const nowTime = new Date().getTime();

    const selectStaffs = {
      text: 'SELECT * FROM shifts;'
    }
    connection.query(selectStaffs)
      .then(staff=>{
        const nextReservation = []
        staff.rows.forEach((obj,index)=>{
          const selectReservations = {
            text: `SELECT * FROM reservations.${obj.name};`
          };
          connection.query(selectReservations)
            .then(res=>{
              if(res.rows.length){
                const filtered = res.rows.filter(obj=>{
                  return ((obj.line_uid===id)&&(obj.starttime>=nowTime));
                });
                if(filtered.length) nextReservation.push(...filtered);
                console.log('filtered',filtered);
              }
              if(index === staff.rows.length-1) resolve(nextReservation);
            })
            .catch(e=>console.log(e));
        });
      })
      .catch(e=>console.log(e));
  });
}

const checkReservable = (ev,menu,time,date,staffInfo) => {
  return new Promise( async (resolve,reject)=>{
    const id = ev.source.userId;
    // const treatTime = await calcTreatTime(id,menu);

    const treatTime = MENU[menu].timeAndPrice[time][0];
    console.log('treatTime:',treatTime);
    const treatTimeToMs = treatTime*60*1000;

    const select_query = {
      text:`SELECT * FROM reservations.${staffInfo.name} WHERE scheduledate = $1 ORDER BY starttime ASC;`,
      values:[`${date}`]
    };

    connection.query(select_query)
      .then(res=>{
        console.log('res.rows:',res.rows);
        const reservedArray = res.rows.map(object=>{
          return [parseInt(object.starttime),parseInt(object.endtime)];
        });

        //各時間のタイムスタンプ
        // herokuサーバー基準なので、日本の時刻は９時間分進んでしまうため、引く
        const timeStamps = [];
        for(let i=OPENTIME; i<CLOSETIME+1; i++){
          timeStamps.push(new Date(`${date} ${i}:00`).getTime()-9*60*60*1000);
        }

        //この日の予約を各時間帯に関する予約へ分割し、それを3次元配列に格納していく。
        const separatedByTime = [];
        for(let i=0; i<CLOSETIME-OPENTIME; i++){
          const tempArray = [];
          reservedArray.forEach(array=>{
            //パターン0
            if(array[0]<=timeStamps[i] && (array[1]>timeStamps[i] && array[1]<timeStamps[i+1])){
              tempArray.push(array.concat([0]));
            }
            //パターン１
            else if((array[0]>timeStamps[i] && array[0]<timeStamps[i+1]) && array[1]>=timeStamps[i+1]){
              tempArray.push(array.concat([1]));
            }
            //パターン２
            else if((array[0]>timeStamps[i] && array[0]<timeStamps[i+1])&&(array[1]>array[0] && array[1]<timeStamps[i+1])){
              tempArray.push(array.concat([2]));
            }
            //パターン３
            else if(array[0]<=timeStamps[i] && array[1]>=timeStamps[i+1]){
              tempArray.push(array.concat([3]));
            }
          });
          separatedByTime.push(tempArray);
        }

        //ある時間帯の最後の要素がパターン0とパターン2の場合、次の時間帯の最初の要素を加える
        for(let i=0; i<separatedByTime.length; i++){
          //対象時間帯の予約が存在し、かつ最後の時間帯でない場合
          if(separatedByTime[i].length && i !== separatedByTime.length-1){
            //次の時間帯の予約が存在する場合
            if(separatedByTime[i+1].length){
              //パターン0,2の場合は、次の時間帯の最初の予約のstarttimeを加える
              const l = separatedByTime[i].length - 1;
              const pattern = separatedByTime[i][l][2];
              if(pattern === 0 || pattern === 2) separatedByTime[i].push(separatedByTime[i+1][0]);
            }
            else{
              //次の時間帯に予約が入っていなければとりあえず、timeStamps[i]から1時間+treatTime分のタイムスタンプを格納
              separatedByTime[i].push([timeStamps[i]+60*60*1000+treatTimeToMs]);
            }
          }
          //対象時間帯の予約が存在し、かつ最後の時間帯の場合（separatedByTime[i+1]を検知できないため特別扱いする）
          else if(separatedByTime[i].length && i === separatedByTime.length-1){
            const l = separatedByTime[i].length - 1;
            const pattern = separatedByTime[i][l][2];
            if(pattern === 0 || pattern === 2) separatedByTime[i].push([timeStamps[i] + 60*60*1000 + treatTimeToMs]);
          }
        }

        //予約と予約の間隔を格納する3次元配列を生成する
        const intervalArray = [];
        for(let i=0; i<separatedByTime.length; i++){
          //時間帯に予約が入っている場合
          if(separatedByTime[i].length){
            //separatedByTime[i]の先頭のパターンを取得
            const pattern = separatedByTime[i][0][2];
            //パターン0,2の場合
            if(pattern === 0 || pattern === 2){
              const tempArray = [];
              for(let j=0; j<separatedByTime[i].length-1; j++){
                tempArray.push([separatedByTime[i][j+1][0]-separatedByTime[i][j][1], separatedByTime[i][j][1]]);
              }
              console.log('temparray in 0 or 2:',tempArray);
              intervalArray.push(tempArray);
            }else if(pattern === 1){
              intervalArray.push([[separatedByTime[i][0][0]-timeStamps[i],timeStamps[i]]]);
            }else if(pattern === 3){
              intervalArray.push([]);
            }
          }else if(i<separatedByTime.length-1 && separatedByTime[i+1].length){
            intervalArray.push([[separatedByTime[i+1][0][0] - timeStamps[i],timeStamps[i]]]);
          }else{
            intervalArray.push([[60*60*1000+treatTime*60*1000,timeStamps[i]]]);
          }      
        }

        //reservableArrayを生成
        const reservableArray = [];
        intervalArray.forEach(array2=>{
          const tempArray = [];
          array2.forEach(array=>{
            let interval = array[0];
            let target = array[1];
            while(interval>treatTimeToMs){
              tempArray.push(target);
              interval -= treatTimeToMs;
              target += treatTimeToMs;
            }            
          });
          reservableArray.push(tempArray);
        });

        //シフトデータを配列化する
          //staffInfoのupdatedatと予約希望日の差を求める
        const date_ts = new Date(date).getTime() - 9*60*60*1000; //予約希望日のタイムスタンプ(0:00)
        if(date_ts-staffInfo.updatedat<24*60*60*1000*NUMBER_OF_SHIFTS){
          //予約希望日とシフトデータ更新日の差を算出する
          const differential = Math.floor((date_ts-staffInfo.updatedat)/(24*60*60*1000));
          console.log('date_ts,staffinfo',date_ts,staffInfo.updatedat);
          console.log('date_ts-staffInfo.updatedat',date_ts-staffInfo.updatedat);
          console.log('differential:',differential);
          const shift = [];
          for(let i=OPENTIME; i<CLOSETIME; i++){
            shift.push(staffInfo[`d${differential}h${i}`]);
          }
          console.log('shift:',shift);
          //シフトによりマスキング
          const filteredArray = [];
          reservableArray.forEach((value,index) => {
            if(shift[index]){
              filteredArray.push(value);
            }else{
              filteredArray.push([]);
            }
          });
          resolve(filteredArray);
        }else{
          console.log('スタッフのシフトデータが入力されていません');
        }
      })
      .catch(e=>console.log(e));
  });
}

const finalCheck = (ev,date,startTime,endTime,staffName) => {
  return new Promise(async (resolve,reject) => {
    const select_query = {
      text:`SELECT * FROM reservations.${staffName} WHERE scheduledate = '${date}';`
    }
    //次回予約が入っているか確認
    const nexrReservation = await checkNextReservation(ev);
    if(nexrReservation.length){
      resolve('nextIs');
    }else{
      connection.query(select_query)
      .then(res=>{
        if(res.rows.length){
          const check = res.rows.some(object=>{
            return ((startTime>object.starttime && startTime<object.endtime)
            || (startTime<=object.starttime && endTime>=object.endtime)
            || (endTime>object.starttime && endTime<object.endtime));
          });
          resolve(check);
        }else{
          resolve(false);
        }
      })
      .catch(e=>console.log(e));
    }
  });
}

//予約選択日における各スタッフの予約数を取得する
const getNumberOfReservations = (date,shiftInfo) => { 
  return new Promise((resolve,reject) => {
    const numberOfReservations = [];
    for(let i=0; i<shiftInfo.length; i++){
      const select_query = {
        text:`SELECT * FROM reservations.${shiftInfo[i].name} WHERE scheduledate = $1;`,
        values:[`${date}`]
      }
      connection.query(select_query)
        .then(res=>{
          if(res.rows.length){
            console.log('res.rows.length=',res.rows.length);
            numberOfReservations.push(res.rows.length);
          }else{
            numberOfReservations.push(0);
          }
          if(i === shiftInfo.length - 1) resolve(numberOfReservations);
        })
        .catch(e=>console.log(e));
    }
  })
}

//Gmail送信設定
const gmailSend = (staffName,date,menu) => {
  return new Promise((resolve,reject)=> {
    const select_query = {
      text: `SELECT email FROM shifts WHERE name='${staffName}';`
    };
    connection.query(select_query)
      .then(address=>{

        //Gmail送信設定
        const message = {
          from: 'kentaro523@gmail.com',
          to: address.rows[0].email,
          subject: `${staffName}さんに予約が入りました！！`,
          text: `${date}に${menu}で予約が入りました！`
        };

        const auth = {
          type: 'OAuth2',
          user: 'kentaro523@gmail.com',
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
          resolve('gmail送信成功');
        });
      })
      .catch(e=>console.log(e));
  })
}