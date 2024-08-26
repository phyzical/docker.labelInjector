<?php

namespace DockerInjector\Config;

class DefaultLabels
{
    public const CONFIG_PATH = "/boot/config/docker.labelInjector/";
    public const LABELS_PATH = self::CONFIG_PATH . "/labels.json";

    /**
     * Save the default labels to a file.
     * @return string|null
     */
    static function formSubmit(): string|null
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $labels = $_POST["labels"] ?? [];
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
        $json = file_get_contents(self::LABELS_PATH);
        if (!$json || empty($json)) {
            return [];
        }
        return json_decode($json)->labels;
    }

    /**
     * Generate the form for the default labels.
     */
    static function generateForm(): void
    {
        $message = self::formSubmit();
        echo <<<HTML
                <h2>Default Labels</h2>
                <p>Labels to be prefilled when using the add labels button</p>
                <p>Type and press enter to save a label, separate label from value via '='</p>
                <p>Empty values are valid to allow for easy filling</p>
                <div>
                    <form method="post" action="">
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