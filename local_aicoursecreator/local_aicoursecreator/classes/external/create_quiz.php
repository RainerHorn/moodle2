<?php
// This file is part of Moodle - http://moodle.org/

namespace local_aicoursecreator\external;

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir . '/externallib.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->dirroot . '/course/modlib.php');
require_once($CFG->dirroot . '/mod/quiz/lib.php');

use external_api;
use external_function_parameters;
use external_value;
use external_single_structure;
use context_course;

class create_quiz extends external_api {

    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'courseid'           => new external_value(PARAM_INT, 'Course ID'),
            'sectionnum'         => new external_value(PARAM_INT, 'Section number (0-based)'),
            'name'               => new external_value(PARAM_TEXT, 'Quiz name'),
            'intro'              => new external_value(PARAM_RAW, 'Quiz intro HTML', VALUE_DEFAULT, ''),
            'grade'              => new external_value(PARAM_FLOAT, 'Maximum grade', VALUE_DEFAULT, 10.0),
            'questionsperpage'   => new external_value(PARAM_INT, 'Questions per page', VALUE_DEFAULT, 1),
            'shuffleanswers'     => new external_value(PARAM_INT, 'Shuffle answers (1/0)', VALUE_DEFAULT, 1),
            'preferredbehaviour' => new external_value(PARAM_TEXT, 'Question behaviour', VALUE_DEFAULT, 'deferredfeedback'),
            'visible'            => new external_value(PARAM_INT, 'Visible (1) or hidden (0)', VALUE_DEFAULT, 1),
        ]);
    }

    public static function execute(
        int $courseid,
        int $sectionnum,
        string $name,
        string $intro = '',
        float $grade = 10.0,
        int $questionsperpage = 1,
        int $shuffleanswers = 1,
        string $preferredbehaviour = 'deferredfeedback',
        int $visible = 1
    ): array {
        global $DB;

        $params = self::validate_parameters(self::execute_parameters(), [
            'courseid'           => $courseid,
            'sectionnum'         => $sectionnum,
            'name'               => $name,
            'intro'              => $intro,
            'grade'              => $grade,
            'questionsperpage'   => $questionsperpage,
            'shuffleanswers'     => $shuffleanswers,
            'preferredbehaviour' => $preferredbehaviour,
            'visible'            => $visible,
        ]);

        $context = context_course::instance($params['courseid']);
        self::validate_context($context);
        require_capability('moodle/course:manageactivities', $context);

        $course = $DB->get_record('course', ['id' => $params['courseid']], '*', MUST_EXIST);

        $moduleinfo = new \stdClass();
        $moduleinfo->modulename = 'quiz';
        $moduleinfo->module = $DB->get_field('modules', 'id', ['name' => 'quiz'], MUST_EXIST);
        $moduleinfo->course = $params['courseid'];
        $moduleinfo->section = $params['sectionnum'];
        $moduleinfo->name = $params['name'];
        $moduleinfo->visible = $params['visible'];
        $moduleinfo->intro = $params['intro'];
        $moduleinfo->introformat = FORMAT_HTML;
        $moduleinfo->timeopen = 0;
        $moduleinfo->timeclose = 0;
        $moduleinfo->timelimit = 0;
        $moduleinfo->overduehandling = 'autosubmit';
        $moduleinfo->graceperiod = 0;
        $moduleinfo->grade = $params['grade'];
        $moduleinfo->sumgrades = 0;
        $moduleinfo->gradepass = 0;
        $moduleinfo->attempts = 0;
        $moduleinfo->grademethod = QUIZ_GRADEHIGHEST;
        $moduleinfo->questionsperpage = $params['questionsperpage'];
        $moduleinfo->navmethod = QUIZ_NAVMETHOD_FREE;
        $moduleinfo->shuffleanswers = $params['shuffleanswers'] ? 1 : 0;
        $moduleinfo->preferredbehaviour = $params['preferredbehaviour'];
        $moduleinfo->canredoquestions = 0;
        $moduleinfo->attemptonlast = 0;
        $moduleinfo->decimalpoints = 2;
        $moduleinfo->questiondecimalpoints = -1;
        $moduleinfo->reviewattempt = 0x11110;
        $moduleinfo->reviewcorrectness = 0x10000;
        $moduleinfo->reviewmarks = 0x11110;
        $moduleinfo->reviewspecificfeedback = 0x10000;
        $moduleinfo->reviewgeneralfeedback = 0x10000;
        $moduleinfo->reviewrightanswer = 0x10000;
        $moduleinfo->reviewoverallfeedback = 0x10000;
        $moduleinfo->browsersecurity = '-';
        $moduleinfo->delay1 = 0;
        $moduleinfo->delay2 = 0;
        $moduleinfo->showuserpicture = 0;
        $moduleinfo->showblocks = 0;
        $moduleinfo->completionattemptsexhausted = 0;
        $moduleinfo->completionpass = 0;
        $moduleinfo->allowofflineattempts = 0;

        $moduleinfo = add_moduleinfo($moduleinfo, $course);

        return [
            'cmid'    => (int) $moduleinfo->coursemodule,
            'quizid'  => (int) $moduleinfo->instance,
            'message' => 'Quiz "' . $params['name'] . '" successfully created.',
        ];
    }

    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'cmid'    => new external_value(PARAM_INT, 'Course module ID of the created quiz'),
            'quizid'  => new external_value(PARAM_INT, 'Quiz instance ID'),
            'message' => new external_value(PARAM_TEXT, 'Success message'),
        ]);
    }
}
