/*  Test 4; prepared by Nathan Pocock; compliance@opcfoundation.org

    Description:
        Attempt a secure  session and send an empty clientCertificate.

    Expectation: 
        ServiceResult = Bad_SecurityChecksFailed

    Revision History
        03-Oct-2011 NP: Initial version

     
         Test Lab Specifications Part 8 - UA Server.
*/

function certificateValidation004()
{
    addSkipped( "Current stack doesn't allow us to send an empty ClientCertificate, therefore we need to skip this test for now." );
    return( true );
    if( epSecureEncrypt === undefined || epSecureEncrypt === null ) {
        addSkipped( "A secure channel is not available. This is only allowed for Nano and Micro Embedded Device Server Profiles." );
        return ( false );
    }
    var result = true;
    Test.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
            MessageSecurityMode: epSecureEncrypt.SecurityMode,
            EmptyClientCertificate: true,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSecurityChecksFailed )
        },
        SkipCreateSession: true
    } )
    if( Test.Channel.UaStatus.StatusCode != StatusCode.BadSecurityChecksFailed ) {
        result = false;
    }
    Test.Disconnect( { SkipCloseSession: true } );
    return ( result );
}

Test.Execute( { Procedure: certificateValidation004 } );