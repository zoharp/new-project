-- Verify new scripts are in database
SELECT step_number, step_title, 
       SUBSTRING(script_text, 1, 80) as preview,
       LENGTH(script_text) as length
FROM call_scripts 
ORDER BY step_number;
