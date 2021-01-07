(()=>{

  module.exports = {
    OPENTIME: 12, //開店時間
    CLOSETIME: 24, //閉店時間
    REGULAR_CLOSE: [], //定休日（整数、配列型式で入力）
    FUTURE_LIMIT: 3, //何日先まで予約可能か
    NUMBER_OF_SHIFTS: 7, //何日先のシフトまで入力するか
    SHIFTS_LEFT: 7,　//南日前までのシフトを残すか
    PASSWORD: 'パスワード', //管理画面用URL
    ADMIN_EMAIL_FROM: 'kentaro523@gmail.com', //Gメールの送り元(id,secret,refreshが登録されたもの)
    ADMIN_EMAIL_TO: 'waruemon.xyz@gmail.com', //Gメールの送り先
    MENU: [
            {
              menu: 'タイ式（ストレッチ）',
              timeAndPrice: [[30,3000],[45,4000],[60,5000],[90,7000],[120,9000]]
            },
            {
              menu: 'タイ式（アロマ）',
              timeAndPrice: [[45,5000],[60,7000],[90,9000],[120,12000]]
            },
            {
              menu: '足つぼマッサージ',
              timeAndPrice: [[30,3000],[60,5000]]
            }
          ] //施術メニュー（メニュー名、時間、料金）
  }

})();