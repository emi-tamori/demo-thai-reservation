(()=>{
  const API_URL = 'https://linebot-reservation2.herokuapp.com/api/';
  const WEEKS = ["日", "月", "火", "水", "木", "金", "土"];

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
    
    //テーブルエレメント生成
    const table = document.createElement('table');
    table.setAttribute('id','reservationTable');
    
    //現在のタイムスタンプを取得
    const nowTime = new Date().getTime();
    console.log('nowtime:',nowTime);

    //年月日生成
    const year = new Date(nowTime).getFullYear();
    const month = new Date(nowTime).getMonth()+1;
    const date = new Date(nowTime).getDate();
    const week = WEEKS[new Date(nowTime).getDay()];

    //test
    const p = document.createElement('p');
    p.innerHTML = `${year}年${month}月${date}日（${week}）`;
    divElement.appendChild(p);
  }

})();