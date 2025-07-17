/*    Test 5.7.4-Err-4 prepared by Dale Pope dale.pope@matrikon.com
      Description: Given 500 nodes; And the nodes do not exist; When RegisterNodes is called; Then the server returns the NodeIds */

include( "./library/Base/array.js" );

function Test574Err004() {
    var maxLength = 500;
    var realValue = MAX_ALLOWED_SIZE;
    var nodeToRegister = UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/UnknownNodeId2" ).toString() );
    addLog( "Registering " + maxLength + " non-existent nodes" );

    var item = MonitoredItem.fromNodeIds(new UaNodeId(Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerRegisterNodes))[0];
    if( ReadHelper.Execute( {
        NodesToRead: item,
        OperationResults: new ExpectedAndAcceptedResults([StatusCode.Good, StatusCode.BadNodeIdUnknown])
    } ) ) {
        if( ReadHelper.Response.Results[0].StatusCode.isBad() ) {
            print( "MaxNodesPerRegisterNodes is not available within the ServerCapabilities object." );
        }
        else {
            realValue = item.Value.Value.toUInt32();
            print( "Set realValue=" + realValue) ;
        }
    }
    
    if( realValue === 0 ) {
        print( "MaxNodesPerRegisterNodes is set to zero. It should be set to a realistic value. OperationLimit will be limited to this value." );
        realValue = MAX_ALLOWED_SIZE;
    }
    else if( realValue > MAX_ALLOWED_SIZE ) {
        print( "MaxNodesPerRegisterNodes is set to '" + realValue + "', which is above the max allowed size setting of '" + MAX_ALLOWED_SIZE + "'. OperationLimit will be limited to this value." );
        realValue = MAX_ALLOWED_SIZE;
    }

    if( realValue < maxLength ) {
        addSkipped("According to the OperationLimits the Server can't handle 500 nodes in the RegisterNodes Call");
        return false;
    }
    // setup to register the server node multiple times
    var Nodes = MonitoredItem.fromNodeIds(nodeToRegister);
    for( var i=0; i<(maxLength - 1); i++ ) Nodes.push( Nodes[0].clone() );

    // registerNodes, should succeed
    if( !RegisterNodesHelper.Execute( { NodesToRegister: Nodes, ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadTooManyOperations, StatusCode.BadEncodingLimitsExceeded, StatusCode.BadOutOfMemory ] ) } ) ) {
        // In testing we've found that some servers will crash or become none-too-reliable. Terminate channel and recreate.
        Test.Disconnect();
        Test.Connect();
        return ( false );
    }
    if( RegisterNodesHelper.Response.ResponseHeader.ServiceResult.isGood() ) {
        assertRegisterNodesSuccess( Test.Session.Session, RegisterNodesHelper.Request, RegisterNodesHelper.Response, false );
        // cleanup
        UnregisterNodesHelper.Execute( { NodesToUnregister: Nodes } );
        return( true );
    }
    return( false );
}

Test.Execute( { Procedure: Test574Err004 } );