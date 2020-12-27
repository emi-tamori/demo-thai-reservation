(()=>{
  const API_URL = 'https://linebot-reservation2.herokuapp.com/api/staffs';
  const NUMBER_OF_SHIFTS = 7; //何日先のシフトまで入れることができるか
  const OPENTIME = 9; //開店時間
  const CLOSETIME = 19; //閉店時間

  window.addEventListener('load',()=>{
    fetchData();
  });

  const fetchData = async () => {
    try{
      const response = await fetch(API_URL);
      if(response.ok){
        const data = await response.json();
        createStaffTable(data);
      }
    }catch(error){
      console.log('error:',error);
      alert('データ読み込み失敗です');
    }
  }

  const createStaffTable = (data) => {
    console.log('create table data:',data);
    const divElement = document.getElementById('staffsPage');
    
    //スタッフの追加
    const formElement = document.createElement('form');
    formElement.setAttribute('id','staffForm');
    formElement.setAttribute('name','staffName');
    
    //スタッフ追加フォーム
    const div_input_staff = document.createElement('div');
    div_input_staff.setAttribute('class','form-group');

    const label_staff = document.createElement('label');
    label_staff.setAttribute('class','label_staff');
    label_staff.innerHTML = 'スタッフ名';
    div_input_staff.appendChild(label_staff);

    const input_staff = document.createElement('input');
    input_staff.setAttribute('type','text');
    input_staff.setAttribute('class','form-group staff-input');
    input_staff.setAttribute('name','name');
    div_input_staff.appendChild(input_staff);

    const postButton = document.createElement('input');
    postButton.setAttribute('class','btn btn-primary post-button');
    postButton.value = '登録';
    postButton.type = 'button';

    postButton.addEventListener('click',(e)=>{
      e.preventDefault();
      const data = new FormData(formElement);
      console.log('Formdata:',...data.entries());

      fetch('/api/staffs',{
        method: 'POST',
        body: data,
        credentials: 'same-origin'
      })
      .then(response=>{
        console.log('response in fetch',response);
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
    });
    div_input_staff.appendChild(postButton);
    formElement.appendChild(div_input_staff);
    divElement.appendChild(formElement);

    //日送りボタン
    const div_arrow = document.createElement('div');
    const left_arrow = document.createElement('i');
    left_arrow.setAttribute('class','far fa-arrow-alt-circle-left');
    div_arrow.appendChild(left_arrow);

    divElement.appendChild(div_arrow);

    //テーブル要素宣言
    const table = document.createElement('table');

    //テーブルヘッダー生成
    const tableHeader = document.createElement('thead');
    const trHead = document.createElement('tr');

    for(let i=OPENTIME-3;i<CLOSETIME;i++){
      const th = document.createElement('th');
      if(i===OPENTIME-3){
        th.innerHTML = 'ID';
        th.setAttribute('class','id-header');
      }else if(i===OPENTIME-2){
        th.innerHTML = 'Name';
        th.setAttribute('class','name-header');
      }else if(i===OPENTIME-1){
        th.innerHTML = 'Date';
        th.setAttribute('class','date-header');
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

    //日時生成
    const dateArray = createDateArray();
    console.log('dateArray:',dateArray);

    data.forEach(object=>{
      for(let i=0;i<NUMBER_OF_SHIFTS;i++){
        const tr = document.createElement('tr');
        const td_id = document.createElement('td');
        
        for(let j=OPENTIME-3; j<CLOSETIME; j++){
          const td = document.createElement('td');
          if(j===OPENTIME-3){
            td.innerHTML = object.id;
            td.setAttribute('class','tbody-id');
          }else if(j===OPENTIME-2){
            td.innerHTML = object.name;
            td.setAttribute('class','tbody-name');
          }else if(j===OPENTIME-1){
            td.innerHTML = dateArray[i];
            td.setAttribute('class','tbody-date');
          }else{
            if(object[`d${i}h${j}`] === null){
              td.innerHTML = '-';
            }else{
              td.innerHTML = object[`d${i}h${j}`];
            }
            td.setAttribute('class','tbody-shift');
          }
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
    });
    table.appendChild(tbody);
    divElement.appendChild(table);
  }

  const createDateArray = () => {
    const today = new Date().getTime();
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

})();