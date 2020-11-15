module.exports = {
    orderChoice : (ev,selected) => {
        console.log('selected:',selected);

        let selectedNew = '';

        if(selected.match(/%/)){
            const ordersArray = selected.split('%');
            
            // 重複チェック
            const duplicationRemovedArray = new Set(ordersArray);
            if(duplicationRemovedArray.size === ordersArray.length){
            selectedNew = selected;
            }else{
            ordersArray.pop();
            ordersArray.forEach((value,index)=>{
                selectedNew += index === 0 ? value : '%' + value;
            });
            }
        }else{
            selectedNew = selected;
        }
        
        const orderedArrayNew = selectedNew.split('%');

        // 数値型変換および昇順ソート
        const parsedArray = orderedArrayNew.map(value=>{
            return parseInt(value);
        }).sort((a,b)=>{
            return (a<b ? -1:1);
        });

        // タイトルと選択メニュー表示
        let title = '';
        let menu = '';
        if(selectedNew){
            title = '他にご希望はありますか？'
            parsedArray.forEach((value,index)=>{
            menu += index !== 0 ? ',' + MENU[value] : '選択中：' + MENU[value];
            });
        }else{
            title = 'メニューを選択してください';
            menu = '(複数選択可能です)';
        }

        //ボタン配色
        const colors = [];
        for(let i=0;i<7;i++){
            if(parsedArray.some(num=> num === i)){
            colors.push('#00AA00');
            }else{
            colors.push('#999999');
            }
        }

        return client.replyMessage(ev.replyToken,{
            "type":"flex",
            "altText":"menuSelect",
            "contents":
            {
                "type": "bubble",
                "header": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                    {
                        "type": "text",
                        "text": `${title}`,
                        "align": "center",
                        "size": "lg",
                        "wrap":true
                    }
                    ]
                },
                "hero": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                    {
                        "type": "text",
                        "text": `${menu}`,
                        "size": "md",
                        "align": "center",
                        "wrap":true
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
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                        {
                            "type": "button",
                            "action": {
                            "type": "postback",
                            "label": "カット",
                            "data": `menu&${selectedNew}&0`
                            },
                            "style": "primary",
                            "color": `${colors[0]}`,
                            "margin": "md"
                        },
                        {
                            "type": "button",
                            "action": {
                            "type": "postback",
                            "label": "シャンプー",
                            "data": `menu&${selectedNew}&1`
                            },
                            "style": "primary",
                            "color": `${colors[1]}`,
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
                            "label": "ｶﾗｰﾘﾝｸﾞ",
                            "data": `menu&${selectedNew}&2`
                            },
                            "margin": "md",
                            "style": "primary",
                            "color": `${colors[2]}`
                        },
                        {
                            "type": "button",
                            "action": {
                            "type": "postback",
                            "label": "ヘッドスパ",
                            "data": `menu&${selectedNew}&3`
                            },
                            "margin": "md",
                            "style": "primary",
                            "color": `${colors[3]}`
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
                            "label": "ﾏｯｻｰｼﾞ&ﾊﾟｯｸ",
                            "data": `menu&${selectedNew}&4`
                            },
                            "margin": "md",
                            "style": "primary",
                            "color": `${colors[4]}`
                        },
                        {
                            "type": "button",
                            "action": {
                            "type": "postback",
                            "label": "顔そり",
                            "data": `menu&${selectedNew}&5`
                            },
                            "style": "primary",
                            "color": `${colors[5]}`,
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
                            "label": "眉整え",
                            "data": `menu&${selectedNew}&6`
                            },
                            "margin": "md",
                            "style": "primary",
                            "color": `${colors[6]}`
                        },
                        {
                            "type": "button",
                            "action": {
                            "type": "postback",
                            "label": "選択終了",
                            "data": `end&${selectedNew}`
                            },
                            "margin": "md",
                            "style": "primary",
                            "color": "#0000ff"
                        }
                        ],
                        "margin": "md"
                    },
                    {
                        "type": "separator"
                    }
                    ]
                }
                }
        });
    }
}