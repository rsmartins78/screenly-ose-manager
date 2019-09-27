Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

async function getTimeScreenly() {
    var today = new Date();
    var endDate = today.addDays(14);
    var DD = today.getDate();
    var DDEnd = endDate.getDate();
    var MM = today.getMonth() + 1;
    var MMEnd = endDate.getMonth() + 1;
    var YYYY = today.getFullYear();
    var YYYYEnd = endDate.getFullYear();
    var data = {};

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

    createdAt = YYYY + "-" + MM + "-" + DD + "T" + hh + ":" + mm + ":" + ss + "Z";
    endAt = YYYYEnd + "-" + MMEnd + "-" + DDEnd + "T" + hh + ":" + mm + ":" + ss + "Z";
    data.created = createdAt;
    data.end = endAt;
    return data;
}

function bounceButton() {
    $('.icon.plus').transition('jiggle');
    $('#addModal').modal('show');
}
function editModal(id, name, address, group, type, serial) {
    obj = {};
    obj.name = name;
    obj.id = id;
    obj.address = address;
    obj.group = group;
    obj.type = type;
    obj.serial = serial;

    $('#dynamicHeader').html('<i class="fab fa-raspberry-pi"></i> Edit device: ' + obj.name)
    $('#editModal').modal('show');
    $('[name=Dynamic-device_name]').val(obj.name)
    $('[name=Dynamic-device_group]').val(obj.group)
    $('[name=Dynamic-device_address]').val(obj.address)
    $('[name=Dynamic-device_serial]').val(obj.serial)
    $('[name=Dynamic-device_type]').val(obj.type)
    $('[name=Dynamic-device_id]').val(obj.id)
}

function editAssetModal(asset) {
    obj = asset;

    $('#assetDynamicHeader').html('<i class="fab fa-raspberry-pi"></i> Edit Asset: ' + obj.name)
    $('#editAssetModal').modal('show');
    $('[name=Dynamic-asset_name]').val(obj.name)
    $('[name=Dynamic-asset_duration]').val(obj.duration)
    $('[name=Dynamic-asset_uri]').val(obj.uri)
    $('[name=Dynamic-asset_type]').val(obj.mimetype)
    $('[name=Dynamic-asset_start-date]').val(obj.start_date)
    $('[name=Dynamic-asset_end-date]').val(obj.end_date)
    $('[name=Dynamic-asset_id]').val(obj.asset_id);
    $('[name=Dynamic-asset_enabled]').val(obj.is_enabled);
}

function addAssetModal() {
    $('#addAssetModal').modal('show');
}

async function getDevice(id, token) {
    obj = {};
    $.ajax({
        type: "GET",
        url: "/api/v1/devices/" + id,
        headers: { "Authorization": "Bearer " + token },
        async: false,
        success: function (data, status) {
            obj = data;
        }
    })
    return obj;
}

function checkAuthType() {
    if(sessionStorage.getItem('authType') === 'undefined') {
        return;
    }

    if (sessionStorage.getItem('authType') !== 'internal') {
        document.querySelector('#changePassButton').style.display = 'none';
    }
}

function getAll() {
    session = {};
    home = $('#body-home');
    session = checkAuth();
    checkAuthType();
    if (session.valid === true) {
        home.removeClass("auth-hidden");
    }
    container = $('.cards');
    $.ajax({
        type: "GET",
        url: "/api/v1/devices",
        headers: { "Authorization": "Bearer " + session.token },
        success: function (data, status) {
            home.append(`${sessionStorage.getItem('group') == "admin" ?
                `<button onclick="bounceButton()" class="addbutton circular large ui icon button">
                        <i class="large icon plus"></i>
                </button>` : ``
                } `
            );
            $.each(data.hits, function (index, obj) {
                container.append(
                    `<div class="card">
                        <div class="content">
                            <div id="image-blur" class="blurring dimmable image">
                                <div class="ui dimmer">
                                    <div class="content">
                                        <div class="center">
                                            <a href="/manage_assets?id=${obj._id}" class="ui inverted button">Manage Assets</a>
                                        </div>
                                    </div>
                                </div>
                                <img class="ui fluid rounded centered image" src="/assets/screenlylogo.png">
                            </div>
                            <div class="ui icon header">
                                <i class="fab fa-raspberry-pi"></i>
                                 ${obj._source.device_name}
                            </div>
                            ${obj._source.online == true ?
                            `<div class="tip right floated" data-tooltip="Device Online" data-position="left center" data-variation="basic">
                                <div class="ui green right ribbon label">
                                    <i class="check icon"></i>
                                </div>
                            </div>` : `<div class="tip right floated" data-tooltip="Device Offline" data-position="left center" data-variation="basic">
                                                <div class="ui red right ribbon label">
                                                    <i class="times circle icon"></i>
                                                </div>
                                            </div>`}
                            <div class="meta">
                                <p>Group: ${obj._source.device_group}</p>
                                <p>IP: ${obj._source.device_address}</p>
                            </div>
                            <div class="description">
                                ${obj._source.device_type}
                            </div>
                        </div>
                        
                            ${sessionStorage.getItem('group') == "admin" ?
                                `
                        <div class="extra content">
                            <div class="ui two buttons">
                                <div onclick="editModal('${obj._id}', '${obj._source.device_name}', '${obj._source.device_address}', '${obj._source.device_group}', '${obj._source.device_type}', '${obj._source.device_serial}')" class="ui basic green button">Edit</div>
                                <div onclick="deleteConfirm('${obj._id}', '${obj._source.device_name}')" class="ui basic red button">
                                    Delete
                                </div>
                                </div>
                        </div>`:``
                            }
                            </div>
                        </div>
                    </div>`
                )
                $('.blurring').dimmer({
                    on: 'hover'
                });
            });
        }
    })
}



function postDevice() {
    session = {};
    session = checkAuth();
    form = $('[name=add_device]')
    data = {}
    message = $('#message')
    data.device_name = $('[name=device_name]').val()
    data.device_group = $('[name=device_group]').val()
    data.device_address = $('[name=device_address]').val()
    data.device_serial = $('[name=device_serial]').val()
    data.device_type = $('[name=device_type]').val()
    data.username = $('[name=device_username]').val()
    data.password = $('[name=device_password]').val()

    if (!data.device_type) {
        data.device_type = "null";
    }
    if (!data.device_serial) {
        data.device_serial = "null";
    }
    if (!data.username) {
        data.username = "null";
    }
    if (!data.password) {
        data.password = "null";
    }


    if (!data.device_address || !data.device_name || !data.device_group) {
        $.uiAlert({
            textHead: 'Error',
            text: 'Please fill all the fields with "*"',
            bgcolor: '#DB2828',
            textcolor: '#fff',
            position: 'top-right', // top And bottom ||  left / center / right
            icon: 'remove circle',
            time: 2
        });
    } else {
        $.ajax({
            type: "POST",
            url: "/api/v1/devices",
            data: JSON.stringify(data),
            dataType: "json",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + session.token },

            beforeSend: function () {
                form.addClass("loading")
            },
            success: function (data, status) {
                form.removeClass("loading")
                $('.ui.modal').modal('hide');
                $.uiAlert({
                    textHead: 'Success',
                    text: 'Device has been successfuly added',
                    bgcolor: '#19c3aa',
                    textcolor: '#fff',
                    position: 'top-right', // top And bottom ||  left / center / right
                    icon: 'checkmark box',
                    time: 2
                });
                setTimeout(function () {
                    location.reload()
                }, 1000)
            },
            error: function (data, status) {
                obj = JSON.parse(data.responseText);
                $.uiAlert({
                    textHead: 'Error',
                    text: 'An error has occured, ' + obj.message,
                    bgcolor: '#DB2828',
                    textcolor: '#fff',
                    position: 'top-right', // top And bottom ||  left / center / right
                    icon: 'remove circle',
                    time: 2
                });
                $('.ui.modal').modal('hide');
            }
        })
    }
}

function putDevice() {
    session = checkAuth();
    form = $('[name=edit_device]')
    data = {}
    message = $('#message')
    data.device_name = $('[name=Dynamic-device_name]').val()
    data.device_group = $('[name=Dynamic-device_group]').val()
    data.device_address = $('[name=Dynamic-device_address]').val()
    data.device_serial = $('[name=Dynamic-device_serial]').val()
    data.device_type = $('[name=Dynamic-device_type]').val()
    data.username = $('[name=Dynamic-device_username]').val()
    data.password = $('[name=Dynamic-device_password]').val()
    data.id = $('[name=Dynamic-device_id]').val();
    name = data.device_name;

    if (!data.device_type) {
        data.device_type = "null"
    }
    if (!data.device_serial) {
        data.device_serial = "null"
    }
    if (!data.username) {
        data.username = "null";
    }
    if (!data.password) {
        data.password = "null";
    }

    if (!data.device_address || !data.device_name || !data.device_group) {
        $.uiAlert({
            textHead: 'Error',
            text: 'Please fill fields with "*"',
            bgcolor: '#DB2828',
            textcolor: '#fff',
            position: 'top-right', // top And bottom ||  left / center / right
            icon: 'remove circle',
            time: 2
        });
    } else {
        $.ajax({
            type: "PUT",
            url: "/api/v1/devices",
            data: JSON.stringify(data),
            dataType: "json",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + session.token },
            beforeSend: function () {
                form.addClass("loading")
            },
            success: function (data, status) {
                $.uiAlert({
                    textHead: 'Success',
                    text: 'Device ' + name + ' has been successfuly edited!',
                    bgcolor: '#19c3aa',
                    textcolor: '#fff',
                    position: 'top-right', // top And bottom ||  left / center / right
                    icon: 'checkmark box',
                    time: 2
                });
                form.removeClass("loading")
                $('#editModal').modal('hide');
                setTimeout(function () {
                    location.reload()
                }, 1000)
            },
            error: function (data, status) {
                obj = JSON.parse(data.responseText);
                $.uiAlert({
                    textHead: 'Error',
                    text: 'An error has occured., ' + obj.message,
                    bgcolor: '#DB2828',
                    textcolor: '#fff',
                    position: 'top-right', // top And bottom ||  left / center / right
                    icon: 'remove circle',
                    time: 2
                });
                $('.ui.modal').modal('hide');
            }
        })
    }
}

function removeConfirm () {
    modal = $('#confirm-modal');
    $('.mini.modal').modal('setting', 'closable', false).modal('hide');
    setTimeout(() => {
        modal.remove();
    }, 300);
}

function deleteConfirm(id, name) {
    area = $('#confirm-area');
    area.append(`<div id="confirm-modal" class="ui mini modal">
                    <div class="header">Are you sure?</div>
                    <div class="content">
                        <p>Delete this device?</p>
                    </div>
                    <div class="actions">
                        <div onclick="removeConfirm()" class="ui deny button">
                            Cancel
                        </div>
                        <div onclick="deleteDevice('${id}','${name}')" class="ui negative right labeled icon button">
                            Delete
                            <i class="trash alternate icon"></i>
                        </div>
                    </div>
                </div>`)
    setTimeout(() => {
        $('.mini.modal').modal('setting', 'closable', false).modal('show');
    }, 100);
}

function deleteDevice(id, name) {
    session = {};
    session = checkAuth()
    $.ajax({
        type: "DELETE",
        url: "/api/v1/devices?id=" + id,
        headers: { "Authorization": "Bearer " + session.token },
        success: function (data, status) {
            $.uiAlert({
                textHead: 'Success',
                text: 'The device ' + name + ' has been deleted!',
                bgcolor: '#19c3aa',
                textcolor: '#fff',
                position: 'top-right', // top And bottom ||  left / center / right
                icon: 'checkmark box',
                time: 2
            });
            setTimeout(function () {
                location.reload()
            }, 2000)
        },
        error: function (data, status) {
            obj = JSON.parse(data.responseText);
            $.uiAlert({
                textHead: 'Error',
                text: 'An error has occured., ' + obj.message,
                bgcolor: '#DB2828',
                textcolor: '#fff',
                position: 'top-right', // top And bottom ||  left / center / right
                icon: 'remove circle',
                time: 2
            });
            $('.ui.modal').modal('hide');
        }
    })
}

function checkRole () {
    if (sessionStorage.getItem('group') == 'admin') {
        $('#adminButtons').append(
            `<div data-inverted="" data-tooltip="Manage users" data-position="right center" data-variation="basic">
                <a href="/manage_users" class="item">
                    <i class="large users icon">
                    </i>
                </a>
                </div>
            </div>`
        )
    }
}

function checkAuth() {
    var token = localStorage.getItem("user-token");
    var session = {}
    var nextLocation = window.location.pathname + window.location.search;
    var tag = $('#user_message');
    var tagContent = tag.find("#user_content");
    if (!token) {
        session.valid = false;
        session.token = undefined;
        localStorage.setItem('next-location', nextLocation);
        location.href = "/login"
    } else {
        session.token = token;
        $.ajax({
            type: "GET",
            url: "/api/v1/login",
            headers: { "Authorization": "Bearer " + session.token },
            async: false,
            success: function (data, status) {
                session.valid = true;
            },
            error: function (data, status) {
                session.valid = false;
                delete session.token;
                localStorage.removeItem("user-token");
                localStorage.setItem('next-location', nextLocation);
                location.href = "/login";
            }
        })
    }
    user_id = sessionStorage.getItem('id');
    $.ajax({
        type: "GET",
        url: "/api/v1/users/" + user_id,
        headers: { "Authorization": "Bearer " + session.token },
        async: false,
        success: function (data, status) {
            sessionStorage.setItem('name', data.name);
            sessionStorage.setItem('authType', data.authType);
        },
        error: function () {
            sessionStorage.setItem('name', "User not founded");
        }
    })
    if (tagContent.length == 0) {
        tag.append(
            `Hello ! <div id="user_content" class="ui sub header">${sessionStorage.getItem('name')}</div>`
        )
    }
    return session;
}

function logout() {
    localStorage.removeItem('user-token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('group');
    location.href = '/login';
}

function login() {
    data = {}
    data.password = $('[name=loginPass]').val();
    data.username = $('[name=loginUser]').val();
    errormessage = $('#errorlogin');
    token = "";
    if (data.password && data.username) {
        $.ajax({
            type: "POST",
            url: "/api/v1/login",
            data: JSON.stringify(data),
            dataType: "json",
            headers: { "Content-Type": "application/json" },
            success: function (data, status) {
                localStorage.setItem('user-token', data.token);
                sessionStorage.setItem('user', data.user);
                sessionStorage.setItem('group', data.group);
                sessionStorage.setItem('id', data.userId);
                if (localStorage.getItem('next-location')) {
                    next = localStorage.getItem('next-location');
                    localStorage.removeItem('next-location');
                    location.href = next;
                } else {
                    location.href = "/home"
                }
            },
            error: function () {
                $.uiAlert({
                    textHead: 'Login Error',
                    text: 'User or password invalid, check the fields',
                    bgcolor: '#DB2828',
                    textcolor: '#fff',
                    position: 'top-right', // top And bottom ||  left / center / right
                    icon: 'remove circle',
                    time: 2
                });
            }
        })
    } else {
        $.uiAlert({
            textHead: 'Login Error',
            text: 'Please fill the fields "username" and "password"',
            bgcolor: '#DB2828',
            textcolor: '#fff',
            position: 'top-right', // top And bottom ||  left / center / right
            icon: 'remove circle',
            time: 2
        });
    }
}

// Assets

async function getAssets() {
    session = {};
    home = $('#body-home');
    session = checkAuth();
    if (session.valid === true) {
        home.removeClass("auth-hidden");
    }
    urlParams = new URLSearchParams(window.location.search);
    table = $('#assets-table table');
    message = $('#nodevices-message');
    buttonContent = $('#addasset-button');
    container = $('#table-container');
    containerFoot = $('#foot-container');
    header = $('header.container');
    count = 0;
    if (urlParams.has('id')) {
        id = urlParams.get('id');
        $('table').tablesort()
        device = await getDevice(id, session.token);
        ip = device.hits[0]._source.device_address;
        $.ajax({
            type: "GET",
            url: "/api/v1/assets/" + ip,
            async: false,
            headers: {
                "DeviceAuth": "Basic " + btoa(device.hits[0]._source.username + ':' + device.hits[0]._source.password),
                "Authorization": "Bearer " + session.token
            },
            success: function (data, status) {
                $.each(data, function (index, obj) {
                    count = count + 1;
                    container.append(
                        `<tr>
                            <td>
                                <h4 class="ui header">
                                    <div class="wrap-text content">
                                       ${obj.name}
                                    </div>
                                </h4>
                            </td>
                            <td>${obj.mimetype}</td>
                            <td>${obj.duration}s</td>
                            <td>${moment(obj.start_date).format('MM/DD/YYYY, HH:MM:SS')}s</td>
                            <td>${moment(obj.end_date).format('MM/DD/YYYY, HH:MM:SS')}s</td>
                            <td class="center aligned">
                                ${obj.is_active == 1 ?
                            `<div onclick="assetToggle('${obj.asset_id}')" class="ui toggle checkbox checked">
                                        <input id="${obj.asset_id}" type="checkbox" checked="" tabindex="0" class="hidden">
                                        <label></label>
                                    </div>` : `<div onclick="assetToggle('${obj.asset_id}')" class="ui toggle checkbox">
                                                    <input id="${obj.asset_id}" type="checkbox" tabindex="0" class="hidden">
                                                    <label></label>
                                                </div>`}
                            </td>
                            <td class="center aligned action-group">
                                <div onclick=deleteAssetConfirm('${obj.asset_id}','${id}') class="table-action" data-tooltip="Delete asset" data-position="top center" data-variation="basic">
                                    <i class="large delete link icon"></i>
                                </div>
                                <div onclick=editAsset('${obj.asset_id}','${id}') class="table-action" data-tooltip="Edit asset" data-position="top center" data-variation="basic">
                                    <i class="large edit link icon"></i>
                                </div>
                            </td>
                        </tr>`
                    )
                });
                header.append(`<p class="">${device.hits[0]._source.device_name}</p>`)
                buttonContent.append(`
                    <div onclick="addAssetModal()" class="ui blue button">
                        <i class="add icon"></i> Add Asset
                    </div>
                    <a class="ui basic left pointing blue label">
                        ${count}
                    </a>
                    `)
                containerFoot.append(
                    `<tr>
                        <th class="center aligned">${count} assets</th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>`
                )
            }
        })
    } else {
        table.addClass("content-hidden");
        message.removeClass("hidden");
    }

    // Ativa tab de menu da modal de addasset
    $('.menu .item').tab();
}

function deleteAssetConfirm (id, device_id) {
    area = $('#confirm-area');
    area.append(`<div id="confirm-modal" class="ui mini modal">
                    <div class="header">Are you sure?</div>
                    <div class="content">
                        <p>Delete this asset?</p>
                    </div>
                    <div class="actions">
                        <div onclick="removeConfirm()" class="ui deny button">
                            Cancel
                        </div>
                        <div onclick="deleteAsset('${id}','${device_id}')" class="ui negative right labeled icon button">
                            Delete
                            <i class="trash alternate icon"></i>
                        </div>
                    </div>
                </div>`)
    setTimeout(() => {
        $('.mini.modal').modal('setting', 'closable', false).modal('show');
    }, 100);
}

async function deleteAsset(id, device_id) {
    session = {};
    session = checkAuth();
    device = await getDevice(device_id, session.token);
    ip = device.hits[0]._source.device_address;
    $.ajax({
        type: "DELETE",
        url: "/api/v1/assets/" + ip + "/" + id,
        headers: { "Authorization": "Bearer " + session.token, "DeviceAuth": "Basic " + btoa(device.hits[0]._source.username + ':' + device.hits[0]._source.password) },
        success: function (data, status) {
            $.uiAlert({
                textHead: 'Success',
                text: 'The asset has been deleted!',
                bgcolor: '#19c3aa',
                textcolor: '#fff',
                position: 'top-right', // top And bottom ||  left / center / right
                icon: 'checkmark box',
                time: 2
            });
            setTimeout(function () {
                location.reload()
            }, 2000)
        },
        error: function (data, status) {
            $.uiAlert({
                textHead: 'Failed to delete asset',
                text: 'Please try again later.',
                bgcolor: '#DB2828',
                textcolor: '#fff',
                position: 'top-right', // top And bottom ||  left / center / right
                icon: 'remove circle',
                time: 2
            });
            setTimeout(function () {
                location.reload()
            }, 2000)
        }
    })
}

async function editAsset(id, device_id) {
    session = {};
    session = checkAuth();
    device = await getDevice(device_id, session.token);
    ip = device.hits[0]._source.device_address;
    $.ajax({
        type: "GET",
        url: "/api/v1/assets/" + ip + "/" + id,
        headers: { "Authorization": "Bearer " + session.token, "DeviceAuth": "Basic " + btoa(device.hits[0]._source.username + ':' + device.hits[0]._source.password) },
        success: function (data, status) {
            editAssetModal(data)
        },
        error: function (data, status) {
            console.log(data)
        }
    })
}

async function sendEditedAsset(asset_id) {
    session = {};
    session = checkAuth();

    form = $('#edit_asset');
    data = {}
    data.name = $('[name=Dynamic-asset_name]').val();
    data.duration = $('[name=Dynamic-asset_duration]').val();
    data.uri = $('[name=Dynamic-asset_uri]').val();
    data.mimetype = $('[name=Dynamic-asset_type]').val();
    data.start_date = $('[name=Dynamic-asset_start-date]').val();
    data.end_date = $('[name=Dynamic-asset_end-date]').val();
    data.asset_id = $('[name=Dynamic-asset_id]').val();
    data.is_enabled = parseInt($('[name=Dynamic-asset_enabled]').val());
    data.is_processing = 0;
    data.nocache = 0;
    data.playorder = 0;
    data.skip_asset_check = "0";


    if (urlParams.has('id')) {
        id = urlParams.get('id');
        device = await getDevice(id, session.token);
        ip = device.hits[0]._source.device_address;
        username = device.hits[0]._source.username;
        password = device.hits[0]._source.password;
        $.ajax({
            type: "PUT",
            url: "/api/v1/assets/" + ip + "/" + data.asset_id,
            data: JSON.stringify(data),
            dataType: "json",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + session.token,
                "DeviceAuth": "Basic " + btoa(username + ':' + password)
            },

            beforeSend: function () {
                form.addClass("loading")
            },
            success: function (data, status) {
                form.removeClass("loading")
                $.uiAlert({
                    textHead: 'Success',
                    text: 'The asset has been updated!',
                    bgcolor: '#19c3aa',
                    textcolor: '#fff',
                    position: 'top-right', // top And bottom ||  left / center / right
                    icon: 'checkmark box',
                    time: 2
                });
                $('.ui.modal').modal('hide');
                setTimeout(function () {
                    location.reload()
                }, 1000)
            },
            error: function (data, status) {
                obj = JSON.parse(data.responseText);
                $.uiAlert({
                    textHead: 'Failed to update asset',
                    text: 'Please try again later. Error: ' + obj.message,
                    bgcolor: '#DB2828',
                    textcolor: '#fff',
                    position: 'top-right', // top And bottom ||  left / center / right
                    icon: 'remove circle',
                    time: 2
                });
                $('.ui.modal').modal('hide');
            }
        })
    }
}

async function addAsset() {
    session = {};
    session = checkAuth();
    form = $('[name=add_asset]');
    data = {};
    time = {};
    message = $('#messageadd_asset');
    data.play_order = 0;
    data.name = $('[name=asset_name]').val();
    data.uri = $('[name=asset_uri]').val();
    data.duration = $('[name=asset_duration]').val();
    data.mimetype = "webpage"

    time = await getTimeScreenly();

    data.start_date = time.created;
    data.end_date = time.end;

    if ($('[name=asset_enabled]:checked').length != 0) {
        data.is_enabled = 1;
    } else {
        data.is_enabled = 0;
    }

    if ($('[name=asset_skipcheck]:checked').length != 0) {
        data.skip_asset_check = 1;
    } else {
        data.skip_asset_check = 0;
    }

    if ($('[name=asset_nocache]:checked').length != 0) {
        data.nocache = 1;
    } else {
        data.nocache = 0;
    }

    if (!data.name || !data.uri || !data.duration) {
        $.uiAlert({
            textHead: 'Error',
            text: 'Please fill all fields with "*"',
            bgcolor: '#DB2828',
            textcolor: '#fff',
            position: 'top-right', // top And bottom ||  left / center / right
            icon: 'remove circle',
            time: 2
        });
    } else {
        if (urlParams.has('id')) {
            id = urlParams.get('id');
            $('table').tablesort()
            device = await getDevice(id, session.token);
            ip = device.hits[0]._source.device_address;
            username = device.hits[0]._source.username;
            password = device.hits[0]._source.password;
            $.ajax({
                type: "POST",
                url: "/api/v1/assets/" + ip,
                data: JSON.stringify(data),
                dataType: "json",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + session.token,
                    "DeviceAuth": "Basic " + btoa(username + ':' + password)
                },

                beforeSend: function () {
                    form.addClass("loading")
                },
                success: function (data, status) {
                    form.removeClass("loading")
                    $('.ui.modal').modal('hide');
                    $.uiAlert({
                        textHead: 'Success',
                        text: 'The asset has been added!',
                        bgcolor: '#19c3aa',
                        textcolor: '#fff',
                        position: 'top-right', // top And bottom ||  left / center / right
                        icon: 'checkmark box',
                        time: 2
                    });
                    setTimeout(function () {
                        location.reload()
                    }, 1000)
                },
                error: function (data, status) {
                    obj = JSON.parse(data.responseText);
                    $.uiAlert({
                        textHead: 'Failed to add asset',
                        text: 'Please try again later. Error: ' + obj.message,
                        bgcolor: '#DB2828',
                        textcolor: '#fff',
                        position: 'top-right', // top And bottom ||  left / center / right
                        icon: 'remove circle',
                        time: 2
                    });
                    $('.ui.modal').modal('hide');
                }
            })
        }
    }
}
async function assetToggle(asset_id) {
    el = $('#' + asset_id);
    if (urlParams.has('id')) {

        device_id = urlParams.get('id');
        device = await getDevice(device_id, session.token);
        ip = device.hits[0]._source.device_address;
        username = device.hits[0]._source.username;
        password = device.hits[0]._source.password;
        obj = {};
        $.ajax({
            type: "GET",
            url: "/api/v1/assets/" + ip + "/" + asset_id,
            headers: {
                "Authorization": "Bearer " + session.token,
                "DeviceAuth": "Basic " + btoa(username + ':' + password)
            },
            async: false,
            success: function (data, status) {
                obj = data;
            },
            error: function (data, status) {
                obj = JSON.parse(data.message);
            }
        })
        if (obj.is_enabled == 1) {
            obj.is_enabled = 0;
            obj.is_active = 0;
        } else {
            obj.is_enabled = 1;
            obj.is_active = 1;
        }


        delete obj.asset_id;
        delete obj.is_processing;

        $.ajax({
            type: "PUT",
            url: "/api/v1/assets/" + ip + "/" + asset_id,
            data: JSON.stringify(obj),
            dataType: "json",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + session.token,
                "DeviceAuth": "Basic " + btoa(username + ':' + password)
            },
            beforeSend: function () {
                el.addClass("disabled");
            },
            success: function (data, status) {
                el.prop("checked", !el.prop("checked"));
            },
            error: function (data, status) {
                obj = JSON.parse(data.message);
                $.uiAlert({
                    textHead: 'Failed to change state of asset',
                    text: 'Please try again later. Error: ' + obj.message,
                    bgcolor: '#DB2828',
                    textcolor: '#fff',
                    position: 'top-right', // top And bottom ||  left / center / right
                    icon: 'remove circle',
                    time: 2
                });
            }
        })
        el.removeClass("disabled");
    }
}

async function addFileAsset() {
    session = {};
    session = checkAuth();

    var dataForm = new FormData();
    file_name = "";
    form = $('#add_assetFile');
    $.each($('#asset_file')[0].files, function (i, file) {
        dataForm.append('formData', file);
        file_name = file.name;
    });

    obj = {};

    device_id = urlParams.get('id')

    device = await getDevice(device_id, session.token);
    ip = device.hits[0]._source.device_address;
    username = device.hits[0]._source.username;
    password = device.hits[0]._source.password;
    $.ajax({
        type: "POST",
        url: '/api/v1/fileassets/' + ip,
        data: dataForm,
        async: false,
        cache: false,
        contentType: false,
        processData: false,
        headers: {
            "Authorization": "Bearer " + session.token,
            "DeviceAuth": "Basic " + btoa(username + ':' + password),
        },
        beforeSend: function () {
            form.addClass("loading")
        },
        success: function (data) {
            obj = data;
        },
        error: function (data) {
            $.uiAlert({
                textHead: 'Failed to send file to device',
                text: 'Please try again later. Error: ' + obj.message,
                bgcolor: '#DB2828',
                textcolor: '#fff',
                position: 'top-right', // top And bottom ||  left / center / right
                icon: 'remove circle',
                time: 2
            });
        }
    });

    data = {};
    time = {};
    data.play_order = 0;
    data.name = file_name;
    data.uri = obj.path;
    // data.duration = $('[name=asset_duration]').val();
    data.mimetype = obj.mimetype;

    time = await getTimeScreenly();

    data.start_date = time.created;
    data.end_date = time.end;
    data.duration = "0";
    data.is_enabled = 0;
    data.is_active = 1;
    data.skip_asset_check = 0;
    data.nocache = 0;

    $.ajax({
        type: "POST",
        url: "/api/v1/assets/" + ip,
        data: JSON.stringify(data),
        dataType: "json",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + session.token,
            "DeviceAuth": "Basic " + btoa(username + ':' + password)
        },
        success: function (data, status) {
            form.removeClass("loading")
            $('.ui.modal').modal('hide');
            $.uiAlert({
                textHead: 'Success',
                text: 'The asset has been added!',
                bgcolor: '#19c3aa',
                textcolor: '#fff',
                position: 'top-right', // top And bottom ||  left / center / right
                icon: 'checkmark box',
                time: 2
            });
            setTimeout(function () {
                location.reload()
            }, 1000)
        },
        error: function (data, status) {
            obj = JSON.parse(data.responseText);
            $.uiAlert({
                textHead: 'Failed to add asset',
                text: 'Please try again later. Error: ' + obj.message,
                bgcolor: '#DB2828',
                textcolor: '#fff',
                position: 'top-right', // top And bottom ||  left / center / right
                icon: 'remove circle',
                time: 2
            });
            $('.ui.modal').modal('hide');
        }
    })
}

// Users

async function getUsers() {
    session = {};
    home = $('#body-home');
    session = checkAuth();
    checkAuthType();
    if (session.valid === true) {
        home.removeClass("auth-hidden");
    }
    urlParams = new URLSearchParams(window.location.search);
    table = $('#assets-table table');
    message = $('#nousers-message');
    buttonContent = $('#adduser-button');
    container = $('#table-container');
    containerFoot = $('#foot-container');
    count = 0;
    $.ajax({
        type: "GET",
        url: "/api/v1/admin/users",
        async: false,
        headers: {
            "Authorization": "Bearer " + session.token,
        },
        success: function (data, status) {
            if (data.length > 0) {
                $.each(data, function (index, obj) {
                    count = count + 1;
                    container.append(
                        `<tr>
                                <td>
                                    <h4 class="ui image header">
                                        <img src="https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/user_male2-512.png"
                                            class="ui mini rounded image">
                                        <div class="wrap-text content">
                                           ${obj._source.username}
                                        </div>
                                    </h4>
                                </td>
                                <td>${obj._source.name}</td>
                                <td>${obj._source.group}</td>
                                <td>${obj._source.authType ||  'internal'}</td>
                                <td class="center aligned">${obj._source.lastLoginAt}s</td>
                                <td class="center aligned action-group">
                                    <div onclick="deleteUserConfirm('${obj._id}')" class="table-action" data-tooltip="Delete User" data-position="top center" data-variation="basic">
                                        <i class="large delete link icon"></i>
                                    </div>
                                    <div onclick="editUserModal('${obj._id}','${obj._source.name}','${obj._source.username}','${obj._source.group}')" class="table-action" data-tooltip="Edit User" data-position="top center" data-variation="basic">
                                        <i class="large edit link icon"></i>
                                    </div>
                                </td>
                            </tr>`
                    )
                });
                buttonContent.append(`
                        <div onclick="addUserModal()" class="ui blue button">
                            <i class="add icon"></i> Add User
                        </div>
                        <a class="ui basic left pointing blue label">
                            ${count}
                        </a>
                        `)
                containerFoot.append(
                    `<tr>
                            <th class="center aligned">${count} users</th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                        </tr>`
                )
            } else {
                table.addClass("content-hidden");
                message.removeClass("hidden");
            }
        }
    })
}

function addUserModal() {
    $('#addUserModal').modal('show');
}

function editUserModal(id, name, username, group) {
    $('#editUserModal').modal('show');
    $('[name=Dynamic-id]').val(id);
    $('[name=Dynamic-name_user]').val(name);
    $('[name=Dynamic-user_name]').val(username);
    $('[name=Dynamic-user_group]').val(group);
}

function changePassModal () {
    $('#changePasswordModal').modal('show');
}

function changePassword () {
    session = {};
    session = checkAuth();
    passmessage = $('#errorpassword');
    successmessage = $('#successpassword');
    form = $('#change_password');
    data = {};

    data.username = sessionStorage.getItem('user');
    data.old_password = $('[name=Dynamic-old_pass]').val();
    data.new_password = $('[name=Dynamic-new_pass]').val();
    confirm = $('[name=Dynamic-new_confirm]').val();
    if (data.new_password == confirm) {
        $.ajax({
            type: "PUT",
            url: "/api/v1/users",
            data: JSON.stringify(data),
            dataType: "json",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + session.token,
            },

            beforeSend: function () {
                form.addClass("loading")
            },
            success: function (data, status) {
                setTimeout(function () {
                    form.removeClass("loading");
                    $('.ui.modal').modal('hide');
                    $.uiAlert({
                        textHead: 'Success',
                        text: 'Password has been changed!',
                        bgcolor: '#19c3aa',
                        textcolor: '#fff',
                        position: 'top-right', // top And bottom ||  left / center / right
                        icon: 'checkmark box',
                        time: 2
                    });
                }, 1000)
            },
            error: function (data, status) {
                obj = JSON.parse(data.responseText);
                $.uiAlert({
                    textHead: 'Error',
                    text: 'An error has occured., ' + obj.message,
                    bgcolor: '#DB2828',
                    textcolor: '#fff',
                    position: 'top-right', // top And bottom ||  left / center / right
                    icon: 'remove circle',
                    time: 2
                });
                $('.ui.modal').modal('hide');
            }
        })
    } else {
        $.uiAlert({
            textHead: 'Error',
            text: 'Passwords dont match!',
            bgcolor: '#DB2828',
            textcolor: '#fff',
            position: 'top-right', // top And bottom ||  left / center / right
            icon: 'remove circle',
            time: 2
        });
    }
}

function editUser() {
    session = {};
    session = checkAuth();
    form = $("#edit_user");

    id = $('[name=Dynamic-id]').val();
    data = {};
    data.name = $('[name=Dynamic-name_user]').val();
    data.username = $('[name=Dynamic-user_name]').val();
    data.password = $('[name=Dynamic-user_password]').val();
    data.group = $('[name=Dynamic-user_group]').val();

    user = data.name;

    $.ajax({
        type: "PUT",
        url: "/api/v1/admin/users/" + id,
        data: JSON.stringify(data),
        dataType: "json",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + session.token,
        },

        beforeSend: function () {
            form.addClass("loading")
        },
        success: function (data, status) {
            setTimeout(function () {
                // form.removeClass("loading");
                // $('.ui.modal').modal('hide');
                location.reload();
            }, 1500)
            $.uiAlert({
                textHead: 'Success',
                text: 'The user ' + user + ' has been updated!',
                bgcolor: '#19c3aa',
                textcolor: '#fff',
                position: 'top-right', // top And bottom ||  left / center / right
                icon: 'checkmark box',
                time: 2
            });
        },
        error: function (data, status) {
            obj = JSON.parse(data.responseText);
            $.uiAlert({
                textHead: 'Error',
                text: 'An error has occured., ' + obj.message,
                bgcolor: '#DB2828',
                textcolor: '#fff',
                position: 'top-right', // top And bottom ||  left / center / right
                icon: 'remove circle',
                time: 2
            });
            $('.ui.modal').modal('hide');
        }
    })
}

function deleteUserConfirm (id) {
    area = $('#confirm-area');
    area.append(`<div id="confirm-modal" class="ui mini modal">
                    <div class="header">Are you sure?</div>
                    <div class="content">
                        <p>Delete this user?</p>
                    </div>
                    <div class="actions">
                        <div onclick="removeConfirm()" class="ui deny button">
                            Cancel
                        </div>
                        <div onclick="deleteUser('${id}')" class="ui negative right labeled icon button">
                            Delete
                            <i class="trash alternate icon"></i>
                        </div>
                    </div>
                </div>`)
    setTimeout(() => {
        $('.mini.modal').modal('setting', 'closable', false).modal('show');
    }, 100);
}

function deleteUser(id) {
    session = {};
    session = checkAuth();

    $.ajax({
        type: "DELETE",
        url: "/api/v1/admin/users/" + id,
        headers: {
            "Authorization": "Bearer " + session.token,
        },
        success: function (data, status) {
            $.uiAlert({
                textHead: 'Success',
                text: 'The user ' + name + ' has been deleted!',
                bgcolor: '#19c3aa',
                textcolor: '#fff',
                position: 'top-right', // top And bottom ||  left / center / right
                icon: 'checkmark box',
                time: 2
            });
            location.reload();
        },
        error: function (data, status) {
            obj = JSON.parse(data.responseText);
            $.uiAlert({
                textHead: 'Error',
                text: 'An error has occured., ' + obj.message,
                bgcolor: '#DB2828',
                textcolor: '#fff',
                position: 'top-right', // top And bottom ||  left / center / right
                icon: 'remove circle',
                time: 2
            });
        }
    })
}

function addUser() {
    session = {};
    session = checkAuth();

    data = {}
    data.username = $('[name=user_name]').val()
    data.password = $('[name=user_password]').val()
    data.name = $('[name=name]').val()
    conf_pass = $('[name=conf_password]').val()
    data.group = $('[name=user_group]').val()
    passmessage = $('#errorpassword')
    form = $('[name=add_user]');

    if (data.username && data.password && conf_pass && data.group && data.name) {
        if (data.password == conf_pass) {
            $.ajax({
                type: "POST",
                url: "/api/v1/admin/users",
                data: JSON.stringify(data),
                dataType: "json",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + session.token,
                },

                beforeSend: function () {
                    form.addClass("loading")
                },
                success: function (data, status) {
                    setTimeout(function () {
                        form.removeClass("loading")
                        $.uiAlert({
                            textHead: 'Success',
                            text: 'User has been sucessfully added!',
                            bgcolor: '#19c3aa',
                            textcolor: '#fff',
                            position: 'top-right', // top And bottom ||  left / center / right
                            icon: 'checkmark box',
                            time: 2
                        });
                        $('.ui.modal').modal('hide');
                        location.reload()
                    }, 2500)
                },
                error: function (data, status) {
                    obj = JSON.parse(data.responseText);
                    $.uiAlert({
                        textHead: 'Error',
                        text: 'An error has occured., ' + obj,
                        bgcolor: '#DB2828',
                        textcolor: '#fff',
                        position: 'top-right', // top And bottom ||  left / center / right
                        icon: 'remove circle',
                        time: 2
                    });
                    $('.ui.modal').modal('hide');
                }
            })
        } else {
            $.uiAlert({
                textHead: 'Error',
                text: 'Passwords dont match!',
                bgcolor: '#DB2828',
                textcolor: '#fff',
                position: 'top-right', // top And bottom ||  left / center / right
                icon: 'remove circle',
                time: 2
            });
        }
    } else {
        $.uiAlert({
            textHead: 'Error',
            text: 'Please fill the fields with "*"',
            bgcolor: '#DB2828',
            textcolor: '#fff',
            position: 'top-right', // top And bottom ||  left / center / right
            icon: 'remove circle',
            time: 2
        });
    }

}