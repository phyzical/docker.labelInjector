<?php
$configDir = "/boot/config/plugins/docker.labelInjector";
$sourceDir = "/usr/local/emhttp/plugins/docker.labelInjector";
$documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '/usr/local/emhttp';
require_once ("$documentRoot/plugins/dynamix.docker.manager/include/DockerClient.php");
require_once ("$documentRoot/webGui/include/Helpers.php");

$dockerUpdate = new DockerUpdate();

$data = json_decode($_POST["data"]);

$containerNames = $data->containers;
$inputs = $data->labels;

function getUserTemplateInsensitive($Container)
{
    $dockerTemplates = new DockerTemplates();

    foreach ($dockerTemplates->getTemplates('user') as $file) {
        $doc = new DOMDocument('1.0', 'utf-8');
        $doc->load($file['path']);
        $Name = strtolower($doc->getElementsByTagName('Name')->item(0)->nodeValue) ?? '';
        if ($Name == $Container)
            return $file['path'];
    }
    return false;
}

$updatedContainerNames = [];

foreach ($containerNames as $containerName) {
    $templatePath = getUserTemplateInsensitive($containerName);
    $changed = false;

    $template_xml = simplexml_load_file($templatePath);

    if ($template_xml) {
        // echo "Actioning {$templatePath}\n";
        $old_template_xml = $template_xml->asXML();

        foreach ($inputs as $input) {
            $label = $input->key;
            $value = $input->value;

            $template_label = $template_xml->xpath("//Config[@Type='Label'][@Target='$label']");
            if ($template_label) {
                if ($value == "REMOVE") {
                    // echo "Removing $label\n";
                    $dom = dom_import_simplexml($template_label[0]);
                    $dom->parentNode->removeChild($dom);
                    $changed = true;
                } else if ($template_label[0][0] != $value) {
                    // echo "Updating $label to $value\n";
                    $template_label[0][0] = $value;
                    $changed = true;
                }
            } else if ($value != "REMOVE") {
                // echo "Adding $label with $value\n";
                $newElement = $template_xml->addChild('Config');
                $newElement->addAttribute('Name', $label);
                $newElement->addAttribute('Target', $label);
                $newElement->addAttribute('Default', "");
                $newElement->addAttribute('Mode', "");
                $newElement->addAttribute('Description', "");
                $newElement->addAttribute('Type', 'Label');
                $newElement->addAttribute('Display', 'always');
                $newElement->addAttribute('Required', 'false');
                $newElement->addAttribute('Mask', 'false');

                $newElement[0] = $value;
                $changed = true;
            }
        }

        if ($changed) {
            // Backup Juust incase
            file_put_contents($templatePath . "." . (new DateTime())->format('Y.m.d.H.I.s') . ".bak", $old_template_xml);
            file_put_contents($templatePath, $template_xml->asXML());
            $updatedContainerNames[] = $containerName;
        }
    }
}


echo json_encode(["containers" => array_slice($updatedContainerNames, 0, 1)]);
?>