/*  Test prepared by Ing.-Buero Allmendinger; info@allmendinger.de
    Description: Pass in a large number of nodes (100+?) or more than the server supports (if documented).
    ExpectedResult: Service result = Bad_TooManyOperations, Bad_EncodingLimitsExceeded or Bad_OutOfMemory*/

function registerNodesErr002() {
    var MAX_ALLOWED_SIZE = 10000;
    var item = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerCapabilities_OperationLimits_MaxNodesPerRegisterNodes ) )[0];
    if ( ReadHelper.Execute( {
        NodesToRead: item,
        OperationResults: new ExpectedAndAcceptedResults( [StatusCode.Good, StatusCode.BadNodeIdUnknown] )
    } ) ) {
        if ( ReadHelper.Response.Results[0].StatusCode.isBad() ) {
            addSkipped( "The optional OperationLimit MaxNodesPerRegisterNodes is not available within the ServerCapabilities object. Skipping this test case." );
            return ( false );
        }
    }
    else return ( false );


    var realValue = item.Value.Value.toUInt32();
    if ( realValue === 0 ) {
        //    addWarning( "MaxNodesPerRegisterNodes is set to zero. According to Erata 1.03.4: 'Any operational limits Property that is provided shall have a non-zero value'. OperationLimit will be limited to " + MAX_ALLOWED_SIZE + " for this test case." );
        realValue = MAX_ALLOWED_SIZE - 1;
    }
    else if ( realValue > MAX_ALLOWED_SIZE ) {
        //   addWarning( "MaxNodesPerRegisterNodes is set to '" + realValue + "', which is above the max allowed size setting of '" + MAX_ALLOWED_SIZE + "'. OperationLimit will be limited to this value." );
        realValue = MAX_ALLOWED_SIZE;
    }

    // setup to register the server node multiple times
    var serverNodes = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server ) );
    for ( var i = 0; i < realValue; i++ ) serverNodes.push( serverNodes[0].clone() );

    // now to exceed the limit by one, should fail
    if ( realValue < MAX_ALLOWED_SIZE ) {
        if ( RegisterNodesHelper.Execute( { NodesToRegister: serverNodes, ServiceResult: new ExpectedAndAcceptedResults( [StatusCode.BadTooManyOperations, StatusCode.BadEncodingLimitsExceeded], StatusCode.Good ), ProhibitSplitting: true } ) ) {
            if ( RegisterNodesHelper.Response.ResponseHeader.ServiceResult.isGood() ) {
                if ( item.Value.Value.toUInt32() == 0 ) {
                    addSkipped( "The OperationLimit MaxNodesPerRegisterNodes is set to zero. OperationLimit was limited to " + MAX_ALLOWED_SIZE + " for this test case.\nRegisterNodes succeeded and this test case cannot be validated." );
                }
                addSkipped( "RegisterNodes succeeded passing a higher number than claimed to be supported by the server." );
            }
            else {
                // In testing we've found that some servers will crash or become none-too-reliable. Terminate channel and recreate.
                Test.Disconnect();
                Test.Connect();
            }
        }
        else {
            Test.Disconnect();
            Test.Connect();
        }
    }
    else {
        addSkipped( "Can't exceed the number of elements as the server supports more than we want to test." );
    }
    return ( true );
}

Test.Execute( { Procedure: registerNodesErr002 } );