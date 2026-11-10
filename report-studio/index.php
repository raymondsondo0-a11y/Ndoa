<?php
declare(strict_types=1);

// The previous default page was the Field/Industrial Training Report builder.
// Send visitors to the new Content Notes Generator instead.
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Location: content-notes.php', true, 302);
exit;
