/*  Test 9; prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Attempt a secure channel and send a certificate that was issued by an unknown (not trusted) CertificateAuthority.
    Expectation: ServiceResult = BadSecurityChecksFailed */

function certificateValidation009() {
    if (epSecureEncrypt === undefined || epSecureEncrypt === null) {
        addSkipped("A secure channel is not available. This is only allowed for Nano and Micro Embedded Device Server Profiles.");
        return( false ); 
    }
    var result = true;
    Test.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
            MessageSecurityMode: epSecureEncrypt.SecurityMode,
            ClientCertificate: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1U_appT,
            ClientCertificatePrivateKey: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1U_appTPrivateKey,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSecurityChecksFailed ) },
        SkipCreateSession: true
    } )
    if( Test.Channel.UaStatus.StatusCode != StatusCode.BadSecurityChecksFailed ) {
        result = false;
    }
    Test.Disconnect( { SkipCloseSession: true } );
    return( result );
}

Test.Execute( { Procedure: certificateValidation009 } );