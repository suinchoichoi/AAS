/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check UADP Message Type
*/

function Test_005() {
    notImplemented( "Test case not yet implemented" );
    return ( true );
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    
    // Expected results
    TC_Variables.ExpectedResults = new Object();
    //TC_Variables.ExpectedResults.xyz = b( "0001" );
    
    
    // Actual results
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    
    
    // Step  1: step 1
    //if( !Assert.Equal( TC_Variables.ExpectedResults.xyz, TC_Variables.NetworkMessage.NetworkMessageHeader.xyz, "XYZ must be set to '0001'." ) ) TC_Variables.Result = false;
        
        
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_005 } );