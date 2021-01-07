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
    timeAndPrice: [[30,3000],[60,5000]]
  }
]

const WEEK = [ "日", "月", "火", "水", "木", "金", "土" ];

// const createDateOptions = (stampArray) => {
//   const options = [];
//   stampArray.forEach(stamp=>{
//     const modifiedStamp = stamp + 9*60*60*1000;
//     const year = new Date(modifiedStamp).getFullYear();
//     const month = new Date(modifiedStamp).getMonth()+1;
//     const date = new Date(modifiedStamp).getDate();
//     const week = WEEK[new Date(modifiedStamp).getDay()];
//     const hour = new Date(modifiedStamp).getHours();
//     const minutes = ('0'+new Date(modifiedStamp).getMinutes()).slice(-2);
//     const text = `${year}/${month}/${date}(${week})  ${hour}:${minutes}〜`;
//     options.push(text);
//   });
//   return options;
// }

module.exports = {

  //メニュー選択メッセージ
  makeMenuChoice: ()=> {
    const menuChoice = {
      "type":"flex",
      "altText":"メニュー選択",
      "contents":
      {
        "type": "bubble",
        "header": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "メニューをお選びください",
              "size": "lg"
            },
            {
              "type": "separator"
            }
          ]
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "postback",
                "label": `${MENU[0].menu}`,
                "data": "menu&0"
              },
              "style": "primary",
              "margin": "md",
              "adjustMode": "shrink-to-fit"
            },
            {
              "type": "button",
              "action": {
                "type": "postback",
                "label": `${MENU[1].menu}`,
                "data": "menu&1"
              },
              "style": "primary",
              "margin": "md",
              "adjustMode": "shrink-to-fit"
            },
            {
              "type": "button",
              "action": {
                "type": "postback",
                "label": `${MENU[2].menu}`,
                "data": "menu&2"
              },
              "margin": "md",
              "style": "primary",
              "adjustMode": "shrink-to-fit"
            }
          ]
        }
      }
    }
    return menuChoice;
  },

  //時間選択メッセージ
  makeTimeChoice: (menuNumber) => {
    if(menuNumber === 0){
      const menuChoice = {
        "type":"flex",
        "altText":"メニュー選択",
        "contents":
        {
          "type": "bubble",
          "header": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "施術時間をお選びください",
                "size": "lg"
              }
            ]
          },
          "hero": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": `${MENU[0].menu}`,
                "align": "center",
                "adjustMode": "shrink-to-fit",
                "size": "md"
              },
              {
                "type": "separator",
                "margin": "sm"
              }
            ]
          },
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[0].timeAndPrice[0][0]}分　${MENU[0].timeAndPrice[0][1].toLocaleString()}円`,
                  "data": `end&0&0`
                },
                "style": "primary",
                "margin": "md"
              },
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[0].timeAndPrice[1][0]}分　${MENU[0].timeAndPrice[1][1].toLocaleString()}円`,
                  "data": "end&0&1"
                },
                "style": "primary",
                "margin": "md"
              },
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[0].timeAndPrice[2][0]}分　${MENU[0].timeAndPrice[2][1].toLocaleString()}円`,
                  "data": "end&0&2"
                },
                "style": "primary",
                "margin": "md"
              },
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[0].timeAndPrice[3][0]}分　${MENU[0].timeAndPrice[3][1].toLocaleString()}円`,
                  "data": "end&0&3"
                },
                "style": "primary",
                "margin": "md"
              },
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[0].timeAndPrice[4][0]}分　${MENU[0].timeAndPrice[4][1].toLocaleString()}円`,
                  "data": "end&0&4"
                },
                "style": "primary",
                "margin": "md"
              }
            ]
          }
        }
      }
      return menuChoice;

    }else if(menuNumber === 1){
      const menuChoice = {
        "type":"flex",
        "altText":"メニュー選択",
        "contents":
        {
          "type": "bubble",
          "header": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "施術時間をお選びください",
                "size": "lg"
              }
            ]
          },
          "hero": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": `${MENU[1].menu}`,
                "align": "center",
                "adjustMode": "shrink-to-fit",
                "size": "md"
              },
              {
                "type": "separator",
                "margin": "sm"
              }
            ]
          },
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[1].timeAndPrice[0][0]}分　${MENU[1].timeAndPrice[0][1].toLocaleString()}円`,
                  "data": `end&1&0`
                },
                "style": "primary",
                "margin": "md"
              },
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[1].timeAndPrice[1][0]}分　${MENU[1].timeAndPrice[1][1].toLocaleString()}円`,
                  "data": "end&1&1"
                },
                "style": "primary",
                "margin": "md"
              },
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[1].timeAndPrice[2][0]}分　${MENU[1].timeAndPrice[2][1].toLocaleString()}円`,
                  "data": "end&1&2"
                },
                "style": "primary",
                "margin": "md"
              },
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[1].timeAndPrice[3][0]}分　${MENU[1].timeAndPrice[3][1].toLocaleString()}円`,
                  "data": "end&1&3"
                },
                "style": "primary",
                "margin": "md"
              }
            ]
          }
        }
      }
      return menuChoice;

    }else if(menuNumber === 2){
      const menuChoice = {
        "type":"flex",
        "altText":"メニュー選択",
        "contents":
        {
          "type": "bubble",
          "header": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "施術時間をお選びください",
                "size": "lg"
              }
            ]
          },
          "hero": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": `${MENU[2].menu}`,
                "align": "center",
                "adjustMode": "shrink-to-fit",
                "size": "md"
              },
              {
                "type": "separator",
                "margin": "sm"
              }
            ]
          },
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[2].timeAndPrice[0][0]}分　${MENU[2].timeAndPrice[0][1].toLocaleString()}円`,
                  "data": `end&2&0`
                },
                "style": "primary",
                "margin": "md"
              },
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[2].timeAndPrice[1][0]}分　${MENU[2].timeAndPrice[1][1].toLocaleString()}円`,
                  "data": "end&2&1"
                },
                "style": "primary",
                "margin": "md"
              }
            ]
          }
        }
      }
      return menuChoice;
    }
  },

  makeDateChoice: (menu,time) => {
    const dateChoice = {
      "type":"flex",
      "altText":"予約日選択",
      "contents":
      {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "来店希望日を選んでください。",
              "size": "md",
              "align": "center"
            }
          ]
        },
        "footer": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "datetimepicker",
                "label": "希望日を選択する",
                "data": `date&${menu}&${time}`,
                "mode": "date"
              }
            }
          ]
        }
      }
    }
    return dateChoice;
  },

  //希望時間帯メッセージ
  askTime: (menu,time,date,timeArray,color) => {
    const askTimeMessage = {
      "type":"flex",
      "altText":"予約時間帯選択",
      "contents":
      {
        "type": "bubble",
        "header": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
            "type": "text",
            "text": `${date}`,
            "weight": "bold",
            "size": "lg",
            "align": "center"
            }
          ]
        },
        "hero": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "ご希望の時間帯を選択してください(緑＝予約可能、赤＝予約不可)",
              "align": "start",
              "wrap":true,
              "size":"lg"
            }
          ]
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "12時-",
                    "data": `time&${menu}&${time}&${date}&${timeArray[0]}`
                  },
                  "style": "primary",
                  "color": `${color[0]}`,
                  "margin": "md"
                },
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "13時-",
                    "data": `time&${menu}&${time}&${date}&${timeArray[1]}`
                  },
                  "style": "primary",
                  "color": `${color[1]}`,
                  "margin": "md"
                },
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "14時-",
                    "data": `time&${menu}&${time}&${date}&${timeArray[2]}`
                  },
                  "style": "primary",
                  "color": `${color[2]}`,
                  "margin": "md"
                }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "15時-",
                    "data": `time&${menu}&${time}&${date}&${timeArray[3]}`
                  },
                  "style": "primary",
                  "color": `${color[3]}`,
                  "margin": "md"
                },
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "16時-",
                    "data": `time&${menu}&${time}&${date}&${timeArray[4]}`
                  },
                  "style": "primary",
                  "color": `${color[4]}`,
                  "margin": "md"
                },
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "17時-",
                    "data": `time&${menu}&${time}&${date}&${timeArray[5]}`
                  },
                  "style": "primary",
                  "color": `${color[5]}`,
                  "margin": "md"
                }
              ],
              "margin": "md"
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "18時-",
                    "data": `time&${menu}&${time}&${date}&${timeArray[6]}`
                  },
                  "style": "primary",
                  "color": `${color[6]}`,
                  "margin": "md"
                },
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "19時-",
                    "data": `time&${menu}&${time}&${date}&${timeArray[7]}`
                  },
                  "style": "primary",
                  "color": `${color[7]}`,
                  "margin": "md"
                },
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "20時-",
                    "data": `time&${menu}&${time}&${date}&${timeArray[8]}`
                  },
                  "style": "primary",
                  "color": `${color[8]}`,
                  "margin": "md"
                }
              ],
              "margin": "md"
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "21時-",
                    "data": `time&${menu}&${time}&${date}&${timeArray[9]}`
                  },
                  "style": "primary",
                  "color": `${color[9]}`,
                  "margin": "md"
                },
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "22時-",
                    "data": `time&${menu}&${time}&${date}&${timeArray[10]}`
                  },
                  "style": "primary",
                  "color": `${color[10]}`,
                  "margin": "md"
                },
                {
                  "type": "button",
                  "action": {
                    "type": "postback",
                    "label": "23時-",
                    "data": `time&${menu}&${time}&${date}&${timeArray[11]}`
                  },
                  "style": "primary",
                  "color": `${color[11]}`,
                  "margin": "md"
                }
              ],
              "margin": "md"
            }
          ]
        }
      }
    }
    return askTimeMessage;
  },

  makeProposal: (menu,time,date,timeZone,candidates,staffName) => {
    // const numberOfProposal = candidates.length;
    // const options = createDateOptions(candidates);
    
    //numberOfProposalは４つで固定（00分、15分、30分、45分）
    const timeFlag = [-1,-1,-1,-1] //（00分、15分、30分、45分）の選択肢が存在するかのフラグ
    candidates.forEach((timestamp,index)=>{
      const minutes = new Date(timestamp).getMinutes();
      timeFlag[minutes/15] = index;
    });
    console.log('timeflag',timeFlag);

    const colorArray = [];
    const postbackData = [];
    const labelArray = [];

    timeFlag.forEach((value,index)=>{
      //ラベル表示用文字列生成
      const labelText = new Date(`${date} ${OPENTIME+timeZone}:${('0'+15*index).slice(-2)}`);
      // const modifiedStamp = parseInt(candidates[index]) + 9*60*60*1000;
      // console.log('ts',modifiedStamp);
      // const year = new Date(modifiedStamp).getFullYear();
      // const month = new Date(modifiedStamp).getMonth()+1;
      // const day = new Date(modifiedStamp).getDate();
      // const week = WEEK[new Date(modifiedStamp).getDay()];
      // const hour = new Date(modifiedStamp).getHours();
      // const minutes = ('0'+new Date(modifiedStamp).getMinutes()).slice(-2);
      // const labelText = `${year}/${month}/${day}(${week})  ${hour}:${minutes}〜`;
      labelArray.push(labelText);
      if(value === -1){
        colorArray.push('#FF0000');
        postbackData.push('no');
      }else{
        colorArray.push('#00AA00');
        postbackData.push(`yes&${menu}&${time}&${date}&${candidates[value]}&${staffName}`);
      }
    });
    console.log('postbackData',postbackData);
    
    const proposalMessage = {
      "type":"flex",
      "altText":"来店希望日時選択",
      "contents":
      {
        "type": "bubble",
        "header": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "希望時間をお選びください",
              "size": "lg"
            }
          ]
        },
        "hero": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": `${MENU[menu].menu} ${MENU[menu].timeAndPrice[time][0]}分`,
              "align": "center",
              "adjustMode": "shrink-to-fit",
              "size": "md",
              // "wrap": true
            },
            {
              "type": "separator",
              "margin": "sm"
            }
          ]
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "postback",
                "label": `${labelArray[0]}`,
                "data": `${postbackData[0]}`
              },
              "style": "primary",
              "color": `${colorArray[0]}`,
              "margin": "md"
            },
            {
              "type": "button",
              "action": {
                "type": "postback",
                "label": `${labelArray[1]}`,
                "data": `${postbackData[1]}`
              },
              "style": "primary",
              "color": `${colorArray[1]}`,
              "margin": "md"
            },
            {
              "type": "button",
              "action": {
                "type": "postback",
                "label": `${labelArray[2]}`,
                "data": `${postbackData[2]}`
              },
              "style": "primary",
              "color": `${colorArray[2]}`,
              "margin": "md"
            },
            {
              "type": "button",
              "action": {
                "type": "postback",
                "label": `${labelArray[3]}`,
                "data": `${postbackData[3]}`
              },
              "style": "primary",
              "color": `${colorArray[3]}`,
              "margin": "md"
            }
          ]
        }
      }
    }
    return proposalMessage;
  },

  makaDeleteMessage: (date,treatTime,menu,staff,id) => {
    const deleteMessage = {
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
    }
    return deleteMessage;
  },

  makeToAdministration: ()=>{
    const message = {
      "type":"flex",
      "altText":"FlexMessage",
      "contents":
        {
          "type": "bubble",
          "header": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "管理者画面へ移動しますか?",
                "color": "#ffffff"
              }
            ]
          },
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "button",
                "action": {
                  "type": "uri",
                  "label": "管理者画面へ",
                  // "uri": "line://app/1654221139-OvDreMvj"
                  "uri": "https://linebot-schedule.herokuapp.com/"
                },
                "style": "link"
              }
            ]
          },
          "styles": {
            "header": {
              "backgroundColor": "#0000ff",
              "separator": true,
              "separatorColor": "#ffffff"
            }
          }
        }
    }
    return message;
  }
}