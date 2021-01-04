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
  }
}