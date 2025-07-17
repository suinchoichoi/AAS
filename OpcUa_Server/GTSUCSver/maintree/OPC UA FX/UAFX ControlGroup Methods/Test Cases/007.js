/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Testing the EstablishControl Method for ListToBlock when Lock is assigned
                  to a PubSubConnectionEndpoint.
    Requirements: - An instance of PubSubConnectionEndpointType is available.
                  - PubSubConnectionEndpoint supports mode PublisherSubscriber or Subscriber.
                  - InputVariables are exposed in the ListToRestrict folder.
          Step 1: Call EstablishControl method and provide the NodeId of any instance of a
                  PubSubConnectionEndpointType.
          Step 2: Ensure that the InputVariables cannot be modified by the connected FunctionalEntity
                  anymore.
          Step 3: Issue a Read Request to any variable in the ListToBlock.
          Step 4: Issue a Write Request to the same Variable read in Step 3.
          Step 5: Issue a Read Request to the variable from previous steps.
          Step 6: Call ReleaseControl to cleanup the lock.
*/

function Test_007() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is not yet implemented" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_007 } );