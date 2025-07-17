/*  Test prepared by Ing.-Büro Allmendinger; compliance@opcfoundation.org
    Description: Connect using a trusted client certificate (sha2-2048). */

function certificateValidation051() {
    if( epSecureEncrypt === undefined || epSecureEncrypt === null ) {
        addSkipped( "A secure channel is not available. This is only allowed for Nano and Micro Embedded Device Server Profiles." );
        return ( false );
    }
    var result = true;
    Test.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
            MessageSecurityMode: epSecureEncrypt.SecurityMode,
            ClientCertificate: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha256_2048,
            ClientCertificatePrivateKey: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha256_2048PrivateKey,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good )
        },
        SkipCreateSession: true
    } );
    if( Test.Channel.UaStatus.StatusCode != StatusCode.Good ) {
        result = false;
    }
    Test.Disconnect( { SkipCloseSession: true } );
    return( result );
}

Test.Execute( { Procedure: certificateValidation051 } )