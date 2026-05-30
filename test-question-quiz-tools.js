const { spawnSync } = require('child_process');

const calls = [];

function call(name, args) {
  const req = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name, arguments: args },
  };
  const p = spawnSync('node', ['MoodleMcp/moodle-mcp.js'], {
    input: JSON.stringify(req) + '\n',
    encoding: 'utf8',
    env: process.env,
  });
  const line = (p.stdout || '').split(/\r?\n/).find(l => l.trim().startsWith('{'));
  if (!line) {
    throw new Error(`${name} no JSON response stdout=${p.stdout} stderr=${p.stderr}`);
  }
  const res = JSON.parse(line);
  const text = res.result?.content?.[0]?.text || JSON.stringify(res);
  if (res.result?.isError) {
    throw new Error(`${name} failed: ${text}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }
  calls.push({ name, ok: true, result: parsed });
  return parsed;
}

const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const courseid = 2;
const sectionnum = 5;

const types = call('moodle_get_question_types', { courseid });
const catsBefore = call('moodle_get_question_categories', { courseid });
const cat = call('moodle_create_question_category', {
  courseid,
  name: `MCP Quiz Tool Test ${stamp}`,
  info: '<p>Automatischer Test der MCP-Fragenwerkzeuge.</p>',
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <question type="multichoice">
    <name><text>MCP Testfrage ${stamp}</text></name>
    <questiontext format="html"><text><![CDATA[<p>Welche Antwort ist korrekt?</p>]]></text></questiontext>
    <defaultgrade>1.0000000</defaultgrade>
    <penalty>0.3333333</penalty>
    <hidden>0</hidden>
    <single>true</single>
    <shuffleanswers>true</shuffleanswers>
    <answernumbering>abc</answernumbering>
    <answer fraction="100" format="html">
      <text><![CDATA[<p>Richtig</p>]]></text>
      <feedback format="html"><text><![CDATA[<p>Korrekt.</p>]]></text></feedback>
    </answer>
    <answer fraction="0" format="html">
      <text><![CDATA[<p>Falsch</p>]]></text>
      <feedback format="html"><text><![CDATA[<p>Nicht korrekt.</p>]]></text></feedback>
    </answer>
  </question>
</quiz>`;

const imported = call('moodle_import_questions_xml', {
  courseid,
  categoryid: cat.categoryid,
  xml,
  filename: `mcp-test-${stamp}.xml`,
});
if (!imported.questionids || imported.questionids.length < 1) {
  throw new Error(`Import returned no questionids: ${JSON.stringify(imported)}`);
}

const quiz = call('moodle_create_quiz', {
  courseid,
  sectionnum,
  name: `MCP Quiz Test ${stamp}`,
  intro: '<p>Temporäres Testquiz.</p>',
  grade: 1,
  questionsperpage: 1,
  shuffleanswers: 1,
  visible: 0,
});

const added = call('moodle_add_quiz_questions', {
  cmid: quiz.cmid,
  questionids: imported.questionids,
  maxmark: 1,
});

const updated = call('moodle_update_quiz', {
  cmid: quiz.cmid,
  name: `MCP Quiz Test aktualisiert ${stamp}`,
  intro: '<p>Aktualisiert per update_quiz.</p>',
  timelimit: 60,
  attempts: 2,
  grademethod: 1,
  visible: 0,
  shuffleanswers: 0,
  questionsperpage: 1,
});

const mods = call('moodle_get_modules', { courseid, sectionnum });
const quizModule = mods.find(m => m.cmid === quiz.cmid);
const deleted = call('moodle_delete_module', { cmid: quiz.cmid });

console.log(JSON.stringify({
  stamp,
  summary: {
    questionTypes: types.length,
    categoriesBefore: catsBefore.length,
    categoryId: cat.categoryid,
    importedQuestionIds: imported.questionids,
    quizCmid: quiz.cmid,
    quizId: quiz.quizid,
    added: added.added,
    updated: updated.message,
    moduleBeforeDelete: quizModule,
    deleted: deleted.message,
  },
  calls,
}, null, 2));
