(()=>{
  const API_URL = 'https://linebot-reservation2.herokuapp.com/api/';
  const WEEKS = ["日", "月", "火", "水", "木", "金", "土"];
  const ONEHOUR = 60*60*1000;
  const ONEDAY = 24*ONEHOUR;
  const ONEWEEK = ONEDAY*7;
  const OPENTIME = 9;
  const CLOSETIME = 19;
  const MENU = ['カット','シャンプー','カラーリング','ヘッドスパ','マッサージ＆スパ','眉整え','顔そり'];
  
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
    dataDisplay.innerHTML = `${hour}:${minutes} ${info.staff}<br>`
    dataDisplay.addEventListener('click',(e)=>{
      createReservationCard(info,staffs);
    });

    return dataDisplay;
  }

  const createReservationCard = (info,staffs) =>{

    //グリッドシステム
    const divRow = document.createElement('div');
    divRow.setAttribute('class','col-sm-5 card-reservation');
    divRow.style.top = '20vw';
    
    // カード本体の定義
    const divCard = document.createElement('div');
    divCard.setAttribute('class','card text-white bg-info');

    // カードヘッダーの定義
    const divHeader = document.createElement('div');
    divHeader.setAttribute('class','card-header-rsv');
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
    div_form_name.setAttribute('class','form-group form-inline div-rsv');

    const label_name = document.createElement('label');
    label_name.setAttribute('class','label-customer');
    label_name.innerHTML = 'お客さま名';
    div_form_name.appendChild(label_name);

    const input_name = document.createElement('input');
    input_name.setAttribute('type','text');
    input_name.setAttribute('class','form-control customer-input');
    input_name.setAttribute('name','name');
    input_name.value = info.name;
    input_name.disabled = true;
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
    staffs.forEach(name=>{
      const option = document.createElement('option');
      option.innerHTML = name;
      option.value = name;
      select_staff.appendChild(option);
    });
    select_staff.selectedIndex = staffs.indexOf(info.staff);
    div_form_staff.appendChild(select_staff);
    formElement.appendChild(div_form_staff);

    //予約年月日の選択
    const div_form_ymd = document.createElement('div');
    div_form_ymd.setAttribute('class','form-group form-inline div-rsv');

    //予約年月日ラベル
    const label_ymd = document.createElement('label');
    label_ymd.innerHTML = '予約年月';
    div_form_ymd.appendChild(label_ymd);

    //年Select
    const select_year = document.createElement('select');
    select_year.setAttribute('class','form-control select-year');
    const start_year = new Date(parseInt(info.starttime)).getFullYear();
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
    select_month.setAttribute('class','form-control select-month');
    const start_month = new Date(parseInt(info.starttime)).getMonth()+1;
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
    select_day.setAttribute('class','form-control select-day');
    //その月の最終日を求める
    const lastDay = new Date(start_year,start_month,0).getDate();
    console.log(lastDay);
    for(let i=0; i<lastDay; i++){
      const option = document.createElement('option');
      option.innerHTML = i+1;
      option.value = i+1;
      select_day.appendChild(option);
    }
    select_day.selectedIndex = new Date(parseInt(info.starttime)).getDate()-1;
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
    label_start.setAttribute('class','label-start');
    label_start.innerHTML = '開始';
    div_form_time.appendChild(label_start);

    //start-hour Select
    const select_sHour = document.createElement('select');
    select_sHour.setAttribute('class','form-control select-sHour');
    const start_hour = new Date(parseInt(info.starttime)).getHours();
    for(let i=OPENTIME; i<CLOSETIME; i++){
      const option = document.createElement('option');
      option.innerHTML = i;
      option.value = i;
      select_sHour.appendChild(option);
    }
    select_sHour.selectedIndex = start_hour-OPENTIME;
    div_form_time.appendChild(select_sHour);

    //start-hourラベル
    const label_sHour = document.createElement('label');
    label_sHour.innerHTML = '：';
    div_form_time.appendChild(label_sHour);

    //start-min Select
    const select_sMin = document.createElement('select');
    select_sMin.setAttribute('class','form-control select-sMin');
    const start_minutes = new Date(parseInt(info.starttime)).getMinutes();
    for(let i=0; i<12; i++){
      const option = document.createElement('option');
      option.innerHTML = ('0'+i*5).slice(-2);
      option.value = 5*i;
      select_sMin.appendChild(option);
    }
    select_sMin.selectedIndex = start_minutes/5;
    div_form_time.appendChild(select_sMin);

    //〜ラベル
    const label_fromTo = document.createElement('label');
    label_fromTo.innerHTML = '〜';
    div_form_time.appendChild(label_fromTo);

    //終了時間ラベル
    const label_end = document.createElement('label');
    label_end.setAttribute('class','label-end');
    label_end.innerHTML = '終了';
    div_form_time.appendChild(label_end);

    //end-hour Select
    const select_eHour = document.createElement('select');
    select_eHour.setAttribute('class','form-control select-eHour');
    const end_hour = new Date(parseInt(info.endtime)).getHours();
    for(let i=OPENTIME; i<CLOSETIME; i++){
      const option = document.createElement('option');
      option.innerHTML = i;
      option.value = i;
      select_eHour.appendChild(option);
    }
    select_eHour.selectedIndex = end_hour-OPENTIME;
    div_form_time.appendChild(select_eHour);

    //end-hourラベル
    const label_eHour = document.createElement('label');
    label_eHour.innerHTML = '：';
    div_form_time.appendChild(label_eHour);

    //start-min Select
    const select_eMin = document.createElement('select');
    select_eMin.setAttribute('class','form-control select-eMin');
    const end_minutes = new Date(parseInt(info.endtime)).getMinutes();
    for(let i=0; i<12; i++){
      const option = document.createElement('option');
      option.innerHTML = ('0'+i*5).slice(-2);
      option.value = 5*i;
      select_eMin.appendChild(option);
    }
    select_eMin.selectedIndex = end_minutes/5;
    div_form_time.appendChild(select_eMin);

    formElement.appendChild(div_form_time);

    //メニュー選択
    const menus = info.menu.split('%');
    console.log('menus',menus);
    MENU.forEach((menu,index)=>{
      const div_form_menu = document.createElement('div');
      div_form_menu.setAttribute('class','menu-checkbox');
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.name = 'menu-select';
      check.value= index;
      menus.forEach(menuNumber=>{
        if(parseInt(menuNumber) === index) check.checked = true;
      });
      const label = document.createElement('label');
      label.innerHTML = menu;
      div_form_menu.appendChild(check);
      div_form_menu.appendChild(label);
      formElement.appendChild(div_form_menu);
    });

    //ボタンエリア
    const div_form_button = document.createElement('div');
    div_form_button.setAttribute('class','form-group form-inline div-rsv');

    //更新ボタン
    const updateButton = document.createElement('input');
    updateButton.type = 'button';
    updateButton.value = '更新';
    updateButton.setAttribute('class','btn btn-outline-warning button-rsv');
    div_form_button.appendChild(updateButton);

    //削除ボタン
    const deleteButton = document.createElement('input');
    deleteButton.type = 'button';
    deleteButton.value = '削除';
    deleteButton.setAttribute('class','btn btn-outline-danger button-rsv');
    div_form_button.appendChild(deleteButton);

    formElement.appendChild(div_form_button);

    //フッターの作成
    const divFooter = document.createElement('div');
    divFooter.setAttribute('class','card-footer-rsv text-center');
    // const closeButton = document.createElement('a');
    // closeButton.setAttribute('class','closeButton');
    divFooter.textContent = '閉じる';
    divFooter.addEventListener('click',()=>{
        divCard.style.display = 'none';
    });

    divCard.appendChild(formElement);
    divCard.appendChild(divFooter);

    divRow.appendChild(divCard);
    divElement.appendChild(divRow);
  }

})();