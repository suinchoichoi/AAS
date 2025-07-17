/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check NetworkMessage Header
    Step 1: Check Header Version
    Step 2: Check Publisher Id Flag
    Step 3: Check Publisher Id Type
    Step 4: Check Group Header Flag
    Step 5: Check Payload Header Flag
    Step 6: Check ExtendedFlags1
    Step 7: Check DataSetClassId Flag
    Step 8: Check Timestamp and Picoseconds Flags
    Step 9: Check ExtendedFlags2
*/

function Test_001() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    
    // Expected results
    TC_Variables.ExpectedResults = new Object();
    TC_Variables.ExpectedResults.HeaderVersion = b( "0001" );
    TC_Variables.ExpectedResults.PublisherId = 1;
    TC_Variables.ExpectedResults.PublisherId_Type = b( "011" );
    TC_Variables.ExpectedResults.GroupHeader = 0;
    TC_Variables.ExpectedResults.PayloadHeader = 1;
    TC_Variables.ExpectedResults.ExtendedFlags1 = 1;
    TC_Variables.ExpectedResults.DataSetClassId = 0;
    TC_Variables.ExpectedResults.Timestamp = 0;
    TC_Variables.ExpectedResults.PicoSeconds = 0;
    TC_Variables.ExpectedResults.ExtendedFlags2 = 0;
    
    
    // Actual results
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    
    
    // Step 1: Check Header Version
    if( Assert.Equal( TC_Variables.ExpectedResults.HeaderVersion, TC_Variables.NetworkMessage.NetworkMessageHeader.UADPVersion_Flags.UADPVersion, "UADPVersion must be set to '0001'. Aborting test." ) ) {
        // Step 2: Check Publisher Id Flag
        if( !Assert.Equal( TC_Variables.ExpectedResults.PublisherId, TC_Variables.NetworkMessage.NetworkMessageHeader.UADPVersion_Flags.PublisherId, "PublisherId must be set to '1' (activated)" ) ) TC_Variables.Result = false;
        // Step 4: Check Group Header Flag
        if( !Assert.Equal( TC_Variables.ExpectedResults.GroupHeader, TC_Variables.NetworkMessage.NetworkMessageHeader.UADPVersion_Flags.GroupHeader, "GroupHeader must be set to '0' (deactivated)" ) ) TC_Variables.Result = false;
        // Step 5: Check Payload Header Flag
        if( !Assert.Equal( TC_Variables.ExpectedResults.PayloadHeader, TC_Variables.NetworkMessage.NetworkMessageHeader.UADPVersion_Flags.PayloadHeader, "PayloadHeader must be set to '1' (activated)" ) ) TC_Variables.Result = false;
        // Step 6: Check ExtendedFlags1
        if( Assert.Equal( TC_Variables.ExpectedResults.ExtendedFlags1, TC_Variables.NetworkMessage.NetworkMessageHeader.UADPVersion_Flags.ExtendedFlags1, "ExtendedFlags1 must be set to '1' (activated). Aborting test." ) ) {
            // Step 3: Check Publisher Id Type
            if( !Assert.Equal( TC_Variables.ExpectedResults.PublisherId_Type, TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.PublisherId_Type, "PublisherId Type must be set to '011' (UInt64)" ) ) TC_Variables.Result = false;
            // Step 7: Check DataSetClassId Flag
            if( !Assert.Equal( TC_Variables.ExpectedResults.DataSetClassId, TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.DataSetClassId, "DataSetClassId must be set to '0' (deactivated)" ) ) TC_Variables.Result = false;
            // Step 8: Check Timestamp and Picoseconds Flags
            if( !Assert.Equal( TC_Variables.ExpectedResults.Timestamp, TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.Timestamp, "Timestamp must be set to '0' (deactivated)" ) ) TC_Variables.Result = false;
            if( !Assert.Equal( TC_Variables.ExpectedResults.PicoSeconds, TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.PicoSeconds, "PicoSeconds must be set to '0' (deactivated)" ) ) TC_Variables.Result = false;
            // Step 9: Check ExtendedFlags2
            if( !Assert.Equal( TC_Variables.ExpectedResults.ExtendedFlags2, TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.ExtendedFlags2, "ExtendedFlags2 must be set to '0' (deactivated)" ) ) TC_Variables.Result = false;
        }
        else TC_Variables.Result = false;
    }
    else TC_Variables.Result = false;
        
        
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_001 } );