// fixtures/index.js — Barrel loader for all agent fixture files
// Each file exports an array of 10 precision tests with inline validators
// Total: 17 agents × 10 tests = 170 tests

const ROLE_FIXTURES = {
  router: require('./router'),
  orchestrator: require('./orchestrator'),
  planner: require('./planner'),
  coder: require('./coder'),
  reviewer: require('./reviewer'),
  summarizer: require('./summarizer'),
  architect: require('./architect'),
  critic: require('./critic'),
  tester: require('./tester'),
  debugger: require('./debugger'),
  researcher: require('./researcher'),
  refactorer: require('./refactorer'),
  translator: require('./translator'),
  data_analyst: require('./data_analyst'),
  preflight: require('./preflight'),
  postcheck: require('./postcheck'),
  postmortem: require('./postmortem')
};

// Skipped roles (non-text APIs)
const SKIPPED_ROLES = {
  vision: 'Requires image input (base64).',
  audio: 'Audio role uses specialized Lyria/TTS APIs.',
  image_gen: 'Image generation uses ComfyUI API.',
  browser_agent: 'Browser agent requires CDP connection. Admin-only.'
};

module.exports = { ROLE_FIXTURES, SKIPPED_ROLES };
