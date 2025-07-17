/*  Test 5; prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Attempt a secure Channel and send an untrusted certificate.
    Expectation: ServiceResult = BadSecurityChecksFailed */

function certificateValidation005() {
    if (epSecureEncrypt === undefined || epSecureEncrypt === null ) {
        addSkipped( "A secure channel is not available. This is only allowed for Nano and Micro Embedded Device Server Profiles." );
        return( false );
    }
    var result = true;
    Test.Connect({
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
            MessageSecurityMode: epSecureEncrypt.SecurityMode,
            ClientCertificate: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appU,
            ClientCertificatePrivateKey: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appUPrivateKey,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSecurityChecksFailed ) },
        SkipCreateSession: true
    })
    if( Test.Channel.UaStatus.StatusCode != StatusCode.BadSecurityChecksFailed ) {
        result = false;
    }
    Test.Disconnect( { SkipCloseSession: true } );
    return( result );
}

Test.Execute( { Procedure: certificateValidation005 } );