(()=>{

  module.exports = {
    OPENTIME: 12, //開店時間
    CLOSETIME: 24, //閉店時間
    REGULAR_CLOSE: [], //定休日（整数、配列型式で入力）
    FUTURE_LIMIT: 3, //何日先まで予約可能か
    NUMBER_OF_SHIFTS: 7, //何日先のシフトまで入力するか
    SHIFTS_LEFT: 7,　//南日前までのシフトを残すか
    PASSWORD: 'パスワード', //管理画面用URL
    ADMIN_EMAIL_FROM: 'kentaro523@gmail.com',
    ADMIN_EMAIL_TO: 'waruemon.xyz@gmail.com'
  }

})();