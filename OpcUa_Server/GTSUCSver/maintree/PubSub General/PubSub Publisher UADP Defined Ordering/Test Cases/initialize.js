include( "./library/Base/safeInvoke.js" );
include( "./library/PubSub/UADPMessageDissector.js" );
include( "./library/PubSub/PubSubUtilities.js" );

const maxTimeToWaitForMessage = 10000;
const maxNumberOfMessages = 10;

var CU_Variables = new Object();
CU_Variables.serverStarted = false;
CU_Variables.serverStartUp = false;
CU_Variables.TestNetworkMessages = [];
    
CU_Variables.PSManager = new PubSubManager();

if( !CU_Variables.PSManager.startServer() ) {
    addError( "Could not start PubSub-Server. Aborting conformance unit." );
    stopCurrentUnit();
}
else { 
    CU_Variables.serverStarted = true;
    if( !Test.Connect() ) {
        addError( "Could not connect to UA Server. Aborting conformance unit." );
        stopCurrentUnit();
    }
    else {
        
        CU_Variables.PSManager.startUp();
        CU_Variables.serverStartUp = true;
        
        var configResult = ConfigurePubSubTest( CU_Variables.PSManager, "PeriodicFixed" );
        
        if( configResult.success ) {
            
            CU_Variables.SubscriberConfiguration = configResult.SubscriberConfiguration;
            CU_Variables.PublisherConfiguration  = configResult.PublisherConfiguration;
            
            // Restart server for CTT config changes to take effect
            CU_Variables.PSManager.shutDown( 0 );
            Test.Disconnect();
            CU_Variables.PSManager.stopServer( 0 );
            CU_Variables.PSManager = new PubSubManager();
            CU_Variables.PSManager.startServer();
            Test.Connect();
            CU_Variables.PSManager.startUp();
            
            CU_Variables.TestNetworkMessages = CollectNetworkMessageData( {
                PubSubManager:           CU_Variables.PSManager,
                SubscriberConfiguration: CU_Variables.SubscriberConfiguration,
                Timeout:                 maxTimeToWaitForMessage,
                MaxNumberOfMessages:     maxNumberOfMessages,
                SuppressMessages:        true
            } );
            
            if( CU_Variables.TestNetworkMessages.length == 0 ) {
                addError( "Did not receive any NetworkMessages within " + maxTimeToWaitForMessage + " ms to test with.\nPlease make sure the server is sending messages.\nAborting Conformance Unit." );
                stopCurrentUnit();
            }
        }
        else {
            addError( "Error generating the CTT test configuration. Aborting conformance unit." );
            stopCurrentUnit();
        }
    }
}