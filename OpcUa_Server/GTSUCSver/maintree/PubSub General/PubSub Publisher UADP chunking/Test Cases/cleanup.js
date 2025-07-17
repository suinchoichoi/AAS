if( CU_Variables.serverStartUp ) CU_Variables.PSManager.shutDown();
// Clean up created Connection and PublishedDataSets
if( isDefined( configResult ) && configResult.success ) {
    if( !EraseConfigElementsFromServer( CU_Variables.PSManager, CU_Variables.PublisherConfiguration ) ) {
        addError( "Failed to cleanup generated configuration elements from server. Please cleanup manually." );
    }
}
Test.Disconnect();
if( CU_Variables.serverStarted ) CU_Variables.PSManager.stopServer(0);