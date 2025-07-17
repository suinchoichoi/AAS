/*  Test 7; prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Attempt a secure Channel and send an expired [trusted] certificate.
    Expectation: Returns either: Good, or BadCertificateTimeInvalid; depending upon the configured setting and/or documented behavior. */

function certificateValidation007() {
    if( epSecureEncrypt === undefined || epSecureEncrypt === null ) { 
        addSkipped( "A secure channel is not available. This is only allowed for Nano and Micro Embedded Device Server Profiles." );
        return( false ); 
    }
    var result = false;
    var disabledInSettings = Settings.Advanced.CertificateOverrides.TimeInvalid;
    Test.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
            MessageSecurityMode: epSecureEncrypt.SecurityMode,
            ClientCertificate: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTE,
            ClientCertificatePrivateKey: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTEPrivateKey,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadCertificateTimeInvalid, StatusCode.Good )
        },
        SkipCreateSession: true
    } );
    if( Test.Channel.UaStatus.StatusCode == StatusCode.Good ) {
        if( disabledInSettings != 0 ) {
            addWarning( "DisableCertificateTimeInvalid is set in the CTT Settings. The connection was granted by the server which is the correct behaviour with this setting set.\nMake sure that the server is configured to suppress errors caused by invalid time periods.\nA compliant server hast to pass this test. This flag is provided for internal testing.\nSee OPC UA Spec Part 4 Table 104 for more informations." );
            result = true;
        }
        else {
            result = false;
            addError( "DisableCertificateTimeInvalid is not set in the CTT Settings but the connection was granted by the server.\nMake sure that the server is configured to suppress errors caused by invalid time periods and update the CTT settings or the server configuration.\nA compliant server hast to pass this test. This flag is provided for internal testing.\nSee OPC UA Spec Part 4 Table 104 for more informations." );
        }
    }
    if( Test.Channel.UaStatus.StatusCode == StatusCode.BadCertificateTimeInvalid ) {
        if( disabledInSettings != 0 ) {
            addError( "DisableCertificateTimeInvalid is set in the CTT Settings but the server rejected the connection.\nMake sure that the server is configured to suppress errors caused by invalid time periods and update the CTT settings or the server configuration.\nA compliant server hast to pass this test. This flag is provided for internal testing.\nSee OPC UA Spec Part 4 Table 104 for more informations." );
            result = false;
        }
        else {
            result = true;
        }
    }
    Test.Disconnect({ SkipCloseSession: true });
    return( result );
}

Test.Execute( { Procedure: certificateValidation007 } );