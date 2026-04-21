@echo off
REM Regenerate CATALOG.md from the current models-catalog.json.
REM Assemble the catalog first if your per-model test data has changed:
REM     assemble-catalog.bat

node generate-catalog-md.js %*
