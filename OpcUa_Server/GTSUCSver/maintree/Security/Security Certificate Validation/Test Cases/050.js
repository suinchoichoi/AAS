/*  Test prepared by Ing.-Büro Allmendinger; compliance@opcfoundation.org
    Description: Connect using a trusted client certificate (sha1-2048). */

function certificateValidation049() {
    epSecureEncrypt128Rsa15 = UaEndpointDescription.Find( { Endpoints: gServerCapabilities.Endpoints, SecurityPolicyUri: SecurityPolicy.policyToString( SecurityPolicy.Basic128Rsa15 ), FilterHTTPS: true, MostSecure: true } );
    if( epSecureEncrypt128Rsa15 === undefined || epSecureEncrypt128Rsa15 === null ) {
        addSkipped( "A secure channel is not available. This is only allowed for Nano and Micro Embedded Device Server Profiles." );
        return( false );
    }
    var result = true;
    Test.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt128Rsa15.SecurityPolicyUri ),
            MessageSecurityMode: epSecureEncrypt128Rsa15.SecurityMode,
            ClientCertificate: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha1_2048,
            ClientCertificatePrivateKey: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha1_2048PrivateKey,
            ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good )
        },
        SkipCreateSession: true
    } );
    if( Test.Channel.UaStatus.StatusCode != StatusCode.Good ) {
        addError( "The server rejected the connection when trying to use a certificate encrypted with Sha1-2048.\nThis is the most secure certificate supported by SecurityPolicy Basic128Rsa15 and must be supported if the SecurityPolicy is." );
        result = false;
    }
    Test.Disconnect( { SkipCloseSession: true } );
    return( result );
}

Test.Execute( { Procedure: certificateValidation049 } );