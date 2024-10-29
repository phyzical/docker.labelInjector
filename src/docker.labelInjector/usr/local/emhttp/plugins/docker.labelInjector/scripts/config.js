$(document).ready(function () {
    generateDropdown('#labels', {
        addItemFilter: (value) => {
            return !!value && value !== '' && value.includes('=')
        },
        customAddItemText: 'Only values containing "=" can be added, i.e `LABEL_A=VALUE_A',
    });
});
