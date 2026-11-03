# Raymond Report Studio

A standalone, database-free field / industrial training report builder.

## Deployment
Upload the `report-studio/` directory to the website document root. The entry point is:

`/report-studio/index.php`

If this repository is deployed to `ndoa.kesug.com`, the page will be available at:

`https://ndoa.kesug.com/report-studio/`

## Requirements
- PHP 8.1+ (the page itself is client-side; no database or PHP extensions are required)
- Internet connection for Bootstrap, jQuery, html2pdf.js and docx browser libraries from CDNs
- Modern browser with localStorage support

## Features
- Responsive Bootstrap 5 interface and jQuery interactions
- Graduation-themed hero image
- Guided five-step student and industrial training report form
- UDOM-inspired academic structure (not an official UDOM template)
- Upload practical photographs and add captions
- Local browser draft saving
- PDF download, editable DOCX download and print
- A4 report preview with print-specific page styling

## Important
The report is a structured draft based on information entered by the student. Students must verify all details, add real organisation information and references, and follow the latest requirements issued by their college or department. No AI or web research API is included.
