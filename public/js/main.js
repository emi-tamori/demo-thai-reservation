window.onload = () => {
    const myLiffId = '1655646641-AMjnKW7z';
    //div要素の取得
    const divElement = document.getElementById('indexPage');
    //LIFFで立ち上げているかどうかの判定
    if(liff.isInClient()){
        divElement.innerHTML='これはLIFF画面です'
    }else{
        divElement.innerHTML='これはLIFF画面じゃありません'
    }
    divPage.appendChild(divElement);
   }