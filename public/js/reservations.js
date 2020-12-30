(()=>{
  const API_URL = 'https://linebot-reservation2.herokuapp.com/api/';
  const WEEKS = ["日", "月", "火", "水", "木", "金", "土"];
  const ONEHOUR = 60*60*1000;
  const ONEDAY = 24*ONEHOUR;
  const ONEWEEK = ONEDAY*7;
  const OPENTIME = 9;
  const CLOSETIME = 19;
  
  //大元のdiv要素取得
  const divElement = document.getElementById('reservationsPage');

  window.addEventListener('load',()=>{
    fetchData();
  });

  const fetchData = async () => {
    try{
      const response = await fetch(API_URL);
      if(response.ok){
        const data = await response.json();
        createReservationTable(data,0);
      }else{
        alert('HTTPレスポンスエラーです');
      }
    }catch(error){
      console.log('error:',error);
      alert('データ読み込み失敗です');
    }
  }

  const createReservationTable = (data,num) => {
    console.log('data:',data);
    //変化監視対象プロパティ
    let props = {
      index: num,
      usersData: data.users,
      reservationsData: data.reservations,
      staffsData: data.staffs
    };

    console.log('props:',props);

    //index.numの変化検知用
    Object
    .getOwnPropertyNames(props)
    .forEach(propName=>watchIndexValue(props,propName,onChange));

    //表題
    const title = document.createElement('p');
    title.setAttribute('class','top-font');
    title.innerHTML = '予約管理ページ';
    divElement.appendChild(title);

    //表示用　年月、日、曜日の取得
    let today = new Date();
    today.setHours(0,0,0,0); //0:00にセット
    today_ts = new Date(today).getTime();
    const dateObject = createDateObject(today_ts+props.index*ONEWEEK);

    const div_menu = document.createElement('div');
    div_menu.setAttribute('class','button-area');

    //日にち表示エリア
    const span_date = document.createElement('span');
    span_date.setAttribute('class','date-display');
    span_date.innerHTML = '| '+dateObject.yearAndMonth+' |';
    div_menu.appendChild(span_date);

    //戻るボタン
    const left_arrow = document.createElement('button');
    left_arrow.setAttribute('class','btn btn-dark menu-button');
    left_arrow.innerHTML = '<i class="far fa-arrow-alt-circle-left"></i>戻る'

    left_arrow.addEventListener('click',()=>{
      props.index--;
    });
    div_menu.appendChild(left_arrow);

    //今週ボタン
    const thisWeek = document.createElement('button');
    thisWeek.setAttribute('class','btn btn-dark menu-button');
    thisWeek.innerHTML = '今週';
    thisWeek.addEventListener('click',()=>{
      props.index = 0;
    });
    div_menu.appendChild(thisWeek);

    //進むボタン
    const right_arrow = document.createElement('button');
    right_arrow.setAttribute('class','btn btn-dark menu-button');
    right_arrow.innerHTML = '進む<i class="far fa-arrow-alt-circle-right"></i>';
    right_arrow.addEventListener('click',()=>{
      props.index++;
    });
    div_menu.appendChild(right_arrow);
    divElement.appendChild(div_menu);
    
    //テーブルエレメント生成
    const table = document.createElement('table');
    table.setAttribute('id','reservationTable');

    //テーブルヘッダ生成
    const tableHeader = document.createElement('thead');
    const trDate = document.createElement('tr');
    const trWeek = document.createElement('tr');

    for(let i=0;i<8;i++){
      const thDate = document.createElement('th');
      thDate.setAttribute('class','table-header');
      const thWeek = document.createElement('th');
      thWeek.setAttribute('class','table-header');
      if(i === 0){
        thDate.innerHTML = 'Date';
        thWeek.innerHTML = 'Week';
        trDate.appendChild(thDate);
        trWeek.appendChild(thWeek);
      }else{
        thDate.innerHTML = dateObject.dateArray[i-1];
        thWeek.innerHTML = dateObject.weekArray[i-1];
        trDate.appendChild(thDate);
        trWeek.appendChild(thWeek);
      }
    }
    tableHeader.appendChild(trDate);
    tableHeader.appendChild(trWeek);
    table.appendChild(tableHeader);
    
    //テーブル要素生成
    const tableBody = document.createElement('tbody');

    //起点
    const startPoint = new Date().setHours(OPENTIME,0,0,0)+props.index*ONEWEEK;

    for(let i=0;i<CLOSETIME-OPENTIME;i++){
      const trElement = document.createElement('tr');
      const startPoint2 = startPoint + i*ONEHOUR;

      for(let j=0;j<8;j++){
        const td = document.createElement('td');
        if(j === 0){
          td.setAttribute('class','table-header');
          td.innerHTML = `${OPENTIME+i}:00`;
          trElement.appendChild(td);
        }else{
          const startPoint3 = startPoint2 + ONEDAY*(j-1);
          td.setAttribute('class','table-element');

          // この時間帯に予約データがあるか確認し、あれば、td内に表示
          if(props.reservationsData.length){
            props.reservationsData.forEach(array=>{
              if(array.length){
                array.forEach(reservationInfo=>{
                  if(reservationInfo.starttime>=startPoint3 && reservationInfo.starttime<(startPoint3+ONEHOUR)){
                    const display = createDataDisplay(reservationInfo);
                    td.appendChild(display);
                  }
                });
              }
            });
          }
          trElement.appendChild(td);
        }
      }
      tableBody.appendChild(trElement);
    }
    table.appendChild(tableBody);
    divElement.appendChild(table);
  }

  const createDateObject = (nowTime) => {
    const weeks = ["日", "月", "火", "水", "木", "金", "土"];
    const oneDay = ONEDAY;
    const yearAndMonth = new Date(nowTime).getFullYear() + '年' + (new Date(nowTime).getMonth()+1) + '月';

    const dateArray = [];
    const weekArray = [];
    for(let i=0;i<7;i++){
      const date = new Date(nowTime+i*oneDay).getDate();
      const day = weeks[new Date(nowTime+i*oneDay).getDay()];
      dateArray.push(date);
      weekArray.push(day)
    }
    return {
      yearAndMonth,
      dateArray,
      weekArray
    };
  }

  const watchIndexValue = (obj, propName, func) => {
    let value = obj[propName];
    Object.defineProperty(obj, propName, {
      get: () => value,
      set: newValue => {
        const oldValue = value;
        value = newValue;
        const data = {
          users: obj['usersData'],
          staffs: obj['staffsData'],
          reservations: obj['reservationsData']
        }
        console.log('data in watch',data);
        func(newValue,data);
      },
      configurable: true
    });
  }

  const onChange = (value,data) => {
    divElement.innerHTML = '';
    console.log('data in onchange',data);
    createReservationTable(data,value);
  }

  const createDataDisplay = (info) => {
    console.log('info:',info);
    const hour = new Date(parseInt(info.starttime)).getHours();
    const minutes = ('0'+new Date(parseInt(info.starttime)).getMinutes()).slice(-2);
    const dataDisplay = document.createElement('span');
    dataDisplay.setAttribute('class','reservation-data');
    dataDisplay.innerHTML = `${hour}:${minutes} ${info.staff}<br>`
    dataDisplay.addEventListener('click',(e)=>{
      createReservationCard(info);
    });

    return dataDisplay;
  }

  const createReservationCard = (info) =>{

    //グリッドシステム
    const divRow = document.createElement('div');
    divRow.setAttribute('class','col-sm-6 card-reservation');
    divRow.style.top = '0';
    
    // カード本体の定義
    const divCard = document.createElement('div');
    divCard.setAttribute('class','card text-white bg-primary');

    // カードヘッダーの定義
    const divHeader = document.createElement('div');
    divHeader.setAttribute('class','c-header');
    divHeader.innerHTML = `予約ID:${info.id}`;
    divCard.appendChild(divHeader);

    // カードボディの定義
    const divBody = document.createElement('div');
    divBody.setAttribute('class','card-body');

    // form要素の生成
    const formElement = document.createElement('form');
    formElement.setAttribute('id','reservationForm');
    // formElement.setAttribute('class','form-inline');
    formElement.setAttribute('name','reservationInfo');
    // formElement.setAttribute('method','post');　多分不要

    // 名前入力フォームの生成
    const div_form_name = document.createElement('div');
    div_form_name.setAttribute('class','form-group');

    const label_name = document.createElement('label');
    label_name.setAttribute('class','label-customer');
    label_name.innerHTML = '名前';
    div_form_name.appendChild(label_name);

    const input_name = document.createElement('input');
    input_name.setAttribute('type','text');
    input_name.setAttribute('class','form-control customer-input');
    input_name.setAttribute('name','name');
    input_name.value = info.name;
    input_name.disabled = true;
    div_form_name.appendChild(input_name);

    formElement.appendChild(div_form_name);
    divCard.appendChild(formElement);

    divRow.appendChild(divCard);
    divElement.appendChild(divRow);


    // // カット時間入力フォームの生成
    // const div_form_cut = document.createElement('div');
    // div_form_cut.setAttribute('class','form-group inline-block menu-time');

    // const label_cut = document.createElement('label');
    // label_cut.setAttribute('class','label_user');
    // label_cut.innerHTML = 'Cut';
    // div_form_cut.appendChild(label_cut);

    // const input_cut = document.createElement('input');
    // input_cut.setAttribute('type','text');
    // input_cut.setAttribute('class','form-control time-input');
    // input_cut.setAttribute('name','cuttime');
    // input_cut.value = userDataArray[3];
    // input_cut.disabled = true;
    // div_form_cut.appendChild(input_cut);

    // formElement.appendChild(div_form_cut);

    // // シャンプー時間の入力フォーム生成
    // const div_form_shampoo = document.createElement('div');
    // div_form_shampoo.setAttribute('class','form-group inline-block');

    // const label_shampoo = document.createElement('label');
    // label_shampoo.setAttribute('class','label_user');
    // label_shampoo.innerHTML = 'Shampoo';
    // div_form_shampoo.appendChild(label_shampoo);

    // const input_shampoo = document.createElement('input');
    // input_shampoo.setAttribute('type','text');
    // input_shampoo.setAttribute('class','form-control time-input');
    // input_shampoo.setAttribute('name','shampootime');
    // input_shampoo.value = userDataArray[4];
    // input_shampoo.disabled = true;
    // div_form_shampoo.appendChild(input_shampoo);

    // formElement.appendChild(div_form_shampoo);

    // // カラーリング時間の入力フォーム生成
    // const div_form_color = document.createElement('div');
    // div_form_color.setAttribute('class','form-group inline-block menu-time');

    // const label_color = document.createElement('label');
    // label_color.setAttribute('class','label_user');
    // label_color.innerHTML = 'Color';
    // div_form_color.appendChild(label_color);

    // const input_color = document.createElement('input');
    // input_color.setAttribute('type','text');
    // input_color.setAttribute('class','form-control time-input');
    // input_color.setAttribute('name','colortime');
    // input_color.value = userDataArray[5];
    // input_color.disabled = true;
    // div_form_color.appendChild(input_color);

    // formElement.appendChild(div_form_color);

    // // ヘッドスパ時間の入力フォーム生成
    // const div_form_spa = document.createElement('div');
    // div_form_spa.setAttribute('class','form-group inline-block');

    // const label_spa = document.createElement('label');
    // label_spa.setAttribute('class','label_user');
    // label_spa.innerHTML = 'Spa';
    // div_form_spa.appendChild(label_spa);

    // const input_spa = document.createElement('input');
    // input_spa.setAttribute('type','text');
    // input_spa.setAttribute('class','form-control time-input');
    // input_spa.setAttribute('name','spatime');
    // input_spa.value = userDataArray[6];
    // input_spa.disabled = true;
    // div_form_spa.appendChild(input_spa);

    // formElement.appendChild(div_form_spa);

    // // 子要素の親要素へのappendChild
    // divBody.appendChild(formElement);
    // divCard.appendChild(divBody);

    // // ボタン要素の作成
    // const divButton = document.createElement('div');
    // divButton.setAttribute('id','usercard-button-area');

    // //編集ボタンの作成
    // const editButton = document.createElement('input');
    // editButton.setAttribute('class','btn btn-warning card-button');
    // editButton.value = '編集';
    // editButton.type = 'button';

    // //編集ボタンクリック時の動作
    // editButton.addEventListener('click',()=>{

    //     //formのactionを設定　paramとしてidをつける
    //     formElement.setAttribute('action',`api/users/${userDataArray[0]}`);

    //     //各インプットの入力をできるようにする
    //     input_name.disabled = false;
    //     input_cut.disabled = false;
    //     input_shampoo.disabled = false;
    //     input_color.disabled = false;
    //     input_spa.disabled = false;

    //     //送信ボタンの生成
    //     const sendButton = document.createElement('input');
    //     sendButton.value = '送信';
    //     sendButton.type = 'button';
    //     sendButton.setAttribute('class','btn btn-warning card-button');

    //     //sendButtonクリック時の処理
    //     sendButton.addEventListener('click',(e)=>{
    //         e.preventDefault();
    //         if(!isNaN(document.userInfo.cuttime.value) && !isNaN(document.userInfo.shampootime.value) && !isNaN(document.userInfo.colortime.value) && !isNaN(document.userInfo.spatime.value)){
    //             const data = new FormData(formElement);
    //             console.log('FormData:',...data.entries());
                
    //             fetch(`/api/users/${userDataArray[0]}`,{
    //                 method:'POST',
    //                 body:data,
    //                 creadentials:'same-origin'
    //             })
    //             .then(response=>{
    //                 console.log('response:',response);
    //                 if(response.ok){
    //                     response.text()
    //                         .then(text=>{
    //                             alert(`${text}`);
    //                             document.location.reload();
    //                         })
    //                         .catch(e=>console.log(e));
    //                 }else{
    //                     alert('HTTPレスポンスエラーです')
    //                 }
    //             })
    //             .catch(e=>{
    //                 throw e;
    //             });
    //         }else{
    //             alert('時間は半角数値を入力してください。');
    //         }
    //     });

    //     divButton.appendChild(sendButton);

    //     //編集ボタンと削除ボタンを消す
    //     deleteButton.style.display = 'none';
    //     editButton.style.display = 'none';
    // });

    // divButton.appendChild(editButton);

    // //削除ボタンの作成
    // const deleteButton = document.createElement('input');
    // deleteButton.setAttribute('class','btn btn-danger card-button');
    // deleteButton.value = '削除';
    // deleteButton.type = 'button';

    // deleteButton.addEventListener('click',()=>{
    //     // 処理を書く
    // });

    // divButton.appendChild(deleteButton);
    // divCard.appendChild(divButton);

    // //フッターの作成
    // const divFooter = document.createElement('div');
    // divFooter.setAttribute('class','card-footer text-center');
    // divFooter.setAttribute('id','close-form');
    // const closeButton = document.createElement('a');
    // closeButton.setAttribute('class','closeButton');
    // closeButton.textContent = '閉じる';
    // divFooter.addEventListener('click',()=>{
    //     divCard.style.display = 'none';
    // });
    // divFooter.appendChild(closeButton);

    // divCard.appendChild(divFooter);

    // マウスイベント
    // divHeader.onmousedown = (e) =>{

    //     let shiftX = e.clientX - divCard.getBoundingClientRect().left;
    //     let shiftY = e.clientY - divCard.getBoundingClientRect().top;

    //     const moveAt = (pageX,pageY) => {
    //         if(pageX-shiftX>=0){
    //             divCard.style.left = pageX - shiftX + 'px';
    //         }else{
    //             divCard.style.left = 0 + 'px';
    //         }

    //         if(pageY-shiftY>=0){
    //             divCard.style.top = pageY - shiftY + 'px';
    //         }else{
    //             divCard.style.top = 0;
    //         }
    //     }

    //     moveAt(e.pageX,e.pageY);

    //     const onMouseMove = (e) => {
    //         moveAt(e.pageX,e.pageY);
    //     }

    //     document.addEventListener('mousemove',onMouseMove);

    //     divHeader.onmouseup = () => {
    //         document.removeEventListener('mousemove',onMouseMove);
    //         divHeader.onmouseup = null;
    //     }

    //     divHeader.onmouseleave = () => {
    //         document.removeEventListener('mousemove',onMouseMove);
    //         divHeader.onmouseleave = null;
    //     }
    // }

    // // タッチイベント
    // divHeader.ontouchstart = (event) =>{

    //     const e = event.changedTouches[0];

    //     let shiftX = e.clientX - divCard.getBoundingClientRect().left;
    //     let shiftY = e.clientY - divCard.getBoundingClientRect().top;

    //     const moveAt = (pageX,pageY) => {
    //         if(pageX-shiftX>=0){
    //             divCard.style.left = pageX - shiftX + 'px';
    //         }else{
    //             divCard.style.left = 0 + 'px';
    //         }

    //         if(pageY-shiftY>=0){
    //             divCard.style.top = pageY - shiftY + 'px';
    //         }else{
    //             divCard.style.top = 0;
    //         }
    //     }

    //     moveAt(e.pageX,e.pageY);

    //     const onMouseMove = (event) => {
    //         const e = event.changedTouches[0];
    //         moveAt(e.pageX,e.pageY);
    //     }

    //     document.addEventListener('touchmove',onMouseMove);

    //     divHeader.ontouchend = () => {
    //         document.removeEventListener('touchmove',onMouseMove);
    //         divHeader.ontouchend = null;
    //     }
    // }

    // divHeader.ondragstart = () => {
    //     return false;
    // }
  }

})();