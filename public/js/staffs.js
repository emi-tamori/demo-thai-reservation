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
    input_staff.setAttribute('name','staff-name');
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

    //スタッフのリスト化
    const ulElement = document.createElement('ul');
    data.forEach(object=>{
      const liElement = document.createElement('li');
      liElement.innerHTML = `${object.id}:${object.name}`
      ulElement.appendChild(liElement);
    });
    divElement.appendChild(ulElement);
  }

})();