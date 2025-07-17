/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check Security Header
    Step 1: NetworkMessage Signed Flag
    Step 2: SecurityFooter Flag
    Step 3: Force Key Reset Flag
    Step 4: NetworkMessage Encryption Flag
    Step 5: Nonce Length
*/

function Test_003() {
    // *TODO* Test script
    addWarning( "***Script untested***" );
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    
    // Expected results
    TC_Variables.ExpectedResults = new Object();
    TC_Variables.ExpectedResults.NetworkMessage_Signed_Flag = 1;
    TC_Variables.ExpectedResults.SecurityFooter_Flag = 0;
    TC_Variables.ExpectedResults.Force_Key_Reset_Flag = 0;
    TC_Variables.ExpectedResults.NonceLength = 4;
    
    
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    
    if( TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.Security == 1 ) {
    
        // Step 1: NetworkMessage Signed Flag
        if( !Assert.Equal( TC_Variables.ExpectedResults.NetworkMessage_Signed_Flag, TC_Variables.NetworkMessage.SecurityHeader.SecurityFlags.NetworkMessage_Signed_Flag, "NetworkMessage Signed Flag must be set to '1' (activated)" ) ) TC_Variables.Result = false;
        // Step 2: SecurityFooter Flag
        if( !Assert.Equal( TC_Variables.ExpectedResults.SecurityFooter_Flag, TC_Variables.NetworkMessage.SecurityHeader.SecurityFlags.SecurityFooter_Flag, "SecurityFooter Flag must be set to '0' (disabled)" ) ) TC_Variables.Result = false;   
        // Step 3: Force Key Reset Flag
        if( !Assert.Equal( TC_Variables.ExpectedResults.Force_Key_Reset_Flag, TC_Variables.NetworkMessage.SecurityHeader.SecurityFlags.Force_key_reset_Flag, "Force Key Reset Flag must be set to '0'" ) ) TC_Variables.Result = false;
        // Step 4: NetworkMessage Encryption Flag
        if( TC_Variables.NetworkMessage.SecurityHeader.SecurityFlags.NetworkMessage_Encrypted_Flag == 1 ) {
            // Step 5: Nonce Length
            if( !Assert.Equal( TC_Variables.ExpectedResults.NonceLength, TC_Variables.NetworkMessage.SecurityHeader.NonceLength, "Nonce Length must be set to 4 Byte ('00000100')" ) ) TC_Variables.Result = false;
        }
        
    }
    else {
        addSkipped( "Security is disabled on received NetworkMessage. Skipping test." );
        TC_Variables.Result = false;
    }
        
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_003 } );