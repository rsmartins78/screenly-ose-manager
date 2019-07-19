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
    $('[name=Dynamic-asset_start-date]').val(obj.start_date)
    $('[name=Dynamic-asset_end-date]').val(obj.end_date)
}

function addAssetModal() {
    $('#addAssetModal').modal('show');
}

async function getDevice(id, token) {
    obj = {};
    $.ajax({
        type: "GET",
        url: "/api/v1/devices?id=" + id,
        headers: { "Authorization": "Bearer " + token },
        async: false,
        success: function (data, status) {
            obj = data;
        }
    })
    return obj;
}


function getAll() {
    session = {};
    home = $('#body-home');
    session = checkAuth();
    if (session.valid === true) {
        home.removeClass("auth-hidden");
    }
    container = $('.cards');
    $.ajax({
        type: "GET",
        url: "/api/v1/devices",
        headers: { "Authorization": "Bearer " + session.token },
        success: function (data, status) {
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
                                "${obj._source.device_name}"
                            </div>
                            <div class="tip right floated" data-tooltip="Device Online" data-position="left center" data-variation="basic">
                                <div class="ui green right ribbon label">
                                    <i class="play icon"></i>
                                </div>
                            </div>
                            <div class="meta">
                                <p>Group: "${obj._source.device_group}"</p>
                                <p>Ip: "${obj._source.device_address}"</p>
                            </div>
                            <div class="description">
                                "${obj._source.device_type}"
                            </div>
                        </div>
                        <div class="extra content">
                            <div class="ui two buttons">
                                <div onclick="editModal('${obj._id}', '${obj._source.device_name}', '${obj._source.device_address}', '${obj._source.device_group}', '${obj._source.device_type}', '${obj._source.device_serial}')" class="ui basic green button">Edit</div>
                                <div onclick="deleteDevice('${obj._id}', '${obj._source.device_name}')" class="ui basic red button">Delete</div>
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

async function deleteAsset(id, device_id) {
    session = {};
    check = confirm('Are you sure to delete this asset ?')
    if (check) {
        session = checkAuth();
        device = await getDevice(device_id, session.token);
        ip = device.hits[0]._source.device_address;
        $.ajax({
            type: "DELETE",
            url: "/api/v1/assets/" + ip + "/" + id,
            headers: { "Authorization": "Bearer " + session.token, "DeviceAuth": "Basic " + btoa(device.hits[0]._source.username + ':' + device.hits[0]._source.password) },
            success: function (data, status) {
                alert(data.message);
            },
            error: function (data, status) {
                alert(data.message);
                location.reload();
            }
        })
    }
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
        message.closest('.message').transition('fade');
        setTimeout(function () {
            message.closest('.message').transition('fade')
        }, 2000);
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
                    setTimeout(function () {
                        location.reload()
                    }, 1000)
                },
                error: function (data, status) {
                    obj = JSON.parse(data.responseText);
                    alert("An error occured, Status: " + obj);
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
                alert("An error occured, Status: " + obj);
            }
        })
        if (obj.is_enabled == 1) {
            obj.is_enabled = 0;
        } else {
            obj.is_enabled = 1;
        }


        delete obj.asset_id;
        delete obj.is_processing;

        console.log(obj);

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
                alert("An error occured, Status: " + obj);
            }
        })
        el.removeClass("disabled");
    }
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
        $('#message').closest('.message').transition('fade');
        setTimeout(function () {
            $('#message').closest('.message').transition('fade')
        }, 2000);
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
                setTimeout(function () {
                    location.reload()
                }, 1000)
            },
            error: function (data, status) {
                obj = JSON.parse(data.responseText);
                alert("An error occured, Status: " + obj.message);
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
        $('#message').closest('.message').transition('fade');
        setTimeout(function () {
            $('#message').closest('.message').transition('fade')
        }, 2000);
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
                form.removeClass("loading")
                $('#editModal').modal('hide');
                setTimeout(function () {
                    location.reload()
                }, 1000)
            },
            error: function (data, status) {
                obj = JSON.parse(data.responseText);
                alert("An error occured, Status: " + obj.message);
                $('.ui.modal').modal('hide');
            }
        })
    }
}

function deleteDevice(id, name) {
    session = {};
    check = confirm('Are you sure to delete this device ?')
    if (check) {
        session = checkAuth()
        $.ajax({
            type: "DELETE",
            url: "/api/v1/devices?id=" + id,
            headers: { "Authorization": "Bearer " + session.token },
            success: function (data, status) {
                alert("Device " + name + " has been deleted")
                location.reload();
            },
            error: function (data, status) {
                obj = JSON.parse(data.responseText);
                alert("An error occured, Status: " + obj.message);
                $('.ui.modal').modal('hide');
            }
        })
    }
}

function checkAuth() {
    var token = localStorage.getItem("user-token");
    var session = {}
    var nextLocation = window.location.pathname + window.location.search;
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
    return session;
}

function logout() {
    localStorage.removeItem('user-token');
    location.href = '/login';
}

function login() {
    data = {}
    data.password = $('[name=loginPass]').val();
    data.username = $('[name=loginUser]').val();
    token = "";
    if (data.password && data.username) {
        $.ajax({
            type: "POST",
            url: "/api/v1/login",
            data: JSON.stringify(data),
            dataType: "json",
            headers: { "Content-Type": "application/json" },
            success: function (data, status) {
                // form.removeClass("loading")
                // $('#editModal').modal('hide');
                localStorage.setItem('user-token', data.token);
                if (localStorage.getItem('next-location')) {
                    next = localStorage.getItem('next-location');
                    localStorage.removeItem('next-location');
                    location.href = next;
                } else {
                    location.href = "/home"
                }
            }
        })
    } else {
        alert("The fields cant be blank!")
    }
}

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
                                <h4 class="ui image header">
                                    <img src="https://previews.123rf.com/images/naddya/naddya1406/naddya140600004/28904692-seamless-background-with-raspberry-vector-illustration.jpg"
                                        class="ui mini rounded image">
                                    <div class="wrap-text content">
                                       ${obj.name}
                                    </div>
                                </h4>
                            </td>
                            <td>${obj.mimetype}</td>
                            <td>${obj.duration}s</td>
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
                                <div onclick=deleteAsset('${obj.asset_id}','${id}') class="table-action" data-tooltip="Delete asset" data-position="top center" data-variation="basic">
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
                    </tr>`
                )
            }
        })
    } else {
        table.addClass("content-hidden");
        message.removeClass("hidden");
    }
}

// Users

async function getUsers() {
    session = {};
    home = $('#body-home');
    session = checkAuth();
    if (session.valid === true) {
        home.removeClass("auth-hidden");
    }
    urlParams = new URLSearchParams(window.location.search);
    table = $('#assets-table table');
    message = $('#nousers-message');
    buttonContent = $('#adduser-button');
    container = $('#table-container');
    containerFoot = $('#foot-container');
    header = $('header.container');
    count = 0;
    $.ajax({
        type: "GET",
        url: "/api/v1/admin/users",
        async: false,
        headers: {
            "Authorization": "Bearer " + session.token,
        },
        success: function (data, status) {
            $.each(data, function (index, obj) {
                console.log(obj);
                //     count = count + 1;
                //     container.append(
                //         `<tr>
                //                 <td>
                //                     <h4 class="ui image header">
                //                         <img src="https://previews.123rf.com/images/naddya/naddya1406/naddya140600004/28904692-seamless-background-with-raspberry-vector-illustration.jpg"
                //                             class="ui mini rounded image">
                //                         <div class="wrap-text content">
                //                            ${obj.name}
                //                         </div>
                //                     </h4>
                //                 </td>
                //                 <td>${obj.mimetype}</td>
                //                 <td>${obj.duration}s</td>
                //                 <td class="center aligned">
                //                     ${obj.is_active == 1 ?
                //             `<div onclick="assetToggle('${obj.asset_id}')" class="ui toggle checkbox checked">
                //                             <input id="${obj.asset_id}" type="checkbox" checked="" tabindex="0" class="hidden">
                //                             <label></label>
                //                         </div>` : `<div onclick="assetToggle('${obj.asset_id}')" class="ui toggle checkbox">
                //                                         <input id="${obj.asset_id}" type="checkbox" tabindex="0" class="hidden">
                //                                         <label></label>
                //                                     </div>`}
                //                 </td>
                //                 <td class="center aligned action-group">
                //                     <div onclick=deleteAsset('${obj.asset_id}','${id}') class="table-action" data-tooltip="Delete asset" data-position="top center" data-variation="basic">
                //                         <i class="large delete link icon"></i>
                //                     </div>
                //                     <div onclick=editAsset('${obj.asset_id}','${id}') class="table-action" data-tooltip="Edit asset" data-position="top center" data-variation="basic">
                //                         <i class="large edit link icon"></i>
                //                     </div>
                //                 </td>
                //             </tr>`
                //     )
                // });
                // header.append(`<p class="">${device.hits[0]._source.device_name}</p>`)
                // buttonContent.append(`
                //         <div onclick="addAssetModal()" class="ui blue button">
                //             <i class="add icon"></i> Add Asset
                //         </div>
                //         <a class="ui basic left pointing blue label">
                //             ${count}
                //         </a>
                //         `)
                // containerFoot.append(
                //     `<tr>
                //             <th class="center aligned">${count} assets</th>
                //             <th></th>
                //             <th></th>
                //             <th></th>
                //             <th></th>
                //         </tr>`
                // )
            })
            // } else {
            //     table.addClass("content-hidden");
            //     message.removeClass("hidden");
            // }
        }
    })
}