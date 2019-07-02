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
    session = checkAuth();
    container = $('.cards');
    $.ajax({
        type: "GET",
        url: "/api/v1/devices",
        success: function (data, status) {
            $.each(data.hits, function (index, obj) {
                container.append(
                    `<div class="card">
                        <div class="content">
                            <img class="ui fluid rounded centered image"
                                src="https://previews.123rf.com/images/naddya/naddya1406/naddya140600004/28904692-seamless-background-with-raspberry-vector-illustration.jpg">
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
                )});
        }
    })
}

function postDevice() {
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
            headers: { "Content-Type": "application/json" },
            beforeSend: function () {
                form.addClass("loading")
            },
            success: function (data, status) {
                form.removeClass("loading")
                $('.ui.modal').modal('hide');
                setTimeout(function () {
                    location.reload()
                }, 1000)
            }
        })
    }
}

function putDevice() {
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
            headers: { "Content-Type": "application/json" },
            beforeSend: function () {
                form.addClass("loading")
            },
            success: function (data, status) {
                form.removeClass("loading")
                $('#editModal').modal('hide');
                setTimeout(function () {
                    location.reload()
                }, 1000)
            }
        })
    }
}

function deleteDevice(id, name) {
    check = confirm('Are you sure to delete this device ?')
    if (check) {
        $.ajax({
            type: "DELETE",
            url: "/api/v1/devices?id=" + id,
            success: function (data, status) {
                alert("Device " + name + " deletado com sucesso")
                location.reload();
            }
        })
    }
}

function checkAuth() {
    var token = localStorage.getItem("user-token");
    var session = {}
    if (!token) {
        console.log("nao tem");
        session.valid = false
        session.token = ""
    } else {
        console.log("tem");
        session.token = token;
        $.ajax({
            type: "GET",
            url: "/api/v1/login",
            success: function (data, status) {
                console.log(data);
                if (data.success) {
                    session.valid = true;
                } else {
                    session.valid = true;
                }
            },
            failure: function (data, status) {
                console.log("DATA: " + data + "Status: " + status);
            }
        })
    }
    return session;    
}

function login() {
    data = {}
    data.password = $('[name=loginPass]').val();
    data.username = $('[name=loginUser]').val();
    if (data.password && data.username) {
        $.ajax({
            type: "POST",
            url: "/api/v1/login",
            data: JSON.stringify(data),
            dataType: "json",
            headers: { "Content-Type": "application/json" },
            // beforeSend: function () {
            // form.addClass("loading")
            // },
            success: function (data, status) {
                // form.removeClass("loading")
                // $('#editModal').modal('hide');
                console.log(data.token);
                alert("LOGOU")
            }
        })
    } else {
        alert("Preenche essa merda")
    }
}