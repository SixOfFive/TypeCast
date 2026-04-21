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
echo [1/4] Assembling models-catalog.json...
call .\assemble-catalog.bat
if errorlevel 1 (
  echo ERROR: assemble-catalog failed
  exit /b 1
)

echo.
echo [2/4] Rendering CATALOG.md...
call .\generate-catalog-md.bat
if errorlevel 1 (
  echo ERROR: generate-catalog-md failed
  exit /b 1
)

echo.
echo [3/4] Checking for git changes...
git diff --quiet models-catalog.json CATALOG.md
if errorlevel 1 (
  echo Changes detected. Committing...
  git add models-catalog.json CATALOG.md
  git commit -m "Update benchmark results"
  if errorlevel 1 (
    echo ERROR: git commit failed
    exit /b 1
  )
  echo.
  echo [4/4] Pushing to origin...
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
