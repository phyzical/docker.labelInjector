<?php
$configDir = "/boot/config/plugins/docker.labelInjector";
$sourceDir = "/usr/local/emhttp/plugins/docker.labelInjector";
$documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '/usr/local/emhttp';
require_once ("$documentRoot/plugins/dynamix.docker.manager/include/DockerClient.php");
require_once ("$documentRoot/webGui/include/Helpers.php");


$dockerTemplates = new DockerTemplates();
$dockerUpdate = new DockerUpdate();
$templates = $dockerTemplates->getTemplates('user');


foreach ($templates as $template) {
    $changed = false;

    $template_xml = simplexml_load_file($template["path"]);

    $inputs = ["asd" => "true"];
    var_dump($template["path"]);
    foreach ($inputs as $label => $value) {
        $template_config_xml->xpath("//Config");
        $template_label = $template_xml->xpath("//Config[@Type='Label'][@Target='$input']");

        if ($template_label) {
            if ($value == "REMOVE") {
                // TODO: logic to remove label
            } else if ($template_label->Value != $value) {
                $template_label[0][0] = $value;
                // $changed = true;
            }
        } else {
            $newElement = $config->addChild('Config');
            $newElement->addAttribute('Type', 'Label');
            $newElement->addAttribute('Target', $label);
            $newElement->addAttribute('Value', $value);
            $template_xml->asXML($template["path"]);
            // $changed = true;
        }
        var_dump($template_xml->xpath("//Config[@Type='Label'][@Target='$input']"));
    }

    if ($changed) {
        // Format output and save to file if there were any commited changes
        //$this->debug("Saving template modifications to '$file");
        $dom = new DOMDocument('1.0');
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = true;
        $dom->loadXML($template->asXML());
        file_put_contents($file, $dom->saveXML());
    }
}

?>