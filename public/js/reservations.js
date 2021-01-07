(()=>{
  const API_URL = 'https://linebot-schedule.herokuapp.com/api/';
  const WEEKS = ["日", "月", "火", "水", "木", "金", "土"];
  const REGULAR_CLOSE = [];
  const ONEHOUR = 60*60*1000;
  const ONEDAY = 24*ONEHOUR;
  const ONEWEEK = ONEDAY*7;
  const OPENTIME = 12;
  const CLOSETIME = 24;
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
  const MENU_E = ['stretch','aroma','foot'];

  //大元のdiv要素取得
  const divElement = document.getElementById('reservationsPage');

  window.addEventListener('load',()=>{
    displaySpinner();
    fetchData();
  });

  const fetchData = async () => {
    try{
      const response = await fetch(API_URL);
      if(response.ok){
        const data = await response.json();
        divElement.innerHTML = '';
        createReservationTable(data,0);
      }else{
        alert('HTTPレスポンスエラーです');
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

  const createReservationTable = (data,num) => {
    console.log('data:',data);

    //スタッフ名のみ配列化する
    const STAFFS = [];
    data.staffs.forEach(obj=>{
      STAFFS.push(obj.name);
    });

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

    //新規予約登録ボタン
    const createReservationButton = document.createElement('button');
    createReservationButton.setAttribute('class','btn btn-primary menu-button');
    createReservationButton.innerHTML = '新規予約';
    createReservationButton.addEventListener('click',()=>{
      const zeroInfo = {
        id: 'new',
        line_uid: '',
        name: '',
        scheduledate: '',
        starttime: '',
        endtime: '',
        menu: '',
        treattime: '',
        staff: ''
      }
      createReservationCard(zeroInfo,STAFFS);
    })
    div_menu.appendChild(createReservationButton);

    //日にち表示エリア
    const span_date = document.createElement('span');
    span_date.setAttribute('class','date-display');
    span_date.innerHTML = '| '+dateObject.yearAndMonth+' |';
    div_menu.appendChild(span_date);

    //戻るボタン
    const left_arrow = document.createElement('button');
    left_arrow.setAttribute('class','btn btn-outline-primary menu-button');
    left_arrow.innerHTML = '<i class="far fa-arrow-alt-circle-left"></i>戻る'

    left_arrow.addEventListener('click',()=>{
      props.index--;
    });
    div_menu.appendChild(left_arrow);

    //今週ボタン
    const thisWeek = document.createElement('button');
    thisWeek.setAttribute('class','btn btn-outline-primary menu-button');
    thisWeek.innerHTML = '今週';
    thisWeek.addEventListener('click',()=>{
      props.index = 0;
    });
    div_menu.appendChild(thisWeek);

    //進むボタン
    const right_arrow = document.createElement('button');
    right_arrow.setAttribute('class','btn btn-outline-primary menu-button');
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
                    const display = createDataDisplay(reservationInfo,STAFFS);
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

  const createDataDisplay = (info,staffs) => {
    console.log('info:',info);
    const hour = new Date(parseInt(info.starttime)).getHours();
    const minutes = ('0'+new Date(parseInt(info.starttime)).getMinutes()).slice(-2);
    const dataDisplay = document.createElement('span');
    dataDisplay.setAttribute('class','reservation-data');
    dataDisplay.innerHTML = `･${hour}:${minutes}<br>`
    dataDisplay.addEventListener('click',(e)=>{
      createReservationCard(info,staffs);
    });

    return dataDisplay;
  }

  //予約データカードの表示
  const createReservationCard = (info,staffs) =>{

    //グリッドシステム
    const divRow = document.createElement('div');
    divRow.setAttribute('class','col-md-4 card-reservation');
    divRow.style.top = '14vw';
    
    // カード本体の定義
    const divCard = document.createElement('div');
    divCard.setAttribute('class','card text-white bg-info');

    // カードヘッダーの定義
    const divHeader = document.createElement('div');
    divHeader.setAttribute('class','card-header-rsv');
    //予約ID文字列
    const span_id = document.createElement('span');
    span_id.innerHTML = `予約ID： ${info.id}`;
    span_id.setAttribute('class','header-id');
    //閉じるアイコン
    const span_close = document.createElement('span');
    span_close.innerHTML = '<i class="far fa-times-circle"></i>';
    span_close.setAttribute('class','close-icon');
    span_close.addEventListener('click',()=>{
      // divCard.style.display = 'none';
      divRow.innerHTML = '';
      divCard.innerHTML = '';
    });
    divHeader.appendChild(span_id);
    divHeader.appendChild(span_close);
    divCard.appendChild(divHeader);

    // カードボディの定義
    const divBody = document.createElement('div');
    divBody.setAttribute('class','card-body');

    // form要素の生成
    const formElement = document.createElement('form');
    formElement.setAttribute('id','reservationForm');
    formElement.setAttribute('name','reservationInfo');

    // 名前入力フォームの生成
    const div_form_name = document.createElement('div');
    div_form_name.setAttribute('class','form-group form-inline div-rsv');

    const label_name = document.createElement('label');
    label_name.setAttribute('class','label-customer');
    label_name.innerHTML = 'お客さま名';
    div_form_name.appendChild(label_name);

    const input_name = document.createElement('input');
    input_name.setAttribute('type','text');
    input_name.setAttribute('class','form-control customer-input');
    input_name.value = info.name;
    input_name.name = 'customerName';
    input_name.readOnly = info.id === 'new'? false : true; //新規予約登録の場合、readOnlyをfalseにする。
    div_form_name.appendChild(input_name);

    formElement.appendChild(div_form_name);

    //スタッフの選択
    const div_form_staff = document.createElement('div');
    div_form_staff.setAttribute('class','form-group form-inline div-rsv');

    //スタッフラベル
    const label_staff = document.createElement('label');
    label_staff.setAttribute('class','label-staff-rsv');
    label_staff.innerHTML = '担当スタッフ';
    div_form_staff.appendChild(label_staff);
    
    //スタッフselect
    const select_staff = document.createElement('select');
    select_staff.setAttribute('class','form-control select-staff');
    select_staff.name = 'staffName';
    staffs.forEach(name=>{
      const option = document.createElement('option');
      option.innerHTML = name;
      option.value = name;
      select_staff.appendChild(option);
    });
    select_staff.selectedIndex = info.id === 'new' ? -1 : staffs.indexOf(info.staff);　//新規の場合は未選択状態にする
    div_form_staff.appendChild(select_staff);
    formElement.appendChild(div_form_staff);

    //予約年月日の選択
    const div_form_ymd = document.createElement('div');
    div_form_ymd.setAttribute('class','form-group form-inline div-rsv');

    //年Select
    const select_year = document.createElement('select');
    select_year.setAttribute('class','form-control select-year');
    select_year.name = 'selectedYear';
    const start_year = info.id === 'new' ? new Date().getFullYear() : new Date(parseInt(info.starttime)).getFullYear(); //新規の場合は現在の年
    for(let i=0; i<3; i++){
      const option = document.createElement('option');
      option.innerHTML = start_year-1+i;
      option.value = start_year-1+i;
      select_year.appendChild(option);
    }
    select_year.selectedIndex = 1;
    div_form_ymd.appendChild(select_year);

    //年ラベル
    const label_year = document.createElement('label');
    label_year.setAttribute('class','label-year');
    label_year.innerHTML = '年';
    div_form_ymd.appendChild(label_year);

    //月Select
    const select_month = document.createElement('select');
    select_month.setAttribute('class','form-control two-digits-selector');
    select_month.name = 'selectedMonth';
    const start_month = info.id === 'new' ? new Date().getMonth()+1 : new Date(parseInt(info.starttime)).getMonth()+1; //新規予約の場合は、現在の月
    for(let i=0; i<12; i++){
      const option = document.createElement('option');
      option.innerHTML = i+1;
      option.value = i+1;
      select_month.appendChild(option);
    }
    select_month.selectedIndex = start_month -1;
    div_form_ymd.appendChild(select_month);

    //月ラベル
    const label_month = document.createElement('label');
    label_month.setAttribute('class','label-month');
    label_month.innerHTML = '月';
    div_form_ymd.appendChild(label_month);

    //日Select
    const select_day = document.createElement('select');
    select_day.setAttribute('class','form-control two-digits-selector');
    select_day.name = 'selectedDay';
    //その月の最終日を求める
    const lastDay = new Date(start_year,start_month,0).getDate();
    console.log(lastDay);
    for(let i=0; i<lastDay; i++){
      const option = document.createElement('option');
      option.innerHTML = i+1;
      option.value = i+1;
      select_day.appendChild(option);
    }
    select_day.selectedIndex = info.id === 'new' ? new Date().getDate()-1 : new Date(parseInt(info.starttime)).getDate()-1; //新規予約の場合は、現在日
    div_form_ymd.appendChild(select_day);

    //日ラベル
    const label_day = document.createElement('label');
    label_day.setAttribute('class','label-day');
    label_day.innerHTML = '日';
    div_form_ymd.appendChild(label_day);

    formElement.appendChild(div_form_ymd);


    //予約時間の選択
    const div_form_time = document.createElement('div');
    div_form_time.setAttribute('class','form-group form-inline div-rsv');

    //開始時間ラベル
    const label_start = document.createElement('label');
    label_start.setAttribute('class','label-start-end');
    label_start.innerHTML = '予約時間';
    div_form_time.appendChild(label_start);

    //start-hour Select
    const select_sHour = document.createElement('select');
    select_sHour.setAttribute('class','form-control two-digits-selector');
    select_sHour.name = 'sHour';
    for(let i=OPENTIME; i<CLOSETIME; i++){
      const option = document.createElement('option');
      option.innerHTML = i;
      option.value = i;
      select_sHour.appendChild(option);
    }
    select_sHour.selectedIndex = info.id === 'new' ? -1 : new Date(parseInt(info.starttime)).getHours()-OPENTIME;
    div_form_time.appendChild(select_sHour);

    //start-hourラベル
    const label_sHour = document.createElement('label');
    label_sHour.innerHTML = '：';
    div_form_time.appendChild(label_sHour);

    //start-min Select
    const select_sMin = document.createElement('select');
    select_sMin.setAttribute('class','form-control two-digits-selector');
    select_sMin.name = 'sMin';
    // const start_minutes = new Date(parseInt(info.starttime)).getMinutes();
    for(let i=0; i<4; i++){
      const option = document.createElement('option');
      option.innerHTML = ('0'+i*15).slice(-2);
      option.value = 15*i;
      select_sMin.appendChild(option);
    }
    select_sMin.selectedIndex = info.id === 'new' ? -1 : new Date(parseInt(info.starttime)).getMinutes()/15;
    div_form_time.appendChild(select_sMin);

    //〜ラベル
    // const label_fromTo = document.createElement('label');
    // label_fromTo.innerHTML = '〜';
    // div_form_time.appendChild(label_fromTo);

    //終了時間ラベル
    // const label_end = document.createElement('label');
    // label_end.setAttribute('class','label-start-end');
    // label_end.innerHTML = '終了';
    // div_form_time.appendChild(label_end);

    //end-hour Select
    // const select_eHour = document.createElement('select');
    // select_eHour.setAttribute('class','form-control two-digits-selector');
    // select_eHour.name = 'eHour';
    // const end_hour = new Date(parseInt(info.endtime)).getHours();
    // for(let i=OPENTIME; i<CLOSETIME; i++){
    //   const option = document.createElement('option');
    //   option.innerHTML = i;
    //   option.value = i;
    //   select_eHour.appendChild(option);
    // }
    // select_eHour.selectedIndex = info.id === 'new' ? -1 : new Date(parseInt(info.endtime)).getHours()-OPENTIME;
    // div_form_time.appendChild(select_eHour);

    //end-hourラベル
    // const label_eHour = document.createElement('label');
    // label_eHour.innerHTML = '：';
    // div_form_time.appendChild(label_eHour);

    //end-min Select
    // const select_eMin = document.createElement('select');
    // select_eMin.setAttribute('class','form-control two-digits-selector');
    // const end_minutes = new Date(parseInt(info.endtime)).getMinutes();
    // select_eMin.name = 'eMin';
    // for(let i=0; i<12; i++){
    //   const option = document.createElement('option');
    //   option.innerHTML = ('0'+i*5).slice(-2);
    //   option.value = 5*i;
    //   select_eMin.appendChild(option);
    // }
    // select_eMin.selectedIndex = info.id === 'new' ? -1 : new Date(parseInt(info.endtime)).getMinutes()/5;
    // div_form_time.appendChild(select_eMin);

    formElement.appendChild(div_form_time);

    //施術時間の選択
    const div_form_treat = document.createElement('div');
    div_form_treat.setAttribute('class','form-group form-inline div-treat');

    //選択メニュー選択(新規作成の時は0に設定)
    const menuNumber = info.id === 'new' ? 0 : info.menu;

    //施術時間ラベル
    const label_treat = document.createElement('label');
    label_treat.setAttribute('class','label-treat');
    label_treat.innerHTML = '施術時間';
    div_form_treat.appendChild(label_treat);

    //施術時間 Select
    const select_treat = document.createElement('select');
    select_treat.setAttribute('class','form-control treattime-selector');
    select_treat.name = 'treattime';
    const treatArray = MENU[menuNumber].timeAndPrice;

    treatArray.forEach((array,index)=>{
      const option = document.createElement('option');
      option.innerHTML = array[0]+'分';
      option.value = index;
      select_treat.appendChild(option);
    });
    select_treat.selectedIndex = info.id === 'new' ? -1 : info.treattime;
    div_form_treat.appendChild(select_treat);

    MENU.forEach((menu,index)=>{
      const div_form_menu = document.createElement('div');
      div_form_menu.setAttribute('class','form-check menu-check');
      //ラジオボタン
      const radio = document.createElement('input');
      radio.setAttribute('class','form-check-input');
      radio.setAttribute('id',`check-${MENU_E[index]}-${info.staff}&${info.id}`);
      radio.type = 'radio';
      radio.name = 'menu';
      radio.value = index;
      if(menuNumber === index) radio.checked = true;

      //ラジオボタンの選択時変化処理
      radio.addEventListener('change',()=>{
        // select_treat.innerHTML = ''
        //まずは子ノードを全削除
        if(select_treat.hasChildNodes()){
          while(select_treat.childNodes.length>0){
            select_treat.removeChild(select_treat.firstChild);
          }
        }

        //新規に子ノードを追加
        const array = MENU[index].timeAndPrice;
        array.forEach((arr,ind)=>{
          const opt = document.createElement('option');
          opt.innerHTML = arr[0]+'分';
          opt.value = ind;
          select_treat.appendChild(opt);
        });
        select_treat.selectedIndex = -1;
      });

      //ラベル
      const label = document.createElement('label');
      label.setAttribute('class','form-check-label');
      label.htmlFor = `check-${MENU_E[index]}-${info.staff}&${info.id}`;
      label.innerHTML = menu.menu;
      //親要素への追加
      div_form_menu.appendChild(radio);
      div_form_menu.appendChild(label);
      formElement.appendChild(div_form_menu);
    });

    formElement.appendChild(div_form_treat);

    //フッターの作成
    const divFooter = document.createElement('div');
    divFooter.setAttribute('class','card-footer-rsv text-center');

    //新規予約の場合、新規予約ボタンを配置
    if(info.id === 'new'){
      const createButton = document.createElement('input');
      createButton.type = 'button';
      createButton.value = '新規予約作成';
      createButton.setAttribute('class','btn btn-success button-rsv');
      createButton.addEventListener('click',()=>{
        const formData = new FormData(formElement);
        formData.append('id',info.id);
        console.log('formData',...formData.entries());

        //formDataが適正かチェックする機能を実装する
        let check = postCheck(formData); //スタッフのシフトチェックも行う
        console.log('check',check);
        if(check === 'ok'){
          fetch('/api/reservation',{
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
          })
          .then(response=>{
            if(response.ok){
              response.text()
                .then(text=>{
                  console.log(text);
                  document.location.reload();
                  alert(text);
                })
                .catch(e=>console.log(e));
            }else{
              alert('HTTPレスポンスエラーです');
            }
          })
          .catch(error=>{
            alert(error);
            throw error;
          });
        }else{
          alert(check);
        }
      })
      divFooter.appendChild(createButton);
    }
    else{
      //新規予約でない場合、更新ボタンと削除ボタンを配置
    //更新ボタン
    const updateButton = document.createElement('input');
    updateButton.type = 'button';
    updateButton.value = '更新';
    updateButton.setAttribute('class','btn btn-warning button-rsv');
    updateButton.addEventListener('click',()=>{
      const formData = new FormData(formElement);
      formData.append('id',info.id);
      console.log('formData',...formData.entries());

      //formDataが適正かのチェックを入れる
      let check = postCheck(formData);
      console.log('check',check);
      if(check === 'ok'){
        fetch('/api/reservation',{
          method:'PUT',
          body:formData,
          credentials:'same-origin'
        })
        .then(response=>{
          if(response.ok){
            response.text()
              .then(text=>{
                alert(text);
                document.location.reload();
              })
              .catch(e=>console.log(e));
          }else{
            alert('HTTPレスポンスエラー');
          }
        })
        .catch(error=>{
          alert(error);
          throw error;
        });
      }else{
        alert(check);
      }
    });
    divFooter.appendChild(updateButton);

    //削除ボタン
    const deleteButton = document.createElement('input');
    deleteButton.type = 'button';
    deleteButton.value = '削除';
    deleteButton.setAttribute('class','btn btn-danger button-rsv');
    deleteButton.addEventListener('click',()=>{
      fetch(`/api/reservation/${info.staff}?id=${info.id}`,{
        method: 'DELETE',
        credentials: 'same-origin'
      })
      .then(response=>{
        if(response.ok){
          response.text()
            .then(text=>{
              alert(text);
              document.location.reload();
            })
            .catch(e=>console.log(e));
        }else{
          alert('HTTPレスポンスエラーです');
        }
      })
      .catch(e=>console.log(e));
    });
    divFooter.appendChild(deleteButton);
    }

    divCard.appendChild(formElement);
    divCard.appendChild(divFooter);

    divRow.appendChild(divCard);
    divElement.appendChild(divRow);
  }

  const postCheck = (data,staffsData) => {
    const keyParams = [
      'customerName',
      'staffName',
      'selectedYear',
      'selectedMonth',
      'selectedDay',
      'sHour',
      'sMin',
      'menu',
      'treattime',
      'id'
    ]

    //名前未入力チェック
    if(!data.get('customerName')) return '名前が未入力です';

    //未選択チェック
    let notSelected = 0;
    keyParams.forEach(param=>{
      if(data.get(`${param}`) === null) notSelected++;
    });
    if(notSelected>0) return `${notSelected}箇所の未入力があります`;

    //定休日チェック
    const year = data.get('selectedYear');
    const month = data.get('selectedMonth');
    const day = data.get('selectedDay');
    const sHour = data.get('sHour');
    const sMin = data.get('sMin');
    const week = new Date(`${year}/${month}/${day} ${sHour}:${sMin}`).getDay();
    if(REGULAR_CLOSE.length){
      let regularCheck = 0;
      REGULAR_CLOSE.forEach(value=>{
        if(value === week) regularCheck++;
      });
      if(regularCheck) return '定休日には予約を入れることができません';
    }

    //何も引っ掛からなかったら
    return 'ok';
  }

})();