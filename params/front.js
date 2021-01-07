(()=>{
  export const API_URL = 'https://linebot-schedule.herokuapp.com/api/';
  export const WEEKS = ["日", "月", "火", "水", "木", "金", "土"];
  export const REGULAR_CLOSE = [];
  export const ONEHOUR = 60*60*1000;
  export const ONEDAY = 24*ONEHOUR;
  export const ONEWEEK = ONEDAY*7;
  export const OPENTIME = 12;
  export const CLOSETIME = 24;
  export const MENU = [
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
  ]
  export const MENU_E = ['stretch','aroma','foot'];
})();