function bounceButton() {
    $('.icon.plus').transition('jiggle');
    $('#addModal').modal('show');
}

function editModal(device) {
    obj = JSON.parse(device)
    $('#dynamicHeader').html('<i class="fab fa-raspberry-pi"></i> Edit device: ' + obj._source.device_name)
    $('#editModal').modal('show');
    $('[name=Dynamic-device_name]').val(obj._source.device_name)
    $('[name=Dynamic-device_group]').val(obj._source.device_group)
    $('[name=Dynamic-device_address]').val(obj._source.device_address)
    $('[name=Dynamic-device_serial]').val(obj._source.device_serial)
    $('[name=Dynamic-device_type]').val(obj._source.device_type)
    $('[name=Dynamic-device_id]').val(obj._id)
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

function deleteDevice(device) {
    obj = JSON.parse(device)
    check = confirm('Are you sure to delete this device ?')
    if (check) {
        $.ajax({
            type: "DELETE",
            url: "/api/v1/devices?id=" + obj._id,
            success: function (data, status) {
                alert("Device " + obj._source.device_name + " deletado com sucesso")
                location.reload();
            }
        })
    }
}