async function getTime() {
    var today = new Date();
    var DD = today.getDate();
    var MM = today.getMonth() + 1;
    var YYYY = today.getFullYear();
  
    var hh = today.getHours();
    var mm = today.getMinutes();
    var ss = today.getSeconds();
  
    if (DD < 10) {
      var DD = "0" + DD;
    }
    if (MM < 10) {
      var MM = "0" + MM;
    }
    if (mm < 10) {
      var mm = "0" + mm;
    }
    if (hh < 10) {
      var hh = "0" + hh;
    }
    if (ss < 10) {
      var ss = "0" + ss;
    }
    return (createdAt =
      YYYY + "/" + MM + "/" + DD + " " + hh + ":" + mm + ":" + ss);
  }

module.exports = getTime;