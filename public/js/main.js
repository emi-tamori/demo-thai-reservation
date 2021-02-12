window.onload = () => {
    const myLiffId = '1655646641-AMjnKW7z';
    //div要素の取得
    const divElement = document.getElementById('indexPage');
    //LIFFで立ち上げているかどうかの判定
    if(liff.isInClient()){
        divElement.innerHTML='これはLIFF画面です'
        //LIFF初期化
        liff.init({
            liffId: myLiffId
        })
        .then(()=>{
            //idトークンによるスタッフ情報の取得
            const idToken = liff.getIDToken();
            const jsonData = JSON.stringify({
              id_token: idToken
            });
            
            fetch('/api/judge-staff',{
              method: 'POST',
              headers: {
                'Content-Type':'application/json'
              },
              body: jsonData,
              creadentials: 'same-origin'
            })
            .then(response=>{
              //ここにレスポンス返ってくる
              const staff = response.staff;
              if(staff == true){
                divElement.innerHTML='スタッフです';
              }else{
                divElement.innerHTML='このページには入れません';
              }

            })
            .catch(e=>console.log(e));
            
            
          })

    }else{
        divElement.innerHTML='これはLIFF画面じゃありません'
    }
    divPage.appendChild(divElement);
   }