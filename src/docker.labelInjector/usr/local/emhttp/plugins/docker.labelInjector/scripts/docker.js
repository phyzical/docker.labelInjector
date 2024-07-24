$(document).ready(function () {
    $("#docker_containers").after('<input type="button" onclick="addLabels()" value="Add LAbels" style="">')
})

function addLabels() {
    var labels = prompt("Please enter the labels", "key1=value1,key2=value2");
    if (labels != null) {
        $.post("/plugins/docker.versions/server/AddLabels.php", { labels: labels }, function (data) {
            location.reload();
        });
    }
}