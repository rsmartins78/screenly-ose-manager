var menu = document.getElementById("menubar");

function toggleMenu() {
    var menu = document.getElementById("menubar");

    if (menu.classList.contains('disabled')) {
        menu.classList.remove('disabled');
        $('.target').sidebar('hide');
    } else {
        menu.classList.add('disabled');
        $('.target').sidebar('show');
    }
}

if ($('.target').sidebar('is hidden')) {
    menu.classList.remove('disabled');
}

if ($('.target').sidebar('is visible')) {
    menu.classList.add('disabled');
}

