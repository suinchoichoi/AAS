/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check length
    Step 1: Check correct Header length
    Step 2: Check correct Frame length
*/

function Test_009() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
    
    // Expected results
    TC_Variables.ExpectedResults = new Object();
    TC_Variables.ExpectedResults.NetworkMessageHeaderLength = 10;
    TC_Variables.ExpectedResults.PayloadHeaderLength = 1 + ( TC_Variables.NetworkMessage.Payload.DataSetMessages.length * 2 );
    TC_Variables.ExpectedResults.DataSetMessageHeaderLength = 5;
    
    
    // Step 1: Check correct Header length
    if( !Assert.Equal( TC_Variables.ExpectedResults.NetworkMessageHeaderLength, TC_Variables.NetworkMessage.NetworkMessageHeaderSize, "NetworkMessageHeader length must be 10 Byte." ) ) TC_Variables.Result = false;
    if( !Assert.Equal( TC_Variables.ExpectedResults.PayloadHeaderLength, TC_Variables.NetworkMessage.PayloadHeaderSize, "PayloadHeader length must be (1 + MessageCount x 2) Byte." ) ) TC_Variables.Result = false;
    
    if( isDefined( TC_Variables.NetworkMessage.Payload.DataSetMessages ) && TC_Variables.NetworkMessage.Payload.DataSetMessages.length > 0 ) {
        if( !Assert.Equal( TC_Variables.ExpectedResults.DataSetMessageHeaderLength, TC_Variables.NetworkMessage.Payload.DataSetMessages[0].DataSetMessageHeaderSize, "DataSetMessageHeader length must be 5 Byte." ) ) TC_Variables.Result = false;
        
        // Step 2: Check correct Frame length
        // *TODO* What is considered the "Calculated length"? (If Payload.Sizes is meant, what to do if Count is 1 (shall be omitted in this case)
    }
    else {
        addError( "Received NetworkMessage contains no DataSetMessage data. Aborting test." );
        return( false );
    }
    
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_009 } );