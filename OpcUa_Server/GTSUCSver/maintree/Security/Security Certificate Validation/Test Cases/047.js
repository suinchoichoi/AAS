/*  Test prepared by Ing.-Büro Allmendinger; compliance@opcfoundation.org
    Description: Connect using a Revoked certificate that is not trusted. */

function certificateValidation047() {
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
            ClientCertificate: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_appUR,
            ClientCertificatePrivateKey: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_appURPrivateKey,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadSecurityChecksFailed )
        },
        SkipCreateSession: true
    } );
    if( Test.Channel.UaStatus.StatusCode == StatusCode.Good ) {
        addError( "The connection was granted by the server which is not allowed because the CA and the Application Instance Certificate are not trusted." );
        result = false;
    }
    if( Test.Channel.UaStatus.StatusCode == StatusCode.BadSecurityChecksFailed ) {
        result = true;
    }
    Test.Disconnect( { SkipCloseSession: true } );
    return ( result );
}

Test.Execute( { Procedure: certificateValidation047 } )