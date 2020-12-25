(()=>{
  const API_URL = 'https://linebot-reservation2.herokuapp.com/api/';
  const WEEKS = ["日", "月", "火", "水", "木", "金", "土"];
  const ONEDAY = 24*60*60*1000;

  window.addEventListener('load',()=>{
    fetchData();
  });

  const fetchData = async () => {
    try{
      const response = await fetch(API_URL);
      if(response.ok){
        const data = await response.json();
        console.log('data:',data);
        createReservationTable(data);
      }else{
        alert('HTTPレスポンスエラーです');
      }
    }catch(error){
      console.log('error:',error);
      alert('データ読み込み失敗です');
    }
  }

  const createReservationTable = (data) => {
    const divElement = document.getElementById('reservationsPage');

    const reservationsData = data.reservations;
    
    //現在のタイムスタンプを取得
    const nowTime = new Date().getTime();
    console.log('nowtime:',nowTime);

    //年月日生成
    const year = new Date(nowTime).getFullYear();
    const month = new Date(nowTime).getMonth()+1;

    //日時ラベル
    const p = document.createElement('p');
    p.innerHTML = `${year}年${month}月`;
    divElement.appendChild(p);
        
    //テーブルエレメント生成
    const table = document.createElement('table');
    table.setAttribute('id','reservationTable');

    //テーブルヘッダ
    const tableHeader = document.createElement('thead');
    for(let i=0;i<7;i++){
      const thDate = document.createElement('th');
      const thWeek = document.createElement('th');
      const date = new Date(nowTime+i*ONEDAY).getDate();
      const week = WEEKS[new Date(nowTime+i*ONEDAY).getDay()];
      thDate.innerHTML = date;
      thWeek.innerHTML = week;
      tableHeader.appendChild(thDate);
      tableHeader.appendChild(thWeek);
    }
    table.appendChild(tableHeader);
    divElement.appendChild(table);
  }

})();