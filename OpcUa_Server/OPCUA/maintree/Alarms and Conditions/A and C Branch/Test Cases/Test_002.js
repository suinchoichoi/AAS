/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Branch/Level/Test Cases/Test_002.js

    Description:    
        1	Find an condition that is for an AcknowledgeableConditionType  (or subtype) that supports branching
        2	Call AddComment() and pass a unique comment.
        3	Invoke Acknowledge() method passing eventId as received and NULL comment (both locale and text)
        4	Evaluate acknowledged condition notification

    Test Requirements:
        If AddComment() is not supported then this whole test must be skipped.

    Expectation:
        1   Acknowledgeable condition notification is received where AckedState=FALSE, BranchId is not 0
        2   Success.
        3   Call is successful.  A second acknowledgeable condition notification is received 
        4   AckedState=TRUE.  Comment property contains text of comment argument previously passed (i.e., existing comment is unchanged).  Branch still exists.
*/

function Test_002 () {
    notImplemented( "TODO: This conformance unit is not yet implemented. The testing for this conformance unit is covered within the test lab." );
    stopCurrentUnit();
    return true;
}

Test.Execute( { Procedure: Test_002 } );

