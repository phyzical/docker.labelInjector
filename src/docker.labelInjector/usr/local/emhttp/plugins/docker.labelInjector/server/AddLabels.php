<?php
$configDir = "/boot/config/plugins/docker.labelInjector";
$sourceDir = "/usr/local/emhttp/plugins/docker.labelInjector";
$documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '/usr/local/emhttp';
require_once ("$documentRoot/plugins/dynamix.docker.manager/include/DockerClient.php");
require_once ("$documentRoot/webGui/include/Helpers.php");


$dockerClient = new DockerTemplate();
$templates = $dockerClient->getTemplates('user');

var_dump($templates);

foreach ($templates as $template) {

}

?>