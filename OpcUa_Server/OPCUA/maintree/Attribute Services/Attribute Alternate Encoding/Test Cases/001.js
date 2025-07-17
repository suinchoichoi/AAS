/*  Test prepared by Development; compliance@opcfoundation.org
    Description: Request Value attribute with dataEncoding = “Default Binary”.
    This part of the spec is currently under review. */

function read581014() {
    addSkipped("Please test this conformance unit manually.");
    addSkipped("Needs a complex type");
    return 0;

    for (i = 0; i < scalarItems.length; i++) {
        if (scalarItems[i].NodeId.toString() === readSetting("/Server Test/NodeIds/Static/All Profiles/Scalar/Bool").toString()) {
            continue;
        }
        else {
            item = scalarItems[i].clone();
            break;
        }
    }

    //var item = scalarItems[0].clone();
    item.DataEncoding.Name = "Default Binary";

    // we will allow this to work or fail
    var expectedResults = [ new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadDataEncodingInvalid ] ) ];
    return( ReadHelper.Execute( { 
                NodesToRead: item, 
                TimestampsToReturn: TimestampsToReturn.Server, 
                OperationResults: expectedResults } ) );
}

Test.Execute( { Procedure: read581014 } );