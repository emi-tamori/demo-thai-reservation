(()=>{
    const API_URL = 'https://linebot-reservation.herokuapp.com/api/';
    const HEADERS = ['ID','名前','登録日','Cut','Shampoo','Color','Spa','次回予約'];
    const CLASSES = ['row-id','row-name','row-resist','row-cut','row-shampoo','row-color','row-spa','row-nextrev'];

    window.addEventListener('load',()=>{
        fetchData();
    });

    const fetchData = async () => {
        try{
            const response = await fetch(API_URL);
            console.log('response:',response);
            if(response.ok){
                const data = await response.json();
                console.log('data:',data);
                createTable(data);
            }else{
                alert('HTTPレスポンスエラーです')
            }
        }catch(error){
            console.log('error:',error);
            alert('データ読み込み失敗です');
        }
    }

    const createTable = (data) => {
        // div要素の取得
        const divElement = document.getElementById('usersPage');

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

            // revData.starttimeを日時文字列へ変換する
            const nextReservationDate = (revData.length) ? timeConversion(parseInt(revData[0].starttime),1) : '予約なし';

            // usersObj.timestampを日時文字列へ変換する
            const resistrationDate = timeConversion(parseInt(usersObj.timestamp),0);

            // usersData配列へ配列を格納
            usersData.push([
                usersObj.id,
                usersObj.display_name,
                resistrationDate,
                usersObj.cuttime,
                usersObj.shampootime,
                usersObj.colortime,
                usersObj.spatime,
                nextReservationDate
            ]);
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
                    th.setAttribute('class',`uTitles ${CLASSES[index]}`);
                    th.innerHTML = value;
                    tr.appendChild(th);
                }else{
                    // ２行目以降はユーザーデータを格納する要素とする
                    const td = document.createElement('td');
                    td.setAttribute('class',`uElements ${CLASSES[index]}`);
                    td.innerHTML = usersData[i-1][index];

                    // 施術時間をクリックした時の処理
                    if(index >= 3 && index <= 6){
                        td.addEventListener('click',(e)=>{
                            const x = e.pageX;
                            const y = e.pageY;
                            createDialog(usersData[i-1],x,y);
                        })
                    }
                    tr.appendChild(td);
                }
            });
        }
        divElement.appendChild(table);
    }

    const createDialog = (userDataArray,x,y) => {

        // カード本体の定義
        const div1 = document.createElement('div');
        div1.setAttribute('class','card text-white bg-primary card-user');
        div1.style.top = `${y}px`;
        div1.style.left = `${x/2}px`;

        // カードヘッダーの定義
        const div2 = document.createElement('div');
        div2.setAttribute('class','card-header');
        div2.innerHTML = `お客さまID:${userDataArray[0]}`;
        div1.appendChild(div2);

        // カードボディの定義
        const div3 = document.createElement('div');
        div3.setAttribute('class','card-body');

        // form要素の生成
        const formElement = document.createElement('form');
        formElement.setAttribute('id','userForm');
        formElement.setAttribute('name','userInfo');
        formElement.setAttribute('method','post');

        // 名前入力フォームの生成
        const div_form1 = document.createElement('div');
        div_form1.setAttribute('class','form-group');

        const label_form1 = document.createElement('label');
        label_form1.setAttribute('class','label_user');
        label_form1.innerHTML = '名前';
        div_form1.appendChild(label_form1);

        const input_form1 = document.createElement('input');
        input_form1.setAttribute('type','text');
        input_form1.setAttribute('class','form-control name-input');
        input_form1.setAttribute('name','name');
        input_form1.value = userDataArray[1];
        input_form1.disabled = true;
        div_form1.appendChild(input_form1);

        formElement.appendChild(div_form1);

        // カット時間入力フォームの生成
        const div_form2 = document.createElement('div');
        div_form2.setAttribute('class','form-group inline-block menu-time');

        const label_form2 = document.createElement('label');
        label_form2.setAttribute('class','label_user');
        label_form2.textContent = 'Cut';
        div_form2.appendChild(label_form2);

        const input_form2 = document.createElement('input');
        input_form2.setAttribute('type','text');
        input_form2.setAttribute('class','form-control time-input');
        input_form2.setAttribute('name','cuttime');
        input_form2.value = userDataArray[3];
        input_form2.disabled = true;
        div_form2.appendChild(input_form2);

        formElement.appendChild(div_form2);

        // シャンプー時間の入力フォーム生成
        const div_form3 = document.createElement('div');
        div_form3.setAttribute('class','form-group inline-block');

        const label_form3 = document.createElement('label');
        label_form3.setAttribute('class','label_user');
        label_form3.textContent = 'Shampoo';
        div_form3.appendChild(label_form3);

        const input_form3 = document.createElement('input');
        input_form3.setAttribute('type','text');
        input_form3.setAttribute('class','form-control time-input');
        input_form3.setAttribute('name','shampootime');
        input_form3.value = userDataArray[4];
        input_form3.disabled = true;
        div_form3.appendChild(input_form3);

        formElement.appendChild(div_form3);

        // カラーリング時間の入力フォーム生成
        const div_form4 = document.createElement('div');
        div_form4.setAttribute('class','form-group inline-block menu-time');

        const label_form4 = document.createElement('label');
        label_form4.setAttribute('class','label_user');
        label_form4.textContent = 'Color';
        div_form4.appendChild(label_form4);

        const input_form4 = document.createElement('input');
        input_form4.setAttribute('type','text');
        input_form4.setAttribute('class','form-control time-input');
        input_form4.setAttribute('name','colortime');
        input_form4.value = userDataArray[5];
        input_form4.disabled = true;
        div_form4.appendChild(input_form4);

        formElement.appendChild(div_form4);

        // ヘッドスパ時間の入力フォーム生成
        const div_form5 = document.createElement('div');
        div_form5.setAttribute('class','form-group inline-block');

        const label_form5 = document.createElement('label');
        label_form5.setAttribute('class','label_user');
        label_form5.textContent = 'Spa';
        div_form5.appendChild(label_form5);

        const input_form5 = document.createElement('input');
        input_form5.setAttribute('type','text');
        input_form5.setAttribute('class','form-control time-input');
        input_form5.setAttribute('name','spatime');
        input_form5.value = userDataArray[6];
        input_form5.disabled = true;
        div_form5.appendChild(input_form5);

        formElement.appendChild(div_form5);

        // 子要素の親要素へのappendChild
        div3.appendChild(formElement);
        div1.appendChild(div3);

        // ボタン要素の作成
        const divButton = document.createElement('div');
        divButton.setAttribute('id','usercard-button-area');

        //編集ボタンの作成
        const editButton = document.createElement('input');
        editButton.setAttribute('class','btn btn-warning card-button');
        editButton.value = '編集';
        editButton.type = 'button';

        //編集ボタンクリック時の動作
        editButton.addEventListener('click',()=>{
            //各インプットの入力をできるようにする
            input_form1.disabled = false;
            input_form2.disabled = false;
            input_form3.disabled = false;
            input_form4.disabled = false;
            input_form5.disabled = false;
            deleteButton.style.display = 'none';
        });

        divButton.appendChild(editButton);

        //削除ボタンの作成
        const deleteButton = document.createElement('input');
        deleteButton.setAttribute('class','btn btn-danger card-button');
        deleteButton.value = '削除';
        deleteButton.type = 'button';

        divButton.appendChild(deleteButton);
        div1.appendChild(divButton);

        document.body.appendChild(div1);
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