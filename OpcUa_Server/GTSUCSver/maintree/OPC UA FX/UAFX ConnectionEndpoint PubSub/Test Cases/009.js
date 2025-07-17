/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify that all OutputVariables of the ConnectionEndpoint are available
                  in the PublishedDataSet associated with the DataSetWriter referenced
                  by the PubSubConnectionEndpoint. 
    Requirements: - Mode PublisherSubscriber or Publisher is supported.
                  - Pre-configured PubSub ConnectionEndpoint exists or PubSubConnectionEndpoint 
                    was created by EstablishConnections Method.
                  - PubSubConnectionEndpoint references OutputVariables.
                  - If PubSub configuration is not exposed, this test needs to be executed
                    manually.
          Step 1: Browse any instance of PubSubConnectionEndpointType.
          Step 2: Read the Attribute Value of the Variable OutputVariables.
          Step 3: Browse the PublishedDataSet associated with the DataSetWriter referenced
                  by the PubSubConnectionEndpoint from Step 1.
          Step 4: Repeat previous Steps for every existing PubSubConnectionEndpoint of the
                  AutomationComponent.
*/

function Test_009() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    // Step 1: Browse any instance of PubSubConnectionEndpointType.
    if( CU_Variables.PubSubConnectionEndpointType_Instances.length > 0 ) {
        // Step 4: Repeat previous Steps for every existing PubSubConnectionEndpoint of the AutomationComponent.
        for( var i=0; i<CU_Variables.PubSubConnectionEndpointType_Instances.length; i++ ) {
            // Step 2: Read the Attribute Value of the Variable OutputVariables.
            var variables = GetConnectionEnpointVariables( CU_Variables.PubSubConnectionEndpointType_Instances[i] );
            if( variables.OutputVariables.length > 0 ) {
                // Mode must be 'Publisher' or 'PublisherSubscriber'
                if( isDefined( CU_Variables.PubSubConnectionEndpointType_Instances[i].Mode ) ) {
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.PubSubConnectionEndpointType_Instances[i].Mode } ) ) {
                        var mode = CU_Variables.PubSubConnectionEndpointType_Instances[i].Mode.Value.Value.toInt32();
                        if( mode == 1 || mode == 2 ) { // PublisherSubscriber(1) || Publisher(2)
                            TC_Variables.nothingTested = false;
                            // Step 3: Browse the PublishedDataSet associated with the DataSetWriter referenced
                            //         by the PubSubConnectionEndpoint from Step 1.
                            addLog( "Testing PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "':" );
                            var ToDataSetWriter_targets = GetChildNodesByReferenceTypeId( CU_Variables.PubSubConnectionEndpointType_Instances[i], CU_Variables.Test.NonHierarchicalReferences.ToDataSetWriter.NodeId );
                            if( ToDataSetWriter_targets.length > 0 ) {
                                for( var v=0; v<variables.OutputVariables.length; v++ ) {
                                    notImplemented( "Check if publishedVariable '" + variables.OutputVariables[v] + "' exists in the PublishedDataSet associated with the DataSetWriter '" + ToDataSetWriter_targets[0].NodeId + "'." );
                                }
                            }
                            else {
                                addError( "No ToDataSetWriter reference exists in PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "'." );
                                TC_Variables.Result = false;
                            }
                        }
                        else addLog( "Mode of PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' is not 'Publisher' or 'PublisherSubscriber'. Skipping node." );
                    }
                }
                else {
                    addError( "PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' does not expose mandatory variable 'Mode'. Skipping node." );
                    TC_Variables.Result = false;
                }
            }
            else addLog( "PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' does not expose OutputVariables. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No PubSubConnectionEndpoint exposing OutputVariables with Mode 'Publisher' or 'PublisherSubscriber' found in server. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntity with a PubSubConnectionEndpoint found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_009 } );