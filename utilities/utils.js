export function formatDate(date) {
  if(typeof(date.getFullYear) === 'function'){
    var month = date.getMonth() < 10 ? '0'+(date.getMonth()+1) : (date.getMonth()+1).toString();
    var day = date.getDate() < 10 ? '0'+date.getDate() : date.getDate().toString();
    return date.getFullYear()+'/'+month+'/'+day;
  }
  return 'Error: is not a Date'
}