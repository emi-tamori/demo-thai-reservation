module.exports = {
  makeTimeChoice: ()=> {
    const jsonText = {
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
                "label": "メニュー１",
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
                "label": "メニュー２",
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
                "label": "メニュー3",
                "data": "menu&2"
              },
              "margin": "md",
              "style": "primary",
              "adjustMode": "shrink-to-fit"
            }
          ]
        }
      }
    };
    const toObj = JSON.parse(jsonText);
    console.log(toObj);
    console.log('obj',toObj.type);
    return jsonText;
  }
}