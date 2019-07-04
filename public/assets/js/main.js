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
                                        <a href="/manage_assets" class="ui inverted button">Manage Assets</a>
                                    </div>
                                    </div>
                                </div>
                                <img class="ui fluid rounded centered image" src="https://previews.123rf.com/images/naddya/naddya1406/naddya140600004/28904692-seamless-background-with-raspberry-vector-illustration.jpg">
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
                $('#image-blur').dimmer({
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

    if (!data.device_type) {
        data.device_type = "null"
    }
    if (!data.device_serial) {
        data.device_serial = "null"
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
    data.id = $('[name=Dynamic-device_id]').val();

    if (!data.device_type) {
        data.device_type = "null"
    }
    if (!data.device_serial) {
        data.device_serial = "null"
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
    if (!token) {
        session.valid = false;
        session.token = undefined;
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
                delete session.token
                location.href = "/login"
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
                location.href = "/home";
            }
        })
    } else {
        alert("The fields cant be blank!")
    }
}