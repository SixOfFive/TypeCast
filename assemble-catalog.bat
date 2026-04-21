@echo off
REM Build models-catalog.json by assembling all models/*.json files.
REM Run this after test sessions to produce an updated catalog.

node assemble-catalog.js
