/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Branch/Level/Test Cases/Test_005.js

    Description:    
        1	Create two subscriptions (in two sessions). Run event collection.
        2	Individually acknowledge events in one session (Not Branch 0)
        3	Ack event (already acked in first subscription) in second subscription 
        4	Repeat for multiple events

    Test Requirements:
        if acknowledged branch is not available skip step 3

    Expectation:
        1   Same event received in both subscription, each having the same EventId.
        2   all events can be acknowledged.  Second subscription also receives Acks.  Branches are removed (Retain=false)
        3   Should return with already Acked
*/

function Test_005 () {
    notImplemented( "TODO: This conformance unit is not yet implemented. The testing for this conformance unit is covered within the test lab." );
    stopCurrentUnit();
    return true;
}

Test.Execute( { Procedure: Test_005 } );

