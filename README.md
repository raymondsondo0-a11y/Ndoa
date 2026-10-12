# FieldReport Studio — AI Industrial Training Report Generator

The Ndoa repository has been repurposed into a responsive English-language Field / Industrial Training Report Studio.

## Features
- Upload up to 8 logbook/supporting files (PDF, DOCX, TXT and images; 8 MB per file).
- AI analysis identifies the training topic and extracts evidence from documents and logbook photos.
- Web research through Tavily provides supporting technical references.
- Wikimedia Commons search finds illustrative images and provides source/licence information where available.
- Report preview and Word (.docx) export; Print / Save as PDF is available in the browser.
- Responsive layout for mobile, tablet and desktop.

## Required server configuration
The report API intentionally refuses generation until these **server environment variables** are configured:
- `OPENAI_API_KEY`
- `TAVILY_API_KEY`
- Optional `OPENAI_MODEL` (defaults to `gpt-4.1-mini`)

Never place API keys in JavaScript, HTML, public repository files or URLs. Configure them in the hosting environment/server control panel. If the hosting provider cannot set environment variables, use a private server-side configuration file outside the public web root and adjust the PHP endpoint to load it; do not commit secrets to GitHub.

PHP requirements: PHP 8.1+, cURL and Fileinfo; ZipArchive is recommended for DOCX text extraction. PDF and image inputs are processed through the AI API. Confirm the hosting plan permits outbound HTTPS requests and supports the required PHP extensions.

## Deployment
GitHub Actions deploys to `/ndoa.kesug.com/htdocs/`. A push to `main` triggers deployment if `FTP_USERNAME` and `FTP_PASSWORD` GitHub Actions secrets are configured.

## Accuracy, privacy and academic integrity
- Uploaded documents are sent to the configured AI provider for processing and are not intentionally saved by this PHP endpoint.
- The generated report is a draft. Verify activities, dates, company information, citations and recommendations before submitting it.
- Online research provides supporting context; it is not proof that the student personally performed an activity.
- Images are illustrative. Check each source page and licence and replace images that do not accurately represent the workplace/process.
- Word export includes text and image source links but does not embed remote images. Insert approved figures into Word if required.
- Report generation requires working API keys and compatible hosting. The interface can load without API keys, but generation will display a configuration message until they are set.
