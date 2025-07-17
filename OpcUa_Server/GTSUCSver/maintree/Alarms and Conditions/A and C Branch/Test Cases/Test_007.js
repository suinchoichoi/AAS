/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Branch/Level/Test Cases/Test_007.js

    Description:    
        1	Find an condition that is for an AcknowledgeableConditionType (or subtype) that supports branching
        2	Invoke acknowledge method passing eventId of the branch (not 0)
        3	Invoke Confirm method passing eventId of the branch (same as above)
        4	Evaluate acknowledged condition notification

    Test Requirements:
        This test requires confirmation, if confirmation is not available this test shall be skipped

    Expectation:
        1   Acknowledgeable condition notification is received where AckedState=FALSE BranchId is not null
        2   Call is successful.  A second acknowledgeable condition notification is received  (with Retain=true for branch)
        3   Call is successful.  A second acknowledgeable condition notification is received  (with Retain=false for branch)
        4   AckedState=TRUE.  Comment property contains empty text. The branchid is removed
*/

function Test_007 () {
    notImplemented( "TODO: This conformance unit is not yet implemented. The testing for this conformance unit is covered within the test lab." );
    stopCurrentUnit();
    return true;
}

Test.Execute( { Procedure: Test_007 } );

