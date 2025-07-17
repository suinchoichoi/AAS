/*    Test 5.7.4-Err-5 prepared by Nathan Pocock; compliance@opcfoundation.org
      Description: Specify an invalid node id. Expects success. */

function Test574Err005( ) {
    var request = CreateDefaultRegisterNodesRequest( Test.Session.Session );
    var response = new UaRegisterNodesResponse();
    var NodesToRegister = [];
    NodesToRegister[0] = UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/InvalidSyntaxNodeId1" ).toString() );
    NodesToRegister[1] = UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/InvalidSyntaxNodeId2" ).toString() );
    RegisterNodesHelper.Execute( { NodesToRegister: NodesToRegister, SkipValidation: true } );
    var uaStatus = RegisterNodesHelper.UaStatus;
    request = RegisterNodesHelper.Request;
    response = RegisterNodesHelper.Response;
    addLog( "RegisterNodes() registering 1 invalid node. Result: " + uaStatus, uaStatus );
    // check result (could be Good or Bad_TooManyOperations)
    if( uaStatus.isGood() ) {
        if( Assert.Equal( StatusCode.Good, response.ResponseHeader.ServiceResult.StatusCode, "RegisterNodes() should have succeeded because the invalid node id that was specified within the 'nodesToRegister' correctcollection is actually structurally ." ) ) {
            // the call succeeded, so now we need to Unregister the node!
            var unRequest = new UaUnregisterNodesRequest();
            Test.Session.Session.buildRequestHeader( unRequest.RequestHeader );
            var unResponse = new UaUnregisterNodesResponse();
            var NodesToUnregister = [];
            NodesToUnregister[0] = request.NodesToRegister[0];
            NodesToUnregister[1] = request.NodesToRegister[1];
            UnregisterNodesHelper.Execute( { NodesToUnregister: NodesToUnregister, SkipValidation: true } );
            uaStatus = UnregisterNodesHelper.UaStatus;    
            addLog( "UnregisterNodes() unregistering the 1 invalid node, that should have failed previously!. Result: " + uaStatus, uaStatus );
        }
    }
    else {
        addError( "registerNodes() returned failed: " + uaStatus, uaStatus );
        return( false );
    }
    return( true );
}

Test.Execute( { Procedure: Test574Err005 } );