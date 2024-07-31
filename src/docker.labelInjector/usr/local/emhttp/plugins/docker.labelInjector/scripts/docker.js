$(document).ready(function () {
    $("#docker_containers").after('<input type="button" onclick="labelFormPopup()" value="Add Labels" style="">')
})

function labelForm() {
    const tempDiv = $('#temp-label-injector-form')
    const form = document.createElement('form');
    form.id = "label-injector-form"
    form.className = "label-injector-form"
    const formGroup = document.createElement('div');

    const containerHelp = document.createElement('p');
    containerHelp.textContent = 'Click on the containers to add labels to';

    const containerHelp2 = document.createElement('p');
    containerHelp2.textContent = 'Click on "All" to select all containers';

    const containerSelect = document.createElement('select');
    containerSelect.name = 'containers';
    containerSelect.className = 'label-injector-select';
    containerSelect.multiple = true
    containerSelect.id = 'label-injector-containers';

    const containerSelectionText = document.createElement('p');

    const allOption = document.createElement('option');
    allOption.value = 'All';
    allOption.text = 'All';

    allOption.addEventListener('click', function () {
        if (allOption.selected) {
            for (let i = 0; i < containerSelect.options.length; i++) {
                containerSelect.options[i].selected = allOption.selected;
            }
        };
    })

    containerSelect.appendChild(allOption);

    docker.forEach(ct => {
        const option = document.createElement('option');
        option.value = ct.name;
        option.text = ct.name;
        option.addEventListener('click', function () {
            let selectedNames = []
            for (let i = 0; i < containerSelect.options.length; i++) {
                if (containerSelect.options[i].selected) {
                    selectedNames.push(containerSelect.options[i].value);
                }
            }
            containerSelectionText.textContent = `Selected ${selectedNames.join(", ")} containers`;
        })
        containerSelect.appendChild(option);
    })

    formGroup.appendChild(containerHelp);
    formGroup.appendChild(containerHelp2);
    formGroup.appendChild(containerSelect);
    formGroup.appendChild(containerSelectionText);
    formGroup.className = 'label-injector-form-group';
    form.appendChild(formGroup);


    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.className = 'label-injector-input';
    labelInput.placeholder = 'Enter label name';

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'label-injector-input';
    valueInput.placeholder = 'Enter label value';

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.textContent = 'Add';

    const labelHelp = document.createElement('p');
    labelHelp.textContent = 'Click on a label to remove it';

    const labelSelect = document.createElement('select');
    labelSelect.name = 'labels';
    labelSelect.id = 'label-injector-labels';
    labelSelect.className = 'label-injector-select';
    labelSelect.multiple = true
    labelSelect.disabled = true;

    addButton.addEventListener('click', function () {
        if (labelInput.value.trim() !== '' && valueInput.value.trim() !== '') {
            const customOption = document.createElement('option');
            customOption.value = valueInput.value;
            customOption.text = `${labelInput.value}: ${valueInput.value}`;
            customOption.selected = true;
            customOption.className = valueInput.value.includes("REMOVE") ? 'removing-label' : 'adding-label';
            customOption.addEventListener('click', function () {
                labelSelect.removeChild(customOption);
            })
            labelSelect.appendChild(customOption);
            labelInput.value = ''; // Clear the input field
            valueInput.value = ''; // Clear the input field
        }
    });

    const formGroup2 = document.createElement('div');
    formGroup2.className = 'label-injector-form-group';
    formGroup2.appendChild(labelHelp);

    const inputHelp = document.createElement('p');
    inputHelp.textContent = 'If you provide an existing label the value will be replaced, otherwise it is skipped';

    const inputHelp2 = document.createElement('p');
    inputHelp2.textContent = 'If you provide a value of REMOVE, the label will be removed';

    const inputHelp3 = document.createElement('p');
    inputHelp3.textContent = 'spaces will be replaced with a -';

    formGroup2.appendChild(inputHelp);
    formGroup2.appendChild(inputHelp2);
    formGroup2.appendChild(labelSelect);

    const formGroup3 = document.createElement('div');
    formGroup3.className = 'label-injector-form-group-labels';
    formGroup3.appendChild(labelInput);
    formGroup3.appendChild(valueInput);
    formGroup3.appendChild(addButton);

    form.appendChild(formGroup2);
    form.appendChild(formGroup3);

    tempDiv.html(form)
}


function labelFormPopup() {
    swal({
        title: "Label Updater",
        text: '<form id="temp-label-injector-form"></form>',
        html: true,
        showCancelButton: true,
    }, function () {
        addLabels()
    })

    labelForm()
}

function addLabels() {
    const options = $('#label-injector-labels').find('option');
    const labels = [];

    options.each(function () {
        const key = $(this).text().replace(" ", "-");
        const value = $(this).val();
        labels.push({ key: key.split(":-")[0], value: value });
    });

    const containers = $('#label-injector-containers').val().filter(ct => ct != "All")

    if (labels.length > 0 && containers.length > 0) {
        $('div.spinner.fixed').show();
        $.post("/plugins/docker.labelInjector/server/AddLabels.php", { data: JSON.stringify({ labels, containers }) }, function (data) {
            $('div.spinner.fixed').hide();
            data = JSON.parse(data)

            if (data.containers.length > 0) {
                const containersString = data.containers.map(container => encodeURIComponent(container));
                openDocker('update_container ' + containersString.join("*"), _(`Updating ${data.containers.length} Containers`), '', 'loadlist');
            }
        });
    }
}