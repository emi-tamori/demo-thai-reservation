(()=>{
  const API_URL = 'https://linebot-reservation2.herokuapp.com/api/staffs';

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
  }

})();