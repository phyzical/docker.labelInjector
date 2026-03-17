$(document).ready(function () {
    generateDropdown('#labels', {
        addItemFilter,
        customAddItemText: defaultOptions.customAddItemText,
    });
    $("#label-injector-notes").html(labelInjectorNotes)
});
