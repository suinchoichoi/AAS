/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Verify for Unidirectional Connections with Heartbeat that either no InputVariables
                  or no OutputVariables exist.
    Requirements: - Mode PublisherSubscriber is supported.
                  - Pre-configured PubSubConnectionEndpoint exists or PubSubConnectionEndpoint
                    was created by EstablishConnections Method.
          Step 1: Browse any instance of PubSubConnectionEndpointType.
          Step 2: Read Attribute Value of variable InputVariables.
          Step 3: Read Attribute Value of variable OutputVariables.
          Step 4: Repeat previous Steps for every existing PubSubConnectionEndpoint of the
                  AutomationComponent.
*/

function Test_011() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    TC_Variables.nothingTested = true;
    
    // Step 1: Browse any instance of PubSubConnectionEndpointType
    if( CU_Variables.PubSubConnectionEndpointType_Instances.length > 0 ) {
        // Step 4: Repeat previous Steps for every existing PubSubConnectionEndpoint of the AutomationComponent.
        for( var i=0; i<CU_Variables.PubSubConnectionEndpointType_Instances.length; i++ ) {
            // check if ConnectionEndpoint is unidirectional
            var variables = GetConnectionEnpointVariables( CU_Variables.PubSubConnectionEndpointType_Instances[i] );
            if( ( variables.InputVariables.length == 0 && variables.OutputVariables.length > 0 ) || ( variables.InputVariables.length > 0 && variables.OutputVariables.length == 0 ) ) {
                addLog( "Testing unidirectional PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "':" );
                if( isDefined( CU_Variables.PubSubConnectionEndpointType_Instances[i].Mode ) ) {
                    if( ReadHelper.Execute( { NodesToRead: CU_Variables.PubSubConnectionEndpointType_Instances[i].Mode } ) ) {
                        var mode = CU_Variables.PubSubConnectionEndpointType_Instances[i].Mode.Value.Value.toInt32();
                        if( mode == 1 ) { // PublisherSubscriber(1)
                            TC_Variables.nothingTested = false;
                            // Step 2: Read Attribute Value of variable InputVariables.
                            // Step 3: Read Attribute Value of variable OutputVariables.
                            var variables = GetConnectionEnpointVariables( CU_Variables.PubSubConnectionEndpointType_Instances[i] );
                            if( variables.InputVariables.length > 0 ) {
                                if( !Assert.Equal( 0, variables.OutputVariables.length, "Unexpected length of OutputVariables. As InputVariables are referenced, OutputVariables shall not be referenced." ) ) TC_Variables.Result = false;
                            }
                            else {
                                if( !Assert.GreaterThan( 0, variables.OutputVariables.length, "Unexpected length of OutputVariables. As InputVariables are not referenced, at least one OutputVariable shall be referenced." ) ) TC_Variables.Result = false;
                            }
                        }
                        else addLog( "Mode of PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' is not 'PublisherSubscriber'. Skipping node." );
                    }
                }
                else {
                    addError( "PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' does not expose mandatory variable 'Mode'. Skipping node." );
                    TC_Variables.Result = false;
                }
            }
            else addLog( "PubSubConnectionEndpoint '" + CU_Variables.PubSubConnectionEndpointType_Instances[i].NodeId + "' is not unidirectional. Skipping node." );
        }
        if( TC_Variables.nothingTested ) {
            addSkipped( "No unidirectional PubSubConnectionEndpoint with Mode 'PublisherSubscriber' found in server. Skipping test." );
            TC_Variables.Result = false;
        }
    }
    else {
        addSkipped( "No FunctionalEntity with a PubSubConnectionEndpoint found in server. Skipping test." );
        TC_Variables.Result = false;
    }
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_011 } );