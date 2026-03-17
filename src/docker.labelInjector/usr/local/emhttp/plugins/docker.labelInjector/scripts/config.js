$(document).ready(function () {
    generateDropdown('#labels', {
        addItemFilter,
        customAddItemText,
    });
    $("#label-injector-notes").html(labelInjectorNotes)
});
