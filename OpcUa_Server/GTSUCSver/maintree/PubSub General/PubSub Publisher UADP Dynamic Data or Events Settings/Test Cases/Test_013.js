/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check data content fields
    Step 1: Check DataSetWriterIds
    Step 2: Check PublisherId
    Step 3: Check DataSetMessageFields
    Step 4: Check SecurityTokenId
*/

function Test_013() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    addLog( "Received NetworkMessage used in this Test: '" + CU_Variables.TestNetworkMessages[0].getRawNetworkMessageData() + "'" );
    TC_Variables.NetworkMessage = CU_Variables.TestNetworkMessages[0];
            
    // Expected results
    TC_Variables.ExpectedResults = new Object();
    TC_Variables.ExpectedResults.DataSetWriterIds = [ 11, 22, 33 ];//*TODO* Replace with PubSubConfiguration.DataSetWriterIds when available
    TC_Variables.ExpectedResults.PublisherId = 100;//*TODO* Replace with PubSubConfiguration.PublisherId when available
    TC_Variables.ExpectedResults.DataSetMessageFields = 1234;//*TODO* Replace with PubSubConfiguration.DataSetMessageFields when available
    TC_Variables.ExpectedResults.SecurityTokenId = 1234;//*TODO* Replace with PubSubConfiguration.SecurityTokenId when available
    
    
    // Step 1: Check DataSetWriterIds
    if( !Assert.Equal( TC_Variables.ExpectedResults.DataSetWriterIds.length, TC_Variables.NetworkMessage.PayloadHeader.Count, "Received Number of DataSetWriterIds does not match the Number of DataSets in the PubSub configuration." ) ) TC_Variables.Result = false;
    else {
        for( var i=0; i<TC_Variables.ExpectedResults.DataSetWriterIds.length; i++ ) {
            if( !Assert.Equal( TC_Variables.ExpectedResults.DataSetWriterIds[i], TC_Variables.NetworkMessage.PayloadHeader.DataSetWriterIds[i], "Received DataSetWriterId[" + i + "] does not match the value in the PubSub configuration." ) ) TC_Variables.Result = false;
        }
    }
    // Step 2: Check PublisherId
    if( !Assert.Equal( TC_Variables.ExpectedResults.PublisherId, TC_Variables.NetworkMessage.NetworkMessageHeader.PublisherId, "Received PublisherId does not match the value in the PubSub configuration." ) ) TC_Variables.Result = false;
    // Step 3: Check DataSetMessageFields
    //*TODO* Discuss Step 3
    //if( !Assert.Equal( TC_Variables.ExpectedResults.SecurityTokenId, TC_Variables.NetworkMessage.SecurityHeader.SecurityTokenId, "Received SecurityTokenId does not match the value in the PubSub configuration." ) ) TC_Variables.Result = false;
    // Step 4: Check SecurityTokenId
    if( TC_Variables.NetworkMessage.NetworkMessageHeader.UADPVersion_Flags.ExtendedFlags1 == 1 &&
        TC_Variables.NetworkMessage.NetworkMessageHeader.ExtendedFlags1.Security == 1 ) {
        
        if( !Assert.Equal( TC_Variables.ExpectedResults.SecurityTokenId, TC_Variables.NetworkMessage.SecurityHeader.SecurityTokenId, "Received SecurityTokenId does not match the value in the PubSub configuration." ) ) TC_Variables.Result = false;
        
    }
    else addLog( "Security disabled in received NetworkMessage. Skipping Step 4." );
        
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_013 } );