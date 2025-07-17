/*
    Test prepared by Archie Miller; archie.miller@opcfoundation.online

    File
        ./maintree/Alarms and Conditions/A and C Branch/Level/Test Cases/Test_004.js

    Description:    
        1	Create two subscriptions (in two sessions). Run event collection.
        2	Individually acknowledge events in one session (Only Branch 0)
        3	Ack event (already acked in first subscription) in second subscription 

    Test Requirements:

    Expectation:
        1   Same event received in both subscription, each having the same EventId.
        2   all events can be acknowledged.  Second subscription also receives Acks.  Event still present with unacked branch
        3   Should return with already Acked
*/

function Test_004 () {
    notImplemented( "TODO: This conformance unit is not yet implemented. The testing for this conformance unit is covered within the test lab." );
    stopCurrentUnit();
    return true;
}

Test.Execute( { Procedure: Test_004 } );

