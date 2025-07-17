/*  Test prepared by Ing.-Büro Allmendinger; compliance@opcfoundation.org
    Description: Using an insecure connection (Security=None) and sending a certificate that has been revoked.
    Expectation: ServiceResult = Good; and the session opens. */

function certificateValidation013() {
    if( epSecureChNone === undefined || epSecureChNone === null ) {
        addSkipped( "An insecure channel is not available." );
        return ( false );
    }
    var result = true;
    Test.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureChNone.SecurityPolicyUri ),
            MessageSecurityMode: epSecureChNone.SecurityMode,
            ClientCertificate: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_appTR,
            ClientCertificatePrivateKey: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1T_appTRPrivateKey,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good )
        },
        SkipCreateSession: false,
        SkipActivateSession: false
    } )
    if( Test.Channel.UaStatus.StatusCode != StatusCode.Good ) {
        result = false;
    }
    CloseSessionHelper.Execute( {
        Session: Test.Session.Session,
        ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadSessionNotActivated ] )
    } );
    Test.Disconnect( { SkipCloseSession: true } );
    return ( result );
}

Test.Execute( { Procedure: certificateValidation013 } );