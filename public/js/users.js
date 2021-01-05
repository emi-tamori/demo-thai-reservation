(()=>{
    const API_URL = 'https://linebot-schedule.herokuapp.com/api/';
    const HEADERS = ['ID','名前','登録日','次回予約','来店回数'];
    const CLASSES = ['row-id','row-name','row-resist','row-nextrev','row-visit'];
    
    // div要素の取得
    const divElement = document.getElementById('usersPage');

    window.addEventListener('load',()=>{
        displaySpinner();
        fetchData();
    });

    const fetchData = async () => {
        try{
            const response = await fetch(API_URL);
            console.log('response:',response);
            if(response.ok){
                const data = await response.json();
                console.log('data:',data);
                divElement.innerHTML = '';
                createTable(data);
            }else{
                alert('HTTPレスポンスエラーです')
            }
        }catch(error){
            console.log('error:',error);
            alert('データ読み込み失敗です');
        }
    }

    //ローディング中スピナー生成
    const displaySpinner = () => {
        const divSpinner = document.createElement('div');
        divSpinner.setAttribute('class','spinner-grow text-primary spinner');
        divSpinner.setAttribute('role','status');
        const spanText = document.createElement('span');
        spanText.setAttribute('class','sr-only');
        spanText.innerHTML = 'Now Loading...';
        divSpinner.appendChild(spanText);
        divElement.appendChild(divSpinner);
    }

    const createTable = (data) => {

        //表題
        const title = document.createElement('p');
        title.setAttribute('class','top-font');
        title.innerHTML = 'お客さま管理ページ';
        divElement.appendChild(title);

        //スタッフ名のみ配列化する
        const STAFFS = [];
        data.staffs.forEach(obj=>{
        STAFFS.push(obj.name);
        });

        console.log('reservationdata',data.reservations);

        // data.usersを２次元配列の形にする
        const usersData = [];
        data.users.forEach(usersObj=>{

            // 現在時刻のタイムスタンプ取得
            const now = new Date().getTime();

            // data.reservationsからdata.usersのline_uidが一致するもの、かつ現在時刻より先の予約データのみを抽出
            const revData = data.reservations.filter(revObj1=>{
                return usersObj.line_uid === revObj1.line_uid;
            }).filter(revObj2=>{
                return parseInt(revObj2.starttime) > now;
            });
            console.log('revData:',revData);
            // revData.starttimeを日時文字列へ変換する
            const nextReservationDate = (revData.length) ? timeConversion(parseInt(revData[0].starttime),1) : '予約なし';

            // usersObj.timestampを日時文字列へ変換する
            const resistrationDate = timeConversion(parseInt(usersObj.timestamp),0);

            // usersData配列へ配列を格納
            usersData.push([
                usersObj.id,
                usersObj.display_name,
                resistrationDate,
                nextReservationDate,
                usersObj.visits
            ]);

            //idの昇順に並び替え
            usersData.sort((a,b)=>{
                if(a[0] < b[0]) return -1;
                if(a[0] > b[0]) return 1;
                return 0;
            });
        });

        // 次回予約日を計算し、usersDataへpushする
        const l = usersData.length+1;  //表題の分＋１している

        // テーブル要素の生成
        const table = document.createElement('table');
        table.setAttribute('id','usersTable');

        for(let i=0;i<l;i++){
            //tr要素の挿入
            const tr = table.insertRow(-1);

            HEADERS.forEach((value,index)=>{
                if(i===0){
                    // 最初の行は表題（th）とする
                    const th = document.createElement('th');
                    th.setAttribute('class',`uTitles`);
                    th.innerHTML = value;
                    tr.appendChild(th);
                }else{
                    // ２行目以降はユーザーデータを格納する要素とする
                    const td = document.createElement('td');
                    td.setAttribute('class',`uElements ${CLASSES[index]}`);
                    td.innerHTML = usersData[i-1][index];

                    tr.appendChild(td);
                }
            });
        }
        divElement.appendChild(table);
    }

    const timeConversion = (timestamp,mode) => {
        console.log('timestamp in conversion',timestamp);
        const date = new Date(timestamp);
        const y = date.getFullYear();
        const m = ("0" + (date.getMonth()+1)).slice(-2);
        const d = ("0" + date.getDate()).slice(-2);
        const h = ("0" + date.getHours()).slice(-2);
        const i = ("0" + date.getMinutes()).slice(-2);

        if(mode === 0){
            return `${y}/${m}/${d}`
        }else{
            return `${y}/${m}/${d} ${h}:${i}`
        }
    }

})();