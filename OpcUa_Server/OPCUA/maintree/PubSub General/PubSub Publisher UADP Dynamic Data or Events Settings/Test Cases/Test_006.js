/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check Network Message Number
*/

function Test_006() {
    notImplemented( "Test case needs to be reviewed" );
    return( false );
    var TC_Variables = new Object();
    TC_Variables.Result = true;    
    
    // Actual results
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    
    // Step 1: Check Network Message Number
    if( isDefined( TC_Variables.NetworkMessage.GroupHeader.NetworkMessageNumber ) ) {
        if( !Assert.GreaterThan( 0, TC_Variables.NetworkMessage.GroupHeader.NetworkMessageNumber, "NetworkMessageNumber must be greater than 0." ) ) TC_Variables.Result = false;
    }
    else {
        addError( "NetworkMessageNumber not found in received NetworkMessage." );
        TC_Variables.Result = false;
    }
        
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_006 } );