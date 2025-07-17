/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check DataSet Message Header
    Step 1: DataSetMessageSequenceNumber Flag
    Step 2: Status Flag
    Step 3: MajorVersion Flag
    Step 4: MinorVersion Flag
    Step 5: DataSetFlags2
    Step 6: Timestamp and PicoSecond Flags
*/

function Test_002() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    
    // Expected results
    TC_Variables.ExpectedResults = new Object();
    TC_Variables.ExpectedResults.DataSetMessageSequenceNumber = 1;
    TC_Variables.ExpectedResults.Status = 1;
    TC_Variables.ExpectedResults.MajorVersion = 0;
    TC_Variables.ExpectedResults.MinorVersion = 1;
    TC_Variables.ExpectedResults.DataSetFlags2 = 1;
    TC_Variables.ExpectedResults.Timestamp = 1;
    TC_Variables.ExpectedResults.PicoSeconds = 0;
    
    
    // Actual results
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    if( isDefined( TC_Variables.NetworkMessage.Payload.DataSetMessages ) &&
        TC_Variables.NetworkMessage.Payload.DataSetMessages.length > 0 ) {
            TC_Variables.DataSetMessage = TC_Variables.NetworkMessage.Payload.DataSetMessages[0];
    }
    else {
        addError( "Received NetworkMessage contains no DataSetMessage data. Aborting test." );
        return( false );
    }
    
    
    // Step 1: DataSetMessageSequenceNumber Flag
    if( !Assert.Equal( TC_Variables.ExpectedResults.DataSetMessageSequenceNumber, TC_Variables.DataSetMessage.DataSetFlags1.DataSetMessageSequenceNumber, "DataSetMessageSequenceNumber must be set to '1' (activated)." ) ) TC_Variables.Result = false;
    // Step 2: Status Flag
    if( !Assert.Equal( TC_Variables.ExpectedResults.Status, TC_Variables.DataSetMessage.DataSetFlags1.Status, "Status must be set to '1' (activated)." ) ) TC_Variables.Result = false;
    // Step 3: MajorVersion Flag
    if( !Assert.Equal( TC_Variables.ExpectedResults.MajorVersion, TC_Variables.DataSetMessage.DataSetFlags1.ConfigurationVersionMajorVersion, "ConfigurationVersionMajorVersion must be set to '0' (disabled)." ) ) TC_Variables.Result = false;
    // Step 4: MinorVersion Flag
    if( !Assert.Equal( TC_Variables.ExpectedResults.MinorVersion, TC_Variables.DataSetMessage.DataSetFlags1.ConfigurationVersionMinorVersion, "ConfigurationVersionMinorVersion must be set to '1' (activated)." ) ) TC_Variables.Result = false;
    // Step 5: DataSetFlags2
    if( Assert.Equal( TC_Variables.ExpectedResults.DataSetFlags2, TC_Variables.DataSetMessage.DataSetFlags1.DataSetFlags2, "DataSetFlags2 must be set to '1' (activated). Aborting test." ) ) {
        // Step 6: Timestamp and PicoSecond Flags
        if( !Assert.Equal( TC_Variables.ExpectedResults.Timestamp, TC_Variables.DataSetMessage.DataSetFlags2.Timestamp, "Timestamp must be set to '1' (activated)." ) ) TC_Variables.Result = false;
        if( !Assert.Equal( TC_Variables.ExpectedResults.PicoSeconds, TC_Variables.DataSetMessage.DataSetFlags2.PicoSeconds, "PicoSeconds must be set to '0' (disabled)." ) ) TC_Variables.Result = false;
    }
    else TC_Variables.Result = false;
        
        
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_002 } );