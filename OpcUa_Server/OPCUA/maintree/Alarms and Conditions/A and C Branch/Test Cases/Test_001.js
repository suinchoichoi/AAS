/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Branch/Level/Test Cases/Test_001.js

    Description: 
        1. Find an condition that is for an AcknowledgeableConditionType (or subtype) that supports branching
        2. Invoke Acknowledge method passing eventId as received (for branch 0)
        3. Evaluate acknowledged condition notification
   
    Test Requirements:
        This requires an event of an AcknowledgeableConditionType that has branches and does not require confirmation

    Expectation:
        1. Acknowledgeable condition notification is received where AckedState=FALSE, BranchId is not 0
        2. Call is successful.  A second acknowledgeable condition notification is received 
        3. AckedState=TRUE.     Branches still exist and are reported without a change of the AckedState.
*/

function Test_001 () {
    notImplemented( "TODO: This conformance unit is not yet implemented. The testing for this conformance unit is covered within the test lab." );
    stopCurrentUnit();
    return true;
}

Test.Execute( { Procedure: Test_001 } );

