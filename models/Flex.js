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
                "text": "選択したメニュー",
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
                  "data": `menu&0&0`
                },
                "style": "primary",
                "margin": "md"
              },
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[0].timeAndPrice[1][0]}分　${MENU[0].timeAndPrice[1][1].toLocaleString()}円`,
                  "data": "menu&0&1"
                },
                "style": "primary",
                "margin": "md"
              },
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[0].timeAndPrice[2][0]}分　${MENU[0].timeAndPrice[2][1].toLocaleString()}円`,
                  "data": "menu&0&2"
                },
                "style": "primary",
                "margin": "md"
              },
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[0].timeAndPrice[3][0]}分　${MENU[0].timeAndPrice[3][1].toLocaleString()}円`,
                  "data": "menu&0&3"
                },
                "style": "primary",
                "margin": "md"
              },
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": `${MENU[0].timeAndPrice[4][0]}分　${MENU[0].timeAndPrice[4][1].toLocaleString()}円`,
                  "data": "menu&0&4"
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
  }
}