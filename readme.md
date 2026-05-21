# Quick Plotter

Quick Plotter is a lightweight mobile-first plan plotting tool for PDFs, images, and site photos.

It allows users to upload drawings, place device markers, add notes, review counts, and export a marked PDF plus an editable JSON project file.

## Purpose

This tool is meant to provide a fast field-friendly way to mark up drawings without needing a full CAD or Bluebeam workflow.

It is designed for quick plotting, takeoff support, field notes, and simple device count reporting.

## Current Features

- Upload PDFs and images
- Multi-page PDF support
- Mobile-first layout
- Device picker for common low-voltage devices
- Plot devices on drawings
- Auto-numbered device labels
- Edit device names
- Add notes to individual devices
- Add page-level notes
- View device counts by page
- Navigate between pages
- Export marked PDF
- Export editable JSON project file
- Reload saved JSON project files
- One-page summary included in PDF export

## Device Categories

Current device categories include:

- Networking
- CCTV
- Access Control
- AV / Audio
- Infrastructure
- Endpoints

## File Outputs

### PDF Export

Exports the marked drawings with plotted devices and a summary page.

### JSON Export

Exports the editable project file so the user can reload the project later and continue editing.

Users should save the JSON if they want to make future changes.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- PDF.js
- jsPDF

## Notes

This is intentionally lightweight and browser-based.

It is not intended to replace CAD, Bluebeam, or full estimating software. It is meant to support quick field plotting, coordination, and simple reporting.

## Dev Notes

The app is currently mobile-first.

The desktop/internal Misty Rainforest tool and this mobile plotting version should remain separate unless intentionally merged later.

Future improvements may include:

- ZIP export containing PDF + JSON
- Better mobile zoom/pan controls
- Device search/filtering
- Larger device library
- CSV device library import
- Excel summary export
- Improved PDF quality/export handling
- Cloud/project storage
- User login
