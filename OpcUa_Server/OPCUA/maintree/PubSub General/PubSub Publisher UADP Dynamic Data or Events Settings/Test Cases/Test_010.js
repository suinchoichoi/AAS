/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description: Check static Fields
*/

function Test_010() {
    const requiredNumberOfNetworkMessages = 5;
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    if( CU_Variables.TestNetworkMessages.length < requiredNumberOfNetworkMessages ) {
        addSkipped( "Not enough NetworkMessages received for this test. Need " + requiredNumberOfNetworkMessages + " or more. Skipping test." );
        return( false );
    }
    
    // Expected results (determined by first received message)
    TC_Variables.ExpRes = new Object();
    TC_Variables.ExpRes.UADPVersion_Flags    = CU_Variables.TestNetworkMessages[0].NetworkMessageHeader.UADPVersion_Flags.Value;
    TC_Variables.ExpRes.ExtendedFlags1       = CU_Variables.TestNetworkMessages[0].NetworkMessageHeader.ExtendedFlags1.Value;
    TC_Variables.ExpRes.PublisherId          = CU_Variables.TestNetworkMessages[0].NetworkMessageHeader.PublisherId;
    TC_Variables.ExpRes.Count                = CU_Variables.TestNetworkMessages[0].PayloadHeader.Count;
    TC_Variables.ExpRes.DataSetWriterIds     = CU_Variables.TestNetworkMessages[0].PayloadHeader.DataSetWriterIds;
    
    // Check if one or more header fields are not set
    for( field in TC_Variables.ExpRes ) {
        if( !isDefined( TC_Variables.ExpRes[field] ) ) { 
            addError( field + " field is not set. Aborting test." ); 
            return( false );
        }
    }
    
    // Check static fields are equal in every other received NetworkMessage
    for( var i=0; i<CU_Variables.TestNetworkMessages.length; i++ ) {
        if( !Assert.Equal( TC_Variables.ExpRes.UADPVersion_Flags    , CU_Variables.TestNetworkMessages[i].NetworkMessageHeader.UADPVersion_Flags.Value, "NetworkMessageHeader.UADPVersionFlags field is not static" ) ) TC_Variables.Result = false;
        if( !Assert.Equal( TC_Variables.ExpRes.ExtendedFlags1       , CU_Variables.TestNetworkMessages[i].NetworkMessageHeader.ExtendedFlags1.Value, "NetworkMessageHeader.ExtendedFlags1 field is not static" ) ) TC_Variables.Result = false;
        if( !Assert.Equal( TC_Variables.ExpRes.PublisherId          , CU_Variables.TestNetworkMessages[i].NetworkMessageHeader.PublisherId, "NetworkMessageHeader.PublisherId field is not static" ) ) TC_Variables.Result = false;
        if( !Assert.Equal( TC_Variables.ExpRes.Count                , CU_Variables.TestNetworkMessages[i].PayloadHeader.Count, "PayloadHeader.Count field is not static" ) ) TC_Variables.Result = false;
        if( !Assert.Equal( TC_Variables.ExpRes.DataSetWriterIds     , CU_Variables.TestNetworkMessages[i].PayloadHeader.DataSetWriterIds, "GroupHeader.DataSetWriterIds field is not static" ) ) TC_Variables.Result = false;
        if( !TC_Variables.Result ) {
            addError( "Checked static fields are not static over time." );
            break;
        }
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_010 } );