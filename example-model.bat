@echo off
REM ============================================================================
REM Example per-model test batch.
REM
REM Copy this file to <your-model-name>.bat, replace MODEL with the model tag
REM as it appears on your Ollama/llama.cpp server, then run:
REM
REM     your-model-name.bat host:port
REM
REM Example:
REM     qwen3_8b.bat localhost:11434
REM     qwen3_8b.bat 192.168.1.100:11434
REM
REM For llama.cpp servers that use the OpenAI-compatible endpoint, append --openai
REM to each test-role.js call (or use test-server.js with --openai).
REM
REM State is tracked per-model in test-state/<safeName>.json — completed tests
REM auto-skip, so this script is safe to rerun any number of times.
REM ============================================================================

set MODEL=REPLACE_WITH_MODEL_TAG
set HOST=%~1

if "%HOST%"=="" (
  echo ERROR: No host specified.
  echo Usage: %~n0.bat host:port
  exit /b 1
)

echo ============================================
echo  %MODEL% on %HOST%
echo  170 tests starting at %date% %time%
echo ============================================

node test-role.js %HOST% router %MODEL% --all
echo [1/17] router complete

node test-role.js %HOST% orchestrator %MODEL% --all
echo [2/17] orchestrator complete

node test-role.js %HOST% planner %MODEL% --all
echo [3/17] planner complete

node test-role.js %HOST% coder %MODEL% --all
echo [4/17] coder complete

node test-role.js %HOST% reviewer %MODEL% --all
echo [5/17] reviewer complete

node test-role.js %HOST% summarizer %MODEL% --all
echo [6/17] summarizer complete

node test-role.js %HOST% architect %MODEL% --all
echo [7/17] architect complete

node test-role.js %HOST% critic %MODEL% --all
echo [8/17] critic complete

node test-role.js %HOST% tester %MODEL% --all
echo [9/17] tester complete

node test-role.js %HOST% debugger %MODEL% --all
echo [10/17] debugger complete

node test-role.js %HOST% researcher %MODEL% --all
echo [11/17] researcher complete

node test-role.js %HOST% refactorer %MODEL% --all
echo [12/17] refactorer complete

node test-role.js %HOST% translator %MODEL% --all
echo [13/17] translator complete

node test-role.js %HOST% data_analyst %MODEL% --all
echo [14/17] data_analyst complete

node test-role.js %HOST% preflight %MODEL% --all
echo [15/17] preflight complete

node test-role.js %HOST% postcheck %MODEL% --all
echo [16/17] postcheck complete

node test-role.js %HOST% postmortem %MODEL% --all
echo [17/17] postmortem complete

echo ============================================
echo  %MODEL% COMPLETE at %date% %time%
echo ============================================
