/*  Test prepared by Ingenieurbuero Allmendinger: info@allmendinger.de
    Description : Testing the EstablishControl Method for ListToRestrict when Lock is assigned
                  to a ConnectionEndpoint.
    Requirements: - An instance of a subtype from ConnectionEndpointType is available. 
                  - ConnectionEndpoint supports mode PublisherSubscriber or Subscriber.
                  - InputVariables are exposed in the ListToRestrict folder.
          Step 1: Call EstablishControl method and provide the NodeId of any instance of a
                  subtype from ConnectionEndpointType.
          Step 2: Ensure that the InputVariables can still be modified by the connected FunctionalEntity.
          Step 3: Issue a Read Request to any variable in the ListToRestrict.
          Step 4: Issue a Write Request to the same Variable read in Step 3.
          Step 5: Call ReleaseControl to cleanup the lock.
*/

function Test_009() {
    var TC_Variables = new Object();
    TC_Variables.Result = true;
    
    notImplemented( "This test case is not yet implemented" );
    TC_Variables.Result = false;
    
    return ( TC_Variables.Result );
}

Test.Execute( { Procedure: Test_009 } );