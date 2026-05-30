param(
    [string]$Token = "77e464022a5995ff3e23fd91c5d2d07e",
    [string]$Base = "http://localhost:8080/webservice/rest/server.php",
    [int]$CourseId = 2
)

function Call-Moodle($wsfunction, $extraParams) {
    $params = "wstoken=$Token&wsfunction=$wsfunction&moodlewsrestformat=json&courseid=$CourseId"
    foreach ($k in $extraParams.Keys) {
        $params += "&$k=$([System.Uri]::EscapeDataString($extraParams[$k]))"
    }
    return Invoke-RestMethod $Base -Method Post -ContentType "application/x-www-form-urlencoded" -Body $params
}

$pass = 0; $fail = 0

function Check($label, $obj, $field) {
    if ($null -ne $obj.$field) {
        Write-Host "[PASS] $label ($field=$($obj.$field))"
        $script:pass++
    } elseif ($obj.errorcode) {
        Write-Host "[FAIL] $label => errorcode=$($obj.errorcode): $($obj.message)"
        $script:fail++
    } else {
        Write-Host "[FAIL] $label => kein '$field' in Antwort: $($obj | ConvertTo-Json -Compress)"
        $script:fail++
    }
}

Write-Host "--- Smoke Test Suite ---"

# T1: get_courses
$r1 = Invoke-RestMethod $Base -Method Post -Body "wstoken=$Token&wsfunction=local_aicoursecreator_get_courses&moodlewsrestformat=json&search=&limit=5"
if ($r1 -and $r1[0].id) { Write-Host "[PASS] T1 get_courses (id=$($r1[0].id))"; $pass++ } else { Write-Host "[FAIL] T1 get_courses => $($r1 | ConvertTo-Json -Compress)"; $fail++ }

# T2: get_sections
$r2 = Call-Moodle "local_aicoursecreator_get_sections" @{}
if ($r2 -and $r2[0].id) { Write-Host "[PASS] T2 get_sections (sections=$($r2.Count))"; $pass++ } else { Write-Host "[FAIL] T2 get_sections => $($r2 | ConvertTo-Json -Compress)"; $fail++ }

# T3: get_question_types
$r3 = Call-Moodle "local_aicoursecreator_get_question_types" @{}
if ($r3 -and $r3[0].name) { Write-Host "[PASS] T3 get_question_types (types=$($r3.Count))"; $pass++ } else { Write-Host "[FAIL] T3 get_question_types => $($r3 | ConvertTo-Json -Compress)"; $fail++ }

# T4: create_question_category
$r4 = Call-Moodle "local_aicoursecreator_create_question_category" @{ name="SmokeTest-Cat2"; info="Smoke Test" }
Check "T4 create_question_category" $r4 "categoryid"

# T5: create_quiz (sectionnum=0-based, keine timelimit/attempts in create_quiz)
$r5 = Call-Moodle "local_aicoursecreator_create_quiz" @{ sectionnum="1"; name="SmokeTestQuiz"; intro="TestIntro"; grade="10"; questionsperpage="1"; shuffleanswers="1"; visible="1" }
Check "T5 create_quiz" $r5 "cmid"

if ($r5.cmid) {
    $cmid = $r5.cmid

    # T6: update_quiz (kein courseid-Parameter → direkter Call)
    $r6 = Invoke-RestMethod $Base -Method Post -Body "wstoken=$Token&wsfunction=local_aicoursecreator_update_quiz&moodlewsrestformat=json&cmid=$cmid&name=SmokeTestQuiz-Updated&timelimit=-1&attempts=-1&grademethod=-1&visible=-1"
    Check "T6 update_quiz" $r6 "cmid"
}

Write-Host ""
Write-Host "=== Ergebnis: $pass PASS / $fail FAIL ==="
