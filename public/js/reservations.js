(()=>{
  const API_URL = 'https://linebot-reservation.herokuapp.com/api/';

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

    const reservationsData = [];
    
  }

})();