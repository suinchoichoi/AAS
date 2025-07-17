/*  Test 10; prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Attempt a secure channel and send a [untrusted] certificate which has an invalid signature, e.g. signed with wrong certificate.
    Expectation: ServiceResult = BadSecurityChecksFailed */

function certificateValidation010() {
    if (epSecureEncrypt === undefined || epSecureEncrypt === null) {
        addSkipped("A secure channel is not available. This is only allowed for Nano and Micro Embedded Device Server Profiles.");
        return( false ); 
    }
    var result = true;
    Test.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
            MessageSecurityMode: epSecureEncrypt.SecurityMode,
            ClientCertificate: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSincorrect,
            ClientCertificatePrivateKey: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSincorrectPrivateKey,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSecurityChecksFailed ) },
        SkipCreateSession: true
    })
    if( Test.Channel.UaStatus.StatusCode != StatusCode.BadSecurityChecksFailed ) {
        result = false;
    }
    Test.Disconnect( { SkipCloseSession: true } );
    return( result );
}

Test.Execute( { Procedure: certificateValidation010 } );