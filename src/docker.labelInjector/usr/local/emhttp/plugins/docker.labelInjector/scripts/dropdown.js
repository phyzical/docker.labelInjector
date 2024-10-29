const defaultOptions = {
    silent: false,
    items: [],
    choices: [],
    renderChoiceLimit: -1,
    maxItemCount: -1,
    closeDropdownOnSelect: 'auto',
    singleModeForMultiSelect: false,
    addChoices: true,
    addItems: true,
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
}

function generateDropdown(selector, options, removeAllSelector = undefined) {
    const choicesSelect = new Choices($(selector)[0], { ...defaultOptions, ...options });

    if (removeAllSelector === undefined) {
        return choicesSelect;
    }
    $(removeAllSelector).on('click', () => {
        const allItems = choicesSelect.getValue(true);
        allItems.forEach(item => {
            choicesSelect.removeActiveItemsByValue(item);
        });
    });


    let selectedAll = false;
    $(selector).on('change', function () {
        if ($(this).val().includes('all')) {
            if (!selectedAll) {
                selectedAll = true
                const allChoices = choices._store.choices;
                allChoices.forEach(choice => {
                    if (!choice.selected && !choice.disabled) {
                        choices.setChoiceByValue(choice.value);
                    }
                });
            }
        } else {
            if (selectedAll) {
                selectedAll = false
                const allChoices = choices._store.choices;
                allChoices.forEach(choice => {
                    if (choice.selected && !choice.disabled) {
                        choices.removeActiveItemsByValue(choice.value);
                    }
                });
            }
        }
    })
}