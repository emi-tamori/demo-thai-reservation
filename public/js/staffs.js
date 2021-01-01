(()=>{
  const API_URL = 'https://linebot-reservation2.herokuapp.com/api/staffs';
  const NUMBER_OF_SHIFTS = 7; //何日先のシフトまで入れることができるか
  const OPENTIME = 9; //開店時間
  const CLOSETIME = 19; //閉店時間
  let STAFFS_DATA; //スタッフシフトデータ格納用

  //HTML要素の読み込み
  const divElement = document.getElementById('staffsPage');

  //ページ読み込み時fetch実行
  window.addEventListener('load',()=>{
    displaySpinner();
    fetchData();
  });

  //fetch関数
  const fetchData = async () => {
    try{
      const response = await fetch(API_URL);
      if(response.ok){
        const data = await response.json();
        STAFFS_DATA = data;
        // divElement.innerHTML='';
        createStaffTable(0);
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

  const createStaffTable = (num) => {

    //表題
    const title = document.createElement('p');
    title.setAttribute('class','top-font');
    title.innerHTML = 'スタッフ管理ページ';
    divElement.appendChild(title);

    //STAFFS_DATAのディープコピー
    const data = Array.from(STAFFS_DATA);
    
    //表示用dateの取得
    let today = new Date();
    today.setHours(0,0,0,0); //0:00にセット
    today_ts = new Date(today).getTime();
    const dateArray = createDateArray(today_ts);

    let index = {
      num
    };
    Object.getOwnPropertyNames(index).forEach(propName=>watchIndexValue(index,propName,onChange));
    console.log('index.num',index.num,num);
    console.log('create table data:',data);

    const div_switch = document.createElement('div');

    //日にち表示エリア
    const span_date = document.createElement('span');
    span_date.setAttribute('class','date-display');
    span_date.innerHTML = '| '+dateArray[index.num]+' |';
    div_switch.appendChild(span_date);

    //戻るボタン
    div_switch.setAttribute('class','button-area');
    const left_arrow = document.createElement('span');
    left_arrow.setAttribute('class','switching');
    left_arrow.innerHTML = '<i class="far fa-arrow-alt-circle-left"></i>戻る'

    left_arrow.addEventListener('click',()=>{
      console.log('left clicked!',index.num);
      if(index.num>0) index.num--;
    });
    div_switch.appendChild(left_arrow);

    //進むボタン
    const right_arrow = document.createElement('span');
    right_arrow.setAttribute('class','switching');
    right_arrow.innerHTML = '<i class="far fa-arrow-alt-circle-right"></i>進む'
    right_arrow.addEventListener('click',()=>{
      console.log('right clicked!',index.num);
      if(index.num<NUMBER_OF_SHIFTS-1) index.num++;
    });
    div_switch.appendChild(right_arrow);

    //データ送信用ボタン
    const postShiftButton = document.createElement('button');
    postShiftButton.setAttribute('class','btn btn-primary post-button');
    postShiftButton.textContent = 'シフト登録';
    postShiftButton.addEventListener('click',()=>{
      data.forEach(obj=>{
        obj.updatedat = today_ts;
      });
      const jsonData = JSON.stringify(data);
      console.log('jsondata',jsonData);
      fetch('/api/shifts',{
        method: 'POST',
        headers: {
          'Content-Type':'application/json'
        },
        body: jsonData,
        credentials: 'same-origin'
      })
      .then(response=>{
        if(response.ok){
          response.text()
            .then(text=>alert(`${text}`))
            .catch(e=>console.log(e))
        }
      })
      .catch(e=>{
        throw e;
      });
    });
    div_switch.appendChild(postShiftButton);
    divElement.appendChild(div_switch);

    //テーブル要素宣言
    const table = document.createElement('table');
    // table.style.marginLeft = `${(100-(26+4*(CLOSETIME-OPENTIME)))/2}vw`;

    //テーブルヘッダー生成
    const tableHeader = document.createElement('thead');
    const trHead = document.createElement('tr');

    for(let i=OPENTIME-2;i<CLOSETIME+1;i++){
      const th = document.createElement('th');
      if(i===OPENTIME-2){
        th.innerHTML = 'ID';
        th.setAttribute('class','id-header');
      }else if(i===OPENTIME-1){
        th.innerHTML = 'Name';
        th.setAttribute('class','name-header');
      }else if(i===CLOSETIME){
        th.innerHTML = 'Delete'
        th.setAttribute('class','delete-header');
      }
      else{
        th.innerHTML = `${i}`;
        th.setAttribute('class','time-header');
      }
      trHead.appendChild(th);
    }
    tableHeader.appendChild(trHead);
    table.appendChild(tableHeader);

    //テーブル要素生成
    const tbody = document.createElement('tbody');

    data.forEach((object,staffNumber)=>{
      const tr = document.createElement('tr');

      for(let i=OPENTIME-2; i<CLOSETIME+1; i++){
        const td = document.createElement('td');
        if(i===OPENTIME-2){
          td.innerHTML = object.id;
          td.setAttribute('class','tbody-id');
        }else if(i===OPENTIME-1){
          td.innerHTML = object.name;
          td.setAttribute('class','tbody-name');
        }else if(i===CLOSETIME){

          //削除欄の実装
          const icon = document.createElement('i');
          icon.setAttribute('class','fas fa-user-slash delete-icon');
          //削除アイコンクリック時の処理
          icon.addEventListener('click',()=>{
            fetch(`/api/staffs/${object.name}`,{
              method: 'DELETE',
              credentials: 'same-origin'
            })
            .then(response=>{
              if(response.ok){
                response.text()
                  .then(text=>{
                    alert(`${text}`);
                    document.location.reload();
                  })
                  .catch(e=>console.log(e));
              }else{
                alert('HTTPSレスポンスエラーです');
              }
            })
            .catch(e=>{
              throw e;
            });
          });
          td.appendChild(icon);
          td.setAttribute('class','tbody-delete');
        }
        else{
          td.innerHTML = object[`d${index.num}h${i}`];
          td.addEventListener('click',()=>{
            toggle(staffNumber,index.num,i,data);
          });
          td.setAttribute('class','tbody-shift');
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    //新規スタッフ登録欄(テーブルフッター)
    const tfoot = document.createElement('tfoot');
    const tr_foot = document.createElement('tr');
    const td_foot = document.createElement('td');
    td_foot.colSpan = `${CLOSETIME-OPENTIME+3}`;
    td_foot.setAttribute('class','table-footer');

    //スタッフの追加
    const formElement = document.createElement('form');
    formElement.setAttribute('id','staffForm');
    formElement.setAttribute('name','staffName');
    
    //スタッフ追加フォーム
    const div_input_staff = document.createElement('div');
    div_input_staff.setAttribute('class','form-group staff-input-area');
      //スタッフラベル
    const label_staff = document.createElement('label');
    label_staff.setAttribute('class','label-staff');
    label_staff.innerHTML = 'スタッフ名';
    div_input_staff.appendChild(label_staff);
      //スタッフ名入力欄
    const input_staff = document.createElement('input');
    input_staff.setAttribute('type','text');
    input_staff.setAttribute('class','form-group staff-input');
    input_staff.setAttribute('name','name');
    div_input_staff.appendChild(input_staff);

    //メール入力フォーム
    const div_input_mail = document.createElement('div');
    div_input_mail.setAttribute('class','form-group staff-input-area');
    //メールラベル
    const label_mail = document.createElement('label');
    label_mail.setAttribute('class','label-staff');
    label_mail.innerHTML = 'メール';
    div_input_mail.appendChild(label_mail);
      //メールアドレス入力欄
    const input_mail = document.createElement('input');
    input_mail.setAttribute('type','text');
    input_mail.setAttribute('class','form-group staff-input');
    input_mail.setAttribute('name','email');
    div_input_mail.appendChild(input_mail);
      //スタッフ名登録ボタン（post）
    const postButton = document.createElement('input');
    postButton.setAttribute('class','btn btn-primary post-button');
    postButton.value = '登録';
    postButton.type = 'button';
      //登録ボタンのクリック時処理
    postButton.addEventListener('click',(e)=>{
      e.preventDefault();
      const data = new FormData(formElement);
      console.log('Formdata:',...data.entries());

      const check = postCheck(data);

      if(check === 'ok'){
        fetch('/api/staffs',{
          method: 'POST',
          body: data,
          credentials: 'same-origin'
        })
        .then(response=>{
          if(response.ok){
            response.text()
              .then(text=>{
                alert(`${text}`);
                document.location.reload();
              })
              .catch(e=>console.log(e));
          }
        })
        .catch(e=>{
          throw e;
        });
      }else{
        alert(check);
      }
    });
    div_input_mail.appendChild(postButton);
    formElement.appendChild(div_input_staff);
    formElement.appendChild(div_input_mail);
    td_foot.appendChild(formElement);

    tr_foot.appendChild(td_foot);
    tfoot.appendChild(tr_foot);
    table.appendChild(tfoot);

    divElement.appendChild(table);
  }

  const createDateArray = (nowTime) => {
    const today = nowTime;
    const weeks = ["日", "月", "火", "水", "木", "金", "土"];
    const oneDay = 24*60*60*1000;
    const dateArray = [];
    for(let i=0;i<NUMBER_OF_SHIFTS;i++){
      const month = new Date(today+i*oneDay).getMonth()+1;
      const date = new Date(today+i*oneDay).getDate();
      const day = weeks[new Date(today+i*oneDay).getDay()];
      dateArray.push(`${month}月${date}日(${day})`);
    }
    return dateArray;
  }

  const watchIndexValue = (obj, propName, func) => {
    let value = obj[propName];
    Object.defineProperty(obj, propName, {
      get: () => value,
      set: newValue => {
        const oldValue = value;
        value = newValue;
        func(newValue);
      },
      configurable: true
    });
  }

  const onChange = (value) => {
    divElement.innerHTML = '';
    createStaffTable(value);
  } 

  const toggle = (staffNumber,dateNum,timeNum,data) => {
    const targetObj = data[staffNumber];
    const targetShift = targetObj[`d${dateNum}h${timeNum}`];
    if(targetShift === null){
      STAFFS_DATA[staffNumber][`d${dateNum}h${timeNum}`] = 1;
    }else if(targetShift === 1){
      STAFFS_DATA[staffNumber][`d${dateNum}h${timeNum}`] = 0;
    }else{
      STAFFS_DATA[staffNumber][`d${dateNum}h${timeNum}`] = 1;
    }
    console.log('targetShift',targetObj,targetShift);
    console.log
    divElement.innerHTML = '';
    createStaffTable(dateNum);
  }

  const postCheck = (data) => {
    const name = data.get('name');
    const email = data.get('email');

    //未入力チェック
    for (let value of data.entries()) {
      if(value[1] === '') return '未入力箇所があります';
    }

    //名前に半角スペース入れちゃダメチェック
    const spaceCheck = /\s+/g;
    if(spaceCheck.test(name)){
      return '名前にはスペースや改行等は含めることができません';
    }

    //メルアドは適正かチェック
    const addressCheck = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/;
    if(!addressCheck.test(email)){
      return 'メールアドレスを正しく入力してください'
    }

    //何も引っ掛からなかったら
    return 'ok';
  }

})();