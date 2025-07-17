/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Branch/Level/Test Cases/Test_006.js

    Description:    
        1	create event subscription and find condition in subscription with a non-0 branchId
        2	Invoke acknowledge method passing eventId as received and NULL comment (for non-0 branch)
        3	repeat for multiple events

    Test Requirements:

    Expectation:
        1   Acknowledgeable condition notification is received where AckedState=FALSE
        2   Orginal event is still unacked (branch 0)
        3   Orginal event is still unacked (branch 0)
*/

function Test_006 () {
    notImplemented( "TODO: This conformance unit is not yet implemented. The testing for this conformance unit is covered within the test lab." );
    stopCurrentUnit();
    return true;
}

Test.Execute( { Procedure: Test_006 } );

