/*  Test prepared by Ing.-Büro Allmendinger; compliance@opcfoundation.org
    Description: Connect using an (untrusted) issued certificate of a CA that has no revocation list available. */

function certificateValidation043() {
    if( epSecureEncrypt === undefined || epSecureEncrypt === null ) {
        addSkipped( "A secure channel is not available. This is only allowed for Nano and Micro Embedded Device Server Profiles." );
        return ( false );
    }
    var result = true;
    var disabledInSettings = Settings.Advanced.CertificateOverrides.RevocationUnknown;
    Test.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
            MessageSecurityMode: epSecureEncrypt.SecurityMode,
            ClientCertificate: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_appU,
            ClientCertificatePrivateKey: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1TC_appUPrivateKey,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadCertificateRevocationUnknown, StatusCode.Good )
        },
        SkipCreateSession: true
    } );
    if( Test.Channel.UaStatus.StatusCode == StatusCode.Good ) {
        if( disabledInSettings != 0 ) {
            addWarning( "DisableCertificateRevocationUnknown is set in the CTT Settings.\nThe connection was granted by the server which is the correct behaviour with this setting set.\nMake sure that the server is configured to suppress errors caused by unavailable revocation list.\nA compliant server has to pass this test.\nThis flag is provided for build environments where the online revocation may not be available. It is expected to be available in an actual test environment.\nSee OPC UA Spec Part 4 Table 104 for more informations." );
            result = true;
        }
        else {
            result = false;
            addError( "DisableCertificateRevocationUnknown is not set in the CTT Settings but the connection was granted by the server.\nMake sure that the server is configured to suppress errors caused by unavailable revocation list and update the CTT settings or the server configuration.\nA compliant server has to pass this test.\nThis flag is provided for build environments where the online revocation may not be available. It is expected to be available in an actual test environment.\nSee OPC UA Spec Part 4 Table 104 for more informations." );
        }
    }
    if( Test.Channel.UaStatus.StatusCode == StatusCode.BadCertificateRevocationUnknown ) {
        if( disabledInSettings != 0 ) {
            addError( "DisableCertificateRevocationUnknown is set in the CTT Settings but the server rejected the connection.\nMake sure that the server is configured to suppress errors caused by unavailable revocation list and update the CTT settings or the server configuration.\nA compliant server has to pass this test.\nThis flag is provided for build environments where the online revocation may not be available. It is expected to be available in an actual test environment.\nSee OPC UA Spec Part 4 Table 104 for more informations." );
            result = false;
        }
        else {
            result = true;
        }
    }
    Test.Disconnect( { SkipCloseSession: true } );
    return( result );
}

Test.Execute( { Procedure: certificateValidation043 } )