/*  Test prepared by Ing.-Büro Allmendinger; compliance@opcfoundation.org
    Description: Connect using a trusted client certificate (sha1-1024). */

function certificateValidation049() {
    epSecureEncrypt128Rsa15 = UaEndpointDescription.Find( { Endpoints: gServerCapabilities.Endpoints, SecurityPolicyUri: SecurityPolicy.policyToString( SecurityPolicy.Basic128Rsa15 ), FilterHTTPS: true, MostSecure: true } );
    if( epSecureEncrypt128Rsa15 === undefined || epSecureEncrypt128Rsa15 === null ) {
        addSkipped( "A secure channel is not available. This is only allowed for Nano and Micro Embedded Device Server Profiles." );
        return ( false );
    }
    var result = true;
    Test.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt128Rsa15.SecurityPolicyUri ),
            MessageSecurityMode: epSecureEncrypt128Rsa15.SecurityMode,
            ClientCertificate: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha1_1024,
            ClientCertificatePrivateKey: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha1_1024PrivateKey,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadSecurityChecksFailed )
        },
        SkipCreateSession: true
    } );
    if( Test.Channel.UaStatus.StatusCode != StatusCode.Good ) {
        addWarning( "The server rejected the connection when trying to use a certificate encrypted with Sha1-1024.\nThis behavior is compliant but older clients would not be able to connect to the server." );
        result = false;
    }
    Test.Disconnect( { SkipCloseSession: true } );
    return( result );
}

Test.Execute( { Procedure: certificateValidation049 } );
