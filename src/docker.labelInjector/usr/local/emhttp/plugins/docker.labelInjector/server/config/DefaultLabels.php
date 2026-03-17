<?php

namespace DockerInjector\Config;

class DefaultLabels
{
    public const CONFIG_PATH = "/boot/config/docker.labelInjector";
    public const LABELS_PATH = self::CONFIG_PATH . "/labels.json";
    public const QUOTE_REPLACER = "\`";

    /**
     * Save the default labels to a file.
     * @return string|null
     */
    static function formSubmit(): string|null
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $labels = array_map(function ($item) {
                return str_replace(self::QUOTE_REPLACER, '"', $item);
            }, $_POST["labels"] ?? []);
            $labelsJson = json_encode(['labels' => $labels]);
            mkdir(DefaultLabels::CONFIG_PATH, 0755, true);
            file_put_contents(DefaultLabels::LABELS_PATH, $labelsJson);
            return "Labels saved successfully!";
        }
        return null;
    }


    /**
     * Get the default labels from the config file.
     * @return string[]
     */
    static function getDefaultLabels(): array
    {
        $json = "";
        if (file_exists(self::LABELS_PATH)) {
            $json = file_get_contents(self::LABELS_PATH);
        }
        if (!$json || empty($json)) {
            return [];
        }

        return array_map(function ($item) {
            return str_replace('"', self::QUOTE_REPLACER, $item);
        }, json_decode($json)->labels);
    }

    /**
     * Generate the form for the default labels.
     */
    static function generateForm(): void
    {
        $message = self::formSubmit();
        echo <<<HTML
                <div id="label-injector-notes"></div>
                <div>
                    <form id="default-label-form" method="post" action="">
                        <label for="labels">Labels</label>
                        <select multiple type="text" id="labels" name="labels[]" >
            HTML;

        $labels = self::getDefaultLabels();

        foreach ($labels as $label) {
            echo "<option selected value='$label'>$label</option>";
        }

        echo <<<HTML
                        </select>
                        <button type="submit">Save Labels</button>
                    </form>
            HTML;
        // Display the message if set
        if (isset($message)) {
            echo "<p>$message</p>";
        }
        echo "</div><hr>";
    }
}

?>