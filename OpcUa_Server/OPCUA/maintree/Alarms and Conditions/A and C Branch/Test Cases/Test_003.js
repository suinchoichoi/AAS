/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Branch/Level/Test Cases/Test_003.js

    Description:    
        1	Find an condition that is for an AcknowledgeableConditionType (or subtype) that supports branching
        2	Invoke acknowledge method passing eventId of the branch (not 0)
        3	Evaluate acknowledged condition notification

    Test Requirements:

    Expectation:
        1    Acknowledgeable condition notification is received where AckedState=FALSE BranchId is not null
        2   Call is successful.  A second acknowledgeable condition notification is received  (with Retain=false for branch)
        3   AckedState=TRUE.  Comment property contains empty text. The branchid is removed
*/

function Test_003 () {
    notImplemented( "TODO: This conformance unit is not yet implemented. The testing for this conformance unit is covered within the test lab." );
    stopCurrentUnit();
    return true;
}

Test.Execute( { Procedure: Test_003 } );

