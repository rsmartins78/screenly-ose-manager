var data = {};


function loadDevices() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           data = JSON.parse(req.responseText);
        }
    };
    req.open("get", "/api/v1/devices", true);
    req.send();
}