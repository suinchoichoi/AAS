/*  Test prepared by Ing.-Büro Allmendinger; compliance@opcfoundation.org
    Description: Connect using an (not trusted) issued certificate of a CA that is not trusted but available. */

function certificateValidation045() {
    if( epSecureEncrypt === undefined || epSecureEncrypt === null ) {
        addSkipped( "A secure channel is not available. This is only allowed for Nano and Micro Embedded Device Server Profiles." );
        return ( false );
    }
    var result = true;
    Test.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
            MessageSecurityMode: epSecureEncrypt.SecurityMode,
            ClientCertificate: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_appU,
            ClientCertificatePrivateKey: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_ca1I_appUPrivateKey,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSecurityChecksFailed )
        },
        SkipCreateSession: true
    } );
    if( Test.Channel.UaStatus.StatusCode != StatusCode.BadSecurityChecksFailed ) {
        result = false;
    }
    Test.Disconnect( { SkipCloseSession: true } );
    return( result );
}

Test.Execute( { Procedure: certificateValidation045 } )