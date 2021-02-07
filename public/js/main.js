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
            
            fetch('/api',{
              method: 'POST',
              headers: {
                'Content-Type':'application/json'
              },
              body: jsonData,
              creadentials: 'same-origin'
            })
            .then(res=>{
              //ここにレスポンス返ってくる
            })
            .catch(e=>console.log(e));
            
            //プロフィール情報の取得
            liff.getProfile()
              .then(profile=>{
                const name = profile.displayNam;
                const lineId = profile.userId;
                const staff = profile.staff;
                divElement.innerHTML=`あなたは${staff}です。LINE IDは${lineId}です。`;
              });
          })

    }else{
        divElement.innerHTML='これはLIFF画面じゃありません'
    }
    divPage.appendChild(divElement);
   }