/* Test prepared by Nathan Pocock; compliance@opcfoundation.org
    Description: Creates 10 concurrent sessions. */

function createSession561002() {
const MAX=9;
    var sessions = [];
    // create the session objects
    for( var i=0; i<MAX; i++ ) {
        var session = SessionCreator.Connect();
        if( session.result ) {
            sessions.push( session );
        }
        else {
            break;
        }
    }

    // now to close
    for( var i=0; i<sessions.length; i++ ) { 
        SessionCreator.Disconnect( sessions[i] );
    }//for i...
    return( true );
}

Test.Execute( { Procedure: createSession561002 } );