$(document).ready(function () {
    $("#docker_containers").after('<input type="button" onclick="labelFormPopup()" value="Add Labels" style="">')
})

function labelFormPopup() {
    swal({
        title: "Label Updater",
        text: '<form id="label-injector-form"></form>',
        html: true,
        showCancelButton: true,
    }, function () {
        addLabels()
    })

    labelForm()
}

function addLabels() {
    const labels = $('#label-injector-labels')
        .val()
        .map(value => ({ key: value.split("=")[0], value: value.split("=")[1] }));

    let containers = $('#label-injector-containers').val()

    if (containers.includes('all')) {
        containers = docker.map(ct => ct.name)
    }

    alert(JSON.stringify(labels))

    if (labels.length > 0 && containers.length > 0) {
        $('div.spinner.fixed').show();
        $.post("/plugins/docker.labelInjector/server/service/AddLabels.php", { data: JSON.stringify({ labels, containers }) }, function (data) {
            $('div.spinner.fixed').hide();
            data = JSON.parse(data)

            if (data.containers.length > 0) {
                const containersString = data.containers.map(container => encodeURIComponent(container));
                openDocker('update_container ' + containersString.join("*"), _(`Updating ${data.containers.length} Containers`), '', 'loadlist');
            }
        });
    }
}

function labelForm() {
    $('#label-injector-form').html(`
        <form id="label-injector-form" class="label-injector-form">
            <div class="label-injector-form-group">
                <p>Choose containers to add labels to</p>
                <select id="label-injector-containers" name="containers" class="label-injector-select" multiple id="label-injector-containers" required></select>
            </div>
            <div class="label-injector-form-group">
                <p>If you provide an empty value, the label will be removed i.e 'LABEL='</p>
                <p>spaces will be replaced with a -</p>
                <select id="label-injector-labels" name="labels" id="label-injector-labels" class="label-injector-select" multiple required ></select>
            </div>
            <div class="label-injector-form-group-divider" />
        </form>
        `)
    generateLabelsSelect();
    generateContainersSelect();

    $(".sa-confirm-button-container button").prop("disabled", true)
    const valueChecker = function () {
        if ($("#label-injector-containers").val() && $("#label-injector-labels").val()) {
            $(".sa-confirm-button-container button").prop("disabled", false)
        } else {
            $(".sa-confirm-button-container button").prop("disabled", true)
        }
    }
    $("#label-injector-containers").on('change', valueChecker);
    $("#label-injector-labels").on('change', valueChecker);
}

function generateLabelsSelect() {
    new Choices($("#label-injector-labels")[0], {
        silent: false,
        items: [],
        choices: defaultLabels.map(label => ({
            value: label,
            label: label,
            selected: true,
            disabled: false
        })),
        renderChoiceLimit: -1,
        maxItemCount: -1,
        closeDropdownOnSelect: 'auto',
        singleModeForMultiSelect: false,
        addChoices: true,
        addItems: true,
        addItemFilter: (value) => !!value && value !== '' && value.includes('='),
        removeItems: true,
        removeItemButton: true,
        removeItemButtonAlignLeft: false,
        editItems: true,
        allowHTML: false,
        allowHtmlUserInput: false,
        duplicateItemsAllowed: true,
        delimiter: ',',
        paste: true,
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 4,
        searchFields: ['label', 'value'],
        position: 'auto',
        resetScrollPosition: true,
        shouldSort: true,
        shouldSortItems: false,
        shadowRoot: null,
        placeholder: true,
        placeholderValue: null,
        searchPlaceholderValue: null,
        prependValue: null,
        appendValue: null,
        renderSelectedChoices: 'auto',
        loadingText: 'Loading...',
        noResultsText: 'No results found',
        noChoicesText: 'No choices to choose from',
        itemSelectText: 'Press to select',
        uniqueItemText: 'Only unique values can be added',
        customAddItemText: 'Only values containing "=" can be added, i.e `LABEL_A=VALUE_A',
        addItemText: (value) => {
            return `Press Enter to add <b>"${value}"</b>`;
        },
        removeItemIconText: () => `Remove item`,
        removeItemLabelText: (value) => `Remove item: ${value}`,
        maxItemText: (maxItemCount) => {
            return `Only ${maxItemCount} values can be added`;
        },
        valueComparer: (value1, value2) => {
            return value1 === value2;
        },
        classNames: {
            containerOuter: ['choices'],
            containerInner: ['choices__inner'],
            input: ['choices__input'],
            inputCloned: ['choices__input--cloned'],
            list: ['choices__list'],
            listItems: ['choices__list--multiple'],
            listSingle: ['choices__list--single'],
            listDropdown: ['choices__list--dropdown'],
            item: ['choices__item'],
            itemSelectable: ['choices__item--selectable'],
            itemDisabled: ['choices__item--disabled'],
            itemChoice: ['choices__item--choice'],
            description: ['choices__description'],
            placeholder: ['choices__placeholder'],
            group: ['choices__group'],
            groupHeading: ['choices__heading'],
            button: ['choices__button'],
            activeState: ['is-active'],
            focusState: ['is-focused'],
            openState: ['is-open'],
            disabledState: ['is-disabled'],
            highlightedState: ['is-highlighted'],
            selectedState: ['is-selected'],
            flippedState: ['is-flipped'],
            loadingState: ['is-loading'],
            notice: ['choices__notice'],
            addChoice: ['choices__item--selectable', 'add-choice'],
            noResults: ['has-no-results'],
            noChoices: ['has-no-choices'],
        },
        // Choices uses the great Fuse library for searching. You
        // can find more options here: https://fusejs.io/api/options.html
        fuseOptions: {
            includeScore: true
        },
        labelId: '',
        callbackOnInit: null,
        callbackOnCreateTemplates: null,
        appendGroupInSearch: false,
    });
}

function generateContainersSelect() {
    new Choices($("#label-injector-containers")[0], {
        silent: false,
        items: [],
        choices: docker.map(ct => ({
            value: ct.name,
            label: ct.name,
            selected: false,
            disabled: false
        })).concat({
            value: 'all',
            label: 'All',
            selected: false,
            disabled: false
        }),
        renderChoiceLimit: -1,
        maxItemCount: -1,
        closeDropdownOnSelect: 'auto',
        singleModeForMultiSelect: false,
        addChoices: false,
        addItems: false,
        removeItems: true,
        removeItemButton: true,
        removeItemButtonAlignLeft: false,
        editItems: false,
        allowHTML: false,
        allowHtmlUserInput: false,
        duplicateItemsAllowed: true,
        delimiter: ',',
        paste: true,
        searchEnabled: true,
        searchChoices: true,
        searchFloor: 1,
        searchResultLimit: 4,
        searchFields: ['label', 'value'],
        position: 'auto',
        resetScrollPosition: true,
        shouldSort: true,
        shouldSortItems: false,
        shadowRoot: null,
        placeholder: true,
        placeholderValue: null,
        searchPlaceholderValue: null,
        prependValue: null,
        appendValue: null,
        renderSelectedChoices: 'auto',
        loadingText: 'Loading...',
        placeholderValue: 'Select a container...',
        noResultsText: 'No results found',
        noChoicesText: 'No choices to choose from',
        itemSelectText: 'Press to select',
        uniqueItemText: 'Only unique values can be added',
        addItemText: (value) => {
            return `Press Enter to add <b>"${value}"</b>`;
        },
        removeItemIconText: () => `Remove item`,
        removeItemLabelText: (value) => `Remove item: ${value}`,
        maxItemText: (maxItemCount) => {
            return `Only ${maxItemCount} values can be added`;
        },
        valueComparer: (value1, value2) => {
            return value1 === value2;
        },
        classNames: {
            containerOuter: ['choices'],
            containerInner: ['choices__inner'],
            input: ['choices__input'],
            inputCloned: ['choices__input--cloned'],
            list: ['choices__list'],
            listItems: ['choices__list--multiple'],
            listSingle: ['choices__list--single'],
            listDropdown: ['choices__list--dropdown'],
            item: ['choices__item'],
            itemSelectable: ['choices__item--selectable'],
            itemDisabled: ['choices__item--disabled'],
            itemChoice: ['choices__item--choice'],
            description: ['choices__description'],
            placeholder: ['choices__placeholder'],
            group: ['choices__group'],
            groupHeading: ['choices__heading'],
            button: ['choices__button'],
            activeState: ['is-active'],
            focusState: ['is-focused'],
            openState: ['is-open'],
            disabledState: ['is-disabled'],
            highlightedState: ['is-highlighted'],
            selectedState: ['is-selected'],
            flippedState: ['is-flipped'],
            loadingState: ['is-loading'],
            notice: ['choices__notice'],
            addChoice: ['choices__item--selectable', 'add-choice'],
            noResults: ['has-no-results'],
            noChoices: ['has-no-choices'],
        },
        // Choices uses the great Fuse library for searching. You
        // can find more options here: https://fusejs.io/api/options.html
        fuseOptions: {
            includeScore: true
        },
        labelId: '',
        callbackOnInit: null,
        callbackOnCreateTemplates: null,
        appendGroupInSearch: false,
    });
}