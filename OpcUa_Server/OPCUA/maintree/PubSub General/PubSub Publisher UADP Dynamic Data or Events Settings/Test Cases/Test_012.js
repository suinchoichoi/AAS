/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check Timestamp
*/

function Test_012() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.DataSetMessages = [];
    
    
    // Extract DataSetMessages from received NetworkMessages
    for( var t=0; t<CU_Variables.TestNetworkMessages.length; t++ ) {
        if( isDefined( CU_Variables.TestNetworkMessages[t].Payload.DataSetMessages ) ) {
            for( var d=0; d<CU_Variables.TestNetworkMessages[t].Payload.DataSetMessages.length; d++ ) {
                TC_Variables.DataSetMessages.push( CU_Variables.TestNetworkMessages[t].Payload.DataSetMessages[d] );
            }
        }
    }
    
   
    var lastTimestamp = null;
    
    if( TC_Variables.DataSetMessages.length > 1 ) {
        for( var i=0; i<TC_Variables.DataSetMessages.length; i++ ) {
            if( isDefined( TC_Variables.DataSetMessages[i].Timestamp ) ) {
                if( !isDefined( lastTimestamp ) ) lastTimestamp = TC_Variables.DataSetMessages[i].Timestamp;
                else {
                    if( TC_Variables.DataSetMessages[i].Timestamp <= lastTimestamp ) {
                        addError( "Timestamp is not strictly increasing monotonically\n<Last Timestamp: " + lastTimestamp + ", subsequent Timestamp: " + TC_Variables.DataSetMessages[i].Timestamp + ">" );
                        TC_Variables.Result = false;
                        break;
                    }
                    lastTimestamp = TC_Variables.DataSetMessages[i].Timestamp;
                }
            }
            else {
                addError( "Timestamp not set on received DataSetMessage. Aborting test." );
                TC_Variables.Result = false;
                break;
            }
        }
    }
    else {
        addSkipped( "Not enough DataSetMessages received within " + maxTimeToWaitForMessage + " ms for this test to run. Skipping test." );
        TC_Variables.Result = false;
    }


    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_012 } );