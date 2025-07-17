/*  Test 29; prepared by Ing.-Büro Allmendinger; compliance@opcfoundation.org
    Description: Attempt a secure Channel and send a CA certificate. Server needs to check for flags which are required for a Application Instance Certificate and then prohibit a CA certificate or another certificate without these flags for a connection.
    Expectation: ServiceResult = BadCertificateUseNotAllowed */

function certificateValidation029() {
    if( epSecureEncrypt === undefined || epSecureEncrypt === null ) {
        addSkipped( "A secure channel is not available. This is only allowed for Nano and Micro Embedded Device Server Profiles." );
        return ( false );
    }
    var result = true;
    var disabledInSettings = Settings.Advanced.CertificateOverrides.UseNotAllowed;
    Test.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
            MessageSecurityMode: epSecureEncrypt.SecurityMode,
            ClientCertificate: Settings.Advanced.Certificates.ctt_ca1T,
            ClientCertificatePrivateKey: Settings.Advanced.Certificates.ctt_ca1TPrivateKey,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadCertificateUseNotAllowed, StatusCode.Good )
        },
        SkipCreateSession: true
    } );
    if( Test.Channel.UaStatus.StatusCode == StatusCode.Good ) {
        if( disabledInSettings != 0 ) {
            addWarning( "DisableCertificateUseNotAllowed is set in the CTT Settings.\nThe connection was granted by the server which is the correct behaviour with this setting set.\nMake sure that the server is configured to suppress errors caused by an invalid use of the certificate.\nA compliant server hast to pass this test. This flag is provided for internal testing.\nSee OPC UA Spec Part 4 Table 104 for more informations." );
            result = true;
        }
        else {
            result = false;
            addError( "DisableCertificateUseNotAllowed is not set in the CTT Settings but the connection was granted by the server.\nMake sure that the server is configured to suppress errors caused by an invalid use of the certificate and update the CTT settings or the server configuration.\nA compliant server hast to pass this test. This flag is provided for internal testing.\nSee OPC UA Spec Part 4 Table 104 for more informations." );
        }
    }
    if( Test.Channel.UaStatus.StatusCode == StatusCode.BadCertificateUseNotAllowed ) {
        if( disabledInSettings != 0 ) {
            addError( "DisableCertificateUseNotAllowed is set in the CTT Settings but the server rejected the connection.\nMake sure that the server is configured to suppress errors caused by an invalid use of the certificate and update the CTT settings or the server configuration.\nA compliant server hast to pass this test. This flag is provided for internal testing.\nSee OPC UA Spec Part 4 Table 104 for more informations." );
            result = false;
        }
        else {
            result = true;
        }
    }
    Test.Disconnect( { SkipCloseSession: true } );
    return( result );
}

Test.Execute( { Procedure: certificateValidation029 } );