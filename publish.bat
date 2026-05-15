@echo off
REM Publish: assemble catalog, render CATALOG.md, commit & push to GitHub.
REM Run this after a batch of test runs when you want to update the public repo.
REM Skips git commit/push if there are no changes.

setlocal

echo ============================================
echo  TypeCast — Publish
echo  %date% %time%
echo ============================================

echo.
echo [1/5] Assembling models-catalog.json...
call .\assemble-catalog.bat
if errorlevel 1 (
  echo ERROR: assemble-catalog failed
  exit /b 1
)

echo.
echo [2/5] Splitting catalog into per-VRAM-bucket files...
node assemble-catalogs-by-vram.js
if errorlevel 1 (
  echo ERROR: assemble-catalogs-by-vram failed
  exit /b 1
)

echo.
echo [3/5] Rendering CATALOG.md...
call .\generate-catalog-md.bat
if errorlevel 1 (
  echo ERROR: generate-catalog-md failed
  exit /b 1
)

echo.
echo [4/5] Checking for git changes...
git diff --quiet models-catalog.json models-catalog-*gb.json CATALOG.md
if errorlevel 1 (
  echo Changes detected. Committing...
  git add models-catalog.json models-catalog-*gb.json CATALOG.md
  git commit -m "Update benchmark results"
  if errorlevel 1 (
    echo ERROR: git commit failed
    exit /b 1
  )
  echo.
  echo [5/5] Pushing to origin...
  git push
  if errorlevel 1 (
    echo ERROR: git push failed
    exit /b 1
  )
) else (
  echo No changes to commit — catalog and CATALOG.md are already in sync.
)

echo.
echo ============================================
echo  Publish complete at %date% %time%
echo ============================================

endlocal
