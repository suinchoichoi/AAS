/*  Test prepared by Ing.-Büro Allmendinger; compliance@opcfoundation.org
    Description: Connect using a trusted client certificate (sha2-4096). */

function certificateValidation052() {
    if( epSecureEncrypt === undefined || epSecureEncrypt === null ) {
        addSkipped( "A secure channel is not available. This is only allowed for Nano and Micro Embedded Device Server Profiles." );
        return ( false );
    }
    var expectedResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( epSecureEncrypt.SecurityPolicyUri == SecurityPolicy.policyToString( SecurityPolicy.Basic128Rsa15 ) || epSecureEncrypt.SecurityPolicyUri == SecurityPolicy.policyToString( SecurityPolicy.Basic256 ) ) {
        expectedResult.addExpectedResult( StatusCode.BadSecurityChecksFailed );
    }
    var result = Test.Connect( {
        OpenSecureChannel: {
            RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
            MessageSecurityMode: epSecureEncrypt.SecurityMode,
            ClientCertificate: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha256_4096,
            ClientCertificatePrivateKey: Settings.Advanced.Certificates.ApplicationInstanceCertificates.ctt_appTSha256_4096PrivateKey,
            ServiceResult: expectedResult
        },
        SkipCreateSession: true
    } );

    Test.Disconnect( { SkipCloseSession: true } );
    return ( result );
}

Test.Execute( { Procedure: certificateValidation052 } )