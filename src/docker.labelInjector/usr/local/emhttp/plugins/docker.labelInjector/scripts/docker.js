$(document).ready(function () {
    $("#docker_containers").after('<input type="button" onclick="labelFormPopup()" value="Add Labels" style="">')
})

function labelFormPopup() {
    swal({
        title: "Label Updater",
        text: '<form id="label-injector-form"></form>',
        html: true,
        showCancelButton: true,
        closeOnConfirm: false,
        closeOnCancel: false
    }, function (isConfirm) {
        $('div.spinner.fixed').show();
        // Remove the 'label-injector' class regardless of the button clicked
        $(".sweet-alert").removeClass("label-injector");
        swal.close(); // Close the SweetAlert dialog
        if (isConfirm) {
            setTimeout(() => {
                $('div.spinner.fixed').hide();
                addLabels();
            }, 500);
        } else {
            $('div.spinner.fixed').hide();
        }
    });
    $(".sweet-alert").addClass("label-injector")

    labelForm()
}

function addLabels() {
    const labels = $('#label-injector-labels')
        .val()
        .map(value => ({ key: value.split("=")[0], value: value.split("=")[1] }));

    const containers = $('#label-injector-containers').val().filter(x => x !== 'All');

    if (labels.length > 0 && containers.length > 0) {
        $('div.spinner.fixed').show();
        $.post("/plugins/docker.labelInjector/server/service/AddLabels.php", { data: JSON.stringify({ labels, containers }) }, function (data) {
            $('div.spinner.fixed').hide();
            data = JSON.parse(data)
            const hasUpdates = data.containers.length > 0
            let updates = ['<pre class="docker-label-updates">'];
            if (hasUpdates) {
                updates.push("<h3>Note: The templates have been updated, this is just an FYI modal at the moment</h3>")
                updates.push("<h3>Note: if you leave this page the label will not be applied until you edit and save the container/s in question</h3>")
                updates.push("<h3>Note: Performing this action will also update the container at this time</h3>")
                updates.push("<h3>Once you press okay the changes will be applied one by one </h3>")
                Object.entries(data.updates).forEach(([container, changes]) => {
                    updates.push(`<h3>${container} changes:</h3>${changes.join("")}`);
                });
            } else {
                updates.push("<h3>No Containers returned any changes in labels, nothing to be applied</h3>")
            }

            updates.push("</pre>")

            swal({
                title: "Summary of Updates",
                text: updates.join(""),
                html: true,
                closeOnConfirm: false,
            }, function () {
                $(".sweet-alert").removeClass("label-injector-summary");
                swal.close(); // Close the SweetAlert dialog
                if (hasUpdates) {
                    $('div.spinner.fixed').show();
                    const containersString = data.containers.map(container => encodeURIComponent(container));
                    setTimeout(() => {
                        $('div.spinner.fixed').hide();
                        openDocker('update_container ' + containersString.join("*"), _(`Updating ${data.containers.length} Containers`), '', 'loadlist');
                    }, 500);
                }
            });
            $(".sweet-alert").addClass("label-injector-summary")
        });
    }
}

function labelForm() {
    $('#label-injector-form').html(`
        <form id="label-injector-form" class="label-injector-form">
            <div class="label-injector-form-group">
                <p>Choose containers to add labels to</p>
                <select id="label-injector-containers" name="containers" class="label-injector-select" multiple id="label-injector-containers" required></select>
                <button id="remove-all-label-injector-containers">Remove All</button>
            </div>
            <div class="label-injector-form-group">
                <h3> Note:</h3>
                <ul class="list">
                    <li>Type and press enter to save a label, separate label from value via '='</li>
                    <li>When empty values are provided the label will be removed or ignored if not found</li>
                    <li>Existing tags will be replaced</li>
                    <li>Spaces will be replaced with a -</li>
                    <li>To use quotes in an options use and escaped backtick \\\` Otherwise the option fails to save</li>
                </ul>
                <h3>The following special values are available replacement of values or keys:</h3>
                <ul class="list">
                    <li>\${CONTAINER_NAME} - i.e 'LABEL_A=\${CONTAINER_NAME}.domain.com' -> 'LABEL_A=container_a.domain.com'</li>
                </ul>
                <select id="label-injector-labels" name="labels" class="label-injector-select" multiple required ></select>
                <button id="remove-all-label-injector-labels">Remove All</button>
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
    generateDropdown("#label-injector-labels", {
        choices: defaultLabels.map(label => ({
            value: label,
            label: label,
            selected: true,
            disabled: false
        })),
        addItemFilter: (value) => !!value && value !== '' && value.includes('='),
        customAddItemText: 'Only values containing "=" can be added, i.e `LABEL_A=VALUE_A',
    }, "#remove-all-label-injector-labels")
}

function generateContainersSelect() {
    generateDropdown("#label-injector-containers", {
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
    }, "#remove-all-label-injector-containers")
}