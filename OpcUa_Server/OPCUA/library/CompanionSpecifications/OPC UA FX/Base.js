include( "./library/CompanionSpecifications/OPC UA FX/CSUtils.js" );

var UAFXBaseVariables = new Object();
if( !isDefined( UAFXBaseVariables.ModelMapHelper ) ) UAFXBaseVariables.ModelMapHelper = new BuildLocalCacheMapService();
if( !isDefined( UAFXBaseVariables.ModelMap ) ) UAFXBaseVariables.ModelMap = UAFXBaseVariables.ModelMapHelper.GetModelMap();
UAFXBaseVariables.suppressNamespaceWarnings = false;

// AssetVerificationResultEnum constants
var AssetVerificationResult = new Object();
AssetVerificationResult.NotSet = 0; AssetVerificationResult.Match = 1;
AssetVerificationResult.Compatible = 2; AssetVerificationResult.Mismatch = 3;
var AssetVerificationResult_Names = [ "NotSet", "Match", "Compatible", "Mismatch" ];
// AssetVerificationModeEnum constants
var AssetVerificationMode  = new Object();
AssetVerificationMode.AssetCompatibility = 0; AssetVerificationMode.AssetIdentity = 1;
AssetVerificationMode.AssetIdentityAndCompatibility = 2;
var AssetVerificationMode_Names = [ "AssetCompatibility", "AssetIdentity", "AssetIdentityAndCompatibility" ];
// FunctionalEntityVerificationResultEnum constants
var FunctionalEntityVerificationResult = new Object();
FunctionalEntityVerificationResult.NotSet = 0;
FunctionalEntityVerificationResult.Match = 1;
FunctionalEntityVerificationResult.Mismatch = 2;
var FunctionalEntityVerificationResult_Names = [ "NotSet", "Match", "Mismatch" ];
// PubSubConnectionEndpointModeEnum constants
var PubSubConnectionEndpointModeEnum = new Object();
PubSubConnectionEndpointModeEnum.PublisherSubscriber = 1;
PubSubConnectionEndpointModeEnum.Publisher = 2;
PubSubConnectionEndpointModeEnum.Subscriber = 3;
var PubSubConnectionEndpointModeEnum_Names = [ "PublisherSubscriber", "Publisher", "Subscriber" ];

// CTT RelatedEndpoint Data (for Establishing a connection with the CTT)
var CTTRelatedEndpointData = {
    Address: "opc.tcp://localhost:49010/",
    ConnectionEndpointPath: [
        {
            NamespaceUri: "http://opcfoundation.org/FxShow/Controller/",
            Name: "BottleController"
        },
        {
            NamespaceUri: "http://opcfoundation.org/UA/FX/AC/",
            Name: "FunctionalEntities"
        },
        {
            NamespaceUri: "http://opcfoundation.org/FxShow/Controller/",
            Name: "BottleMachine"
        }
    ],
    ConnectionEndpointName: "CTTConnectionEndpoint"
}

/**
 * Finds and verifies UA, UA/DI and UA/FX NamespaceIndexes in the NamespaceArray of the server and stores them in the passed object
 * 
 * baseVariables - {object} - Object for the results to be stored in (properties UANamespaceIndex, DINamespaceIndex, FXACNamespaceIndex and FXDataNamespaceIndex will be created. If one could not be found, it will be 'null')
 *
 * @returns {boolean} Returns false if one or more Namespaces could not be found in the NamespaceArray of the server. True on success.
 */
function InitializeNamespaceIndexes( baseVariables ) {
    var bSuccess = true;
    baseVariables.UANamespaceIndex = null;
    baseVariables.DINamespaceIndex = null;
    baseVariables.FXACNamespaceIndex = null;
    baseVariables.FXDataNamespaceIndex = null;
    if( !isDefined( gServerCapabilities ) || !isDefined( gServerCapabilities.NamespaceArray ) || gServerCapabilities.NamespaceArray.length > 0 ) {
        Test.Connect();
        Test.Disconnect();
    }
    baseVariables.NamespaceArrayLength = gServerCapabilities.NamespaceArray.length;
    for( var i = 0; i < gServerCapabilities.NamespaceArray.length; i++ ) {
        switch( gServerCapabilities.NamespaceArray[i] ) {
            case "http://opcfoundation.org/UA/": baseVariables.UANamespaceIndex = i; break;
            case "http://opcfoundation.org/UA/DI/": baseVariables.DINamespaceIndex = i; break;
            case "http://opcfoundation.org/UA/FX/AC/": baseVariables.FXACNamespaceIndex = i; break;
            case "http://opcfoundation.org/UA/FX/Data/": baseVariables.FXDataNamespaceIndex = i; break;
        }
    }
    if( !isDefined( baseVariables.UANamespaceIndex ) ) { addError( "Mandatory namespace 'http://opcfoundation.org/UA/' was not found in NamespaceArray of the server" ); baseVariables.UANamespaceIndex = -1; bSuccess = false; }
    if( !isDefined( baseVariables.DINamespaceIndex ) ) { addError( "Mandatory namespace 'http://opcfoundation.org/UA/DI/' was not found in NamespaceArray of the server" ); baseVariables.DINamespaceIndex = -1; bSuccess = false; }
    if( !isDefined( baseVariables.FXACNamespaceIndex ) ) { addWarning( "Optional namespace 'http://opcfoundation.org/UA/FX/AC/' was not found in NamespaceArray of the server" ); baseVariables.FXACNamespaceIndex = -1; bSuccess = false; }
    if( !isDefined( baseVariables.FXDataNamespaceIndex ) ) { addError( "Mandatory namespace 'http://opcfoundation.org/UA/FX/Data/' was not found in NamespaceArray of the server" ); baseVariables.FXDataNamespaceIndex = -1; bSuccess = false; }
    return ( bSuccess );
}

InitializeNamespaceIndexes( UAFXBaseVariables );

// TestObject: Empty Object to be initialized
// ModelMap: (Optional) ModelMap to use if already available
// ModelMapHelper: (Optional) ModelMapHelper to use if already available
function initializeStandardVariables( args ) {
    if( !isDefined( args ) ) throw( "initializeStandardVariables(): args not specified" );
    if( !isDefined( args.TestObject ) ) throw( "initializeStandardVariables(): TestObject not specified" );
    if( !isDefined( args.ModelMapHelper ) ) args.ModelMapHelper = new BuildLocalCacheMapService();
    if( !isDefined( args.ModelMap ) ) args.ModelMap = args.ModelMapHelper.GetModelMap();
    if( !isDefined( args.SkipAutomationComponent ) ) args.SkipAutomationComponent = false;
    
    // BaseObjectType
    args.TestObject.BaseObjectType = new MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.BaseObjectType ) ] )[0];
    args.TestObject.BaseObjectType.References = args.ModelMap.Get( args.TestObject.BaseObjectType.NodeId.toString() );

    var searchDefinition_BaseObjectType = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "AssetConnectorType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ControlGroupType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "FunctionalEntityType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "SubscriberCapabilitiesType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "PublisherCapabilitiesType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ConnectionEndpointType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "AutomationComponentType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "FxAssetType" } )
        }
    ];
    FindReferencesVerifyingNamespaceIndex( args.TestObject.BaseObjectType.References.ReferenceDescriptions, searchDefinition_BaseObjectType, args.ModelMapHelper );
    if( isDefined( searchDefinition_BaseObjectType[0].ReferenceIndex ) ) {
        args.TestObject.BaseObjectType.AssetConnectorType = new MonitoredItem( args.TestObject.BaseObjectType.References.ReferenceDescriptions[searchDefinition_BaseObjectType[0].ReferenceIndex].NodeId.NodeId );
        args.TestObject.BaseObjectType.AssetConnectorType.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.NodeId.toString() );
        
        // BaseObjectType.AssetConnectorType
        var searchDefinition_AssetConnectorType = [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Id" } )
            },
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Name" } )
            },
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "SlotType" } )
            },
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "SocketType" } )
            },
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ClampType" } )
            },
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ClampBlockType" } )
            }
        ];
        FindReferencesVerifyingNamespaceIndex( args.TestObject.BaseObjectType.AssetConnectorType.References.ReferenceDescriptions, searchDefinition_AssetConnectorType, args.ModelMapHelper );
        if( isDefined( searchDefinition_AssetConnectorType[0].ReferenceIndex ) ) {
            args.TestObject.BaseObjectType.AssetConnectorType.Id = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.References.ReferenceDescriptions[searchDefinition_AssetConnectorType[0].ReferenceIndex].NodeId.NodeId );
            args.TestObject.BaseObjectType.AssetConnectorType.Id.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.Id.NodeId.toString() );            
        }
        if( isDefined( searchDefinition_AssetConnectorType[1].ReferenceIndex ) ) {
            args.TestObject.BaseObjectType.AssetConnectorType.Name = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.References.ReferenceDescriptions[searchDefinition_AssetConnectorType[1].ReferenceIndex].NodeId.NodeId );
            args.TestObject.BaseObjectType.AssetConnectorType.Name.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.Name.NodeId.toString() );            
        }
        if( isDefined( searchDefinition_AssetConnectorType[2].ReferenceIndex ) ) {
            args.TestObject.BaseObjectType.AssetConnectorType.SlotType = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.References.ReferenceDescriptions[searchDefinition_AssetConnectorType[2].ReferenceIndex].NodeId.NodeId );
            args.TestObject.BaseObjectType.AssetConnectorType.SlotType.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.SlotType.NodeId.toString() );
            
            // BaseObjectType.AssetConnectorType.SlotType
            var searchDefinition = [
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Id" } )
                },
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "LogicalId" } )
                }
            ];
            FindReferencesVerifyingNamespaceIndex( args.TestObject.BaseObjectType.AssetConnectorType.SlotType.References.ReferenceDescriptions, searchDefinition, args.ModelMapHelper );
            if( isDefined( searchDefinition[0].ReferenceIndex ) ) {
                args.TestObject.BaseObjectType.AssetConnectorType.SlotType.Id = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.SlotType.References.ReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId );
                args.TestObject.BaseObjectType.AssetConnectorType.SlotType.Id.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.SlotType.Id.NodeId.toString() );
            }
            if( isDefined( searchDefinition[1].ReferenceIndex ) ) {
                args.TestObject.BaseObjectType.AssetConnectorType.SlotType.LogicalId = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.SlotType.References.ReferenceDescriptions[searchDefinition[1].ReferenceIndex].NodeId.NodeId );
                args.TestObject.BaseObjectType.AssetConnectorType.SlotType.LogicalId.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.SlotType.LogicalId.NodeId.toString() );
            }
            
        }
        if( isDefined( searchDefinition_AssetConnectorType[3].ReferenceIndex ) ) {
            args.TestObject.BaseObjectType.AssetConnectorType.SocketType = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.References.ReferenceDescriptions[searchDefinition_AssetConnectorType[3].ReferenceIndex].NodeId.NodeId );
            args.TestObject.BaseObjectType.AssetConnectorType.SocketType.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.SocketType.NodeId.toString() );
            
            // BaseObjectType.AssetConnectorType.SocketType
            var searchDefinition = [
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Kind" } )
                },
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Name" } )
                }
            ];
            FindReferencesVerifyingNamespaceIndex( args.TestObject.BaseObjectType.AssetConnectorType.SocketType.References.ReferenceDescriptions, searchDefinition, args.ModelMapHelper );
            if( isDefined( searchDefinition[0].ReferenceIndex ) ) {
                args.TestObject.BaseObjectType.AssetConnectorType.SocketType.Kind = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.SocketType.References.ReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId );
                args.TestObject.BaseObjectType.AssetConnectorType.SocketType.Kind.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.SocketType.Kind.NodeId.toString() );
            }
            if( isDefined( searchDefinition[1].ReferenceIndex ) ) {
                args.TestObject.BaseObjectType.AssetConnectorType.SocketType.Name = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.SocketType.References.ReferenceDescriptions[searchDefinition[1].ReferenceIndex].NodeId.NodeId );
                args.TestObject.BaseObjectType.AssetConnectorType.SocketType.Name.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.SocketType.Name.NodeId.toString() );
            }
            
        }
        if( isDefined( searchDefinition_AssetConnectorType[4].ReferenceIndex ) ) {
            args.TestObject.BaseObjectType.AssetConnectorType.ClampType = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.References.ReferenceDescriptions[searchDefinition_AssetConnectorType[4].ReferenceIndex].NodeId.NodeId );
            args.TestObject.BaseObjectType.AssetConnectorType.ClampType.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.ClampType.NodeId.toString() );
            
            // BaseObjectType.AssetConnectorType.ClampType
            var searchDefinition = [
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Kind" } )
                },
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Name" } )
                }
            ];
            FindReferencesVerifyingNamespaceIndex( args.TestObject.BaseObjectType.AssetConnectorType.ClampType.References.ReferenceDescriptions, searchDefinition, args.ModelMapHelper );
            if( isDefined( searchDefinition[0].ReferenceIndex ) ) {
                args.TestObject.BaseObjectType.AssetConnectorType.ClampType.Kind = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.ClampType.References.ReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId );
                args.TestObject.BaseObjectType.AssetConnectorType.ClampType.Kind.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.ClampType.Kind.NodeId.toString() );
            }
            if( isDefined( searchDefinition[1].ReferenceIndex ) ) {
                args.TestObject.BaseObjectType.AssetConnectorType.ClampType.Name = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.ClampType.References.ReferenceDescriptions[searchDefinition[1].ReferenceIndex].NodeId.NodeId );
                args.TestObject.BaseObjectType.AssetConnectorType.ClampType.Name.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.ClampType.Name.NodeId.toString() );
            }
        }
        if( isDefined( searchDefinition_AssetConnectorType[5].ReferenceIndex ) ) {
            args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.References.ReferenceDescriptions[searchDefinition_AssetConnectorType[5].ReferenceIndex].NodeId.NodeId );
            args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.NodeId.toString() ); 
            
            // BaseObjectType.AssetConnectorType.ClampBlockType
            var searchDefinition = [
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Name" } )
                },
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "BlockSize" } )
                },
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Kind" } )
                },
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "<Clamp>" } )
                }
            ];
            FindReferencesVerifyingNamespaceIndex( args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.References.ReferenceDescriptions, searchDefinition, args.ModelMapHelper );
            if( isDefined( searchDefinition[0].ReferenceIndex ) ) {
                args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.Name = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.References.ReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId );
                args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.Name.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.Name.NodeId.toString() );
            }
            if( isDefined( searchDefinition[1].ReferenceIndex ) ) {
                args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.BlockSize = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.References.ReferenceDescriptions[searchDefinition[1].ReferenceIndex].NodeId.NodeId );
                args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.BlockSize.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.BlockSize.NodeId.toString() );
            }
            if( isDefined( searchDefinition[2].ReferenceIndex ) ) {
                args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.Kind = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.References.ReferenceDescriptions[searchDefinition[2].ReferenceIndex].NodeId.NodeId );
                args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.Kind.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.Kind.NodeId.toString() );
            }
            if( isDefined( searchDefinition[3].ReferenceIndex ) ) {
                args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.Clamp = new MonitoredItem( args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.References.ReferenceDescriptions[searchDefinition[3].ReferenceIndex].NodeId.NodeId );
                args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.Clamp.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AssetConnectorType.ClampBlockType.Clamp.NodeId.toString() );
            }
            
        }
        
    }
    if( isDefined( searchDefinition_BaseObjectType[1].ReferenceIndex ) ) {
        args.TestObject.BaseObjectType.ControlGroupType = new MonitoredItem( args.TestObject.BaseObjectType.References.ReferenceDescriptions[searchDefinition_BaseObjectType[1].ReferenceIndex].NodeId.NodeId );
        args.TestObject.BaseObjectType.ControlGroupType.References = args.ModelMap.Get( args.TestObject.BaseObjectType.ControlGroupType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_BaseObjectType[2].ReferenceIndex ) ) {
        args.TestObject.BaseObjectType.FunctionalEntityType = new MonitoredItem( args.TestObject.BaseObjectType.References.ReferenceDescriptions[searchDefinition_BaseObjectType[2].ReferenceIndex].NodeId.NodeId );
        args.TestObject.BaseObjectType.FunctionalEntityType.References = args.ModelMap.Get( args.TestObject.BaseObjectType.FunctionalEntityType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_BaseObjectType[3].ReferenceIndex ) ) {
        args.TestObject.BaseObjectType.SubscriberCapabilitiesType = new MonitoredItem( args.TestObject.BaseObjectType.References.ReferenceDescriptions[searchDefinition_BaseObjectType[3].ReferenceIndex].NodeId.NodeId );
        args.TestObject.BaseObjectType.SubscriberCapabilitiesType.References = args.ModelMap.Get( args.TestObject.BaseObjectType.SubscriberCapabilitiesType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_BaseObjectType[4].ReferenceIndex ) ) {
        args.TestObject.BaseObjectType.PublisherCapabilitiesType = new MonitoredItem( args.TestObject.BaseObjectType.References.ReferenceDescriptions[searchDefinition_BaseObjectType[4].ReferenceIndex].NodeId.NodeId );
        args.TestObject.BaseObjectType.PublisherCapabilitiesType.References = args.ModelMap.Get( args.TestObject.BaseObjectType.PublisherCapabilitiesType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_BaseObjectType[5].ReferenceIndex ) ) {
        args.TestObject.BaseObjectType.ConnectionEndpointType = new MonitoredItem( args.TestObject.BaseObjectType.References.ReferenceDescriptions[searchDefinition_BaseObjectType[5].ReferenceIndex].NodeId.NodeId );
        args.TestObject.BaseObjectType.ConnectionEndpointType.References = args.ModelMap.Get( args.TestObject.BaseObjectType.ConnectionEndpointType.NodeId.toString() );
        
        // BaseObjectType.ConnectionEndpointType
        var searchDefinition_ConnectionEndpointType = [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "PubSubConnectionEndpointType" } )
            }
        ];
        FindReferencesVerifyingNamespaceIndex( args.TestObject.BaseObjectType.ConnectionEndpointType.References.ReferenceDescriptions, searchDefinition_ConnectionEndpointType, args.ModelMapHelper );
        if( isDefined( searchDefinition_ConnectionEndpointType[0].ReferenceIndex ) ) {
            args.TestObject.BaseObjectType.ConnectionEndpointType.PubSubConnectionEndpointType = new MonitoredItem( args.TestObject.BaseObjectType.ConnectionEndpointType.References.ReferenceDescriptions[searchDefinition_ConnectionEndpointType[0].ReferenceIndex].NodeId.NodeId );
            args.TestObject.BaseObjectType.ConnectionEndpointType.PubSubConnectionEndpointType.References = args.ModelMap.Get( args.TestObject.BaseObjectType.ConnectionEndpointType.PubSubConnectionEndpointType.NodeId.toString() );
        }
    }
    if( isDefined( searchDefinition_BaseObjectType[6].ReferenceIndex ) ) {
        args.TestObject.BaseObjectType.AutomationComponentType = new MonitoredItem( args.TestObject.BaseObjectType.References.ReferenceDescriptions[searchDefinition_BaseObjectType[6].ReferenceIndex].NodeId.NodeId );
        args.TestObject.BaseObjectType.AutomationComponentType.References = args.ModelMap.Get( args.TestObject.BaseObjectType.AutomationComponentType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_BaseObjectType[7].ReferenceIndex ) ) {
        args.TestObject.BaseObjectType.FxAssetType = new MonitoredItem( args.TestObject.BaseObjectType.References.ReferenceDescriptions[searchDefinition_BaseObjectType[7].ReferenceIndex].NodeId.NodeId );
        args.TestObject.BaseObjectType.FxAssetType.References = args.ModelMap.Get( args.TestObject.BaseObjectType.FxAssetType.NodeId.toString() );
    }
    
    // Enumeration
    args.TestObject.Enumeration = new MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.Enumeration ) ] )[0];
    args.TestObject.Enumeration.References = args.ModelMap.Get( args.TestObject.Enumeration.NodeId.toString() );

    var searchDefinition_Enumeration = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "PubSubConnectionEndpointModeEnum" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ConnectionEndpointStatusEnum" } )
        }
    ];
    FindReferencesVerifyingNamespaceIndex( args.TestObject.Enumeration.References.ReferenceDescriptions, searchDefinition_Enumeration, args.ModelMapHelper );
    if( isDefined( searchDefinition_Enumeration[0].ReferenceIndex ) ) {
        args.TestObject.Enumeration.PubSubConnectionEndpointModeEnum = new MonitoredItem( args.TestObject.Enumeration.References.ReferenceDescriptions[searchDefinition_Enumeration[0].ReferenceIndex].NodeId.NodeId );
        args.TestObject.Enumeration.PubSubConnectionEndpointModeEnum.References = args.ModelMap.Get( args.TestObject.Enumeration.PubSubConnectionEndpointModeEnum.NodeId.toString() );
    }
    if( isDefined( searchDefinition_Enumeration[1].ReferenceIndex ) ) {
        args.TestObject.Enumeration.ConnectionEndpointStatusEnum = new MonitoredItem( args.TestObject.Enumeration.References.ReferenceDescriptions[searchDefinition_Enumeration[1].ReferenceIndex].NodeId.NodeId );
        args.TestObject.Enumeration.ConnectionEndpointStatusEnum.References = args.ModelMap.Get( args.TestObject.Enumeration.ConnectionEndpointStatusEnum.NodeId.toString() );
    }
    
    // FolderType
    args.TestObject.FolderType = new MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.FolderType ) ] )[0];
    args.TestObject.FolderType.References = args.ModelMap.Get( args.TestObject.FolderType.NodeId.toString() );

    var searchDefinition_FolderType = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ConnectionEndpointsFolderType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ControlGroupsFolderType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "FunctionalGroupType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "InputsFolderType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "OutputsFolderType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "FunctionalEntityCapabilitiesType" } )
        }
    ];
    FindReferencesVerifyingNamespaceIndex( args.TestObject.FolderType.References.ReferenceDescriptions, searchDefinition_FolderType, args.ModelMapHelper );
    if( isDefined( searchDefinition_FolderType[0].ReferenceIndex ) ) {
        args.TestObject.FolderType.ConnectionEndpointsFolderType = new MonitoredItem( args.TestObject.FolderType.References.ReferenceDescriptions[searchDefinition_FolderType[0].ReferenceIndex].NodeId.NodeId );
        args.TestObject.FolderType.ConnectionEndpointsFolderType.References = args.ModelMap.Get( args.TestObject.FolderType.ConnectionEndpointsFolderType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_FolderType[1].ReferenceIndex ) ) {
        args.TestObject.FolderType.ControlGroupsFolderType = new MonitoredItem( args.TestObject.FolderType.References.ReferenceDescriptions[searchDefinition_FolderType[1].ReferenceIndex].NodeId.NodeId );
        args.TestObject.FolderType.ControlGroupsFolderType.References = args.ModelMap.Get( args.TestObject.FolderType.ConnectionEndpointsFolderType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_FolderType[2].ReferenceIndex ) ) {
        args.TestObject.FolderType.FunctionalGroupType = new MonitoredItem( args.TestObject.FolderType.References.ReferenceDescriptions[searchDefinition_FolderType[2].ReferenceIndex].NodeId.NodeId );
        args.TestObject.FolderType.FunctionalGroupType.References = args.ModelMap.Get( args.TestObject.FolderType.FunctionalGroupType.NodeId.toString() );
        
        // FolderType.FunctionalGroupType
        var searchDefinition_FunctionalGroupType = [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ConfigurationDataFolderType" } )
            },
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ControlItemFolderType" } )
            }
        ];
        FindReferencesVerifyingNamespaceIndex( args.TestObject.FolderType.FunctionalGroupType.References.ReferenceDescriptions, searchDefinition_FunctionalGroupType, args.ModelMapHelper );
        if( isDefined( searchDefinition_FunctionalGroupType[0].ReferenceIndex ) ) {
            args.TestObject.FolderType.FunctionalGroupType.ConfigurationDataFolderType = new MonitoredItem( args.TestObject.FolderType.FunctionalGroupType.References.ReferenceDescriptions[searchDefinition_FunctionalGroupType[0].ReferenceIndex].NodeId.NodeId );
            args.TestObject.FolderType.FunctionalGroupType.ConfigurationDataFolderType.References = args.ModelMap.Get( args.TestObject.FolderType.FunctionalGroupType.ConfigurationDataFolderType.NodeId.toString() );
        }
        if( isDefined( searchDefinition_FunctionalGroupType[1].ReferenceIndex ) ) {
            args.TestObject.FolderType.FunctionalGroupType.ControlItemFolderType = new MonitoredItem( args.TestObject.FolderType.FunctionalGroupType.References.ReferenceDescriptions[searchDefinition_FunctionalGroupType[1].ReferenceIndex].NodeId.NodeId );
            args.TestObject.FolderType.FunctionalGroupType.ControlItemFolderType.References = args.ModelMap.Get( args.TestObject.FolderType.FunctionalGroupType.ControlItemFolderType.NodeId.toString() );
        }
    }
    if( isDefined( searchDefinition_FolderType[3].ReferenceIndex ) ) {
        args.TestObject.FolderType.InputsFolderType = new MonitoredItem( args.TestObject.FolderType.References.ReferenceDescriptions[searchDefinition_FolderType[3].ReferenceIndex].NodeId.NodeId );
        args.TestObject.FolderType.InputsFolderType.References = args.ModelMap.Get( args.TestObject.FolderType.InputsFolderType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_FolderType[4].ReferenceIndex ) ) {
        args.TestObject.FolderType.OutputsFolderType = new MonitoredItem( args.TestObject.FolderType.References.ReferenceDescriptions[searchDefinition_FolderType[4].ReferenceIndex].NodeId.NodeId );
        args.TestObject.FolderType.OutputsFolderType.References = args.ModelMap.Get( args.TestObject.FolderType.OutputsFolderType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_FolderType[5].ReferenceIndex ) ) {
        args.TestObject.FolderType.FunctionalEntityCapabilitiesType = new MonitoredItem( args.TestObject.FolderType.References.ReferenceDescriptions[searchDefinition_FolderType[5].ReferenceIndex].NodeId.NodeId );
        args.TestObject.FolderType.FunctionalEntityCapabilitiesType.References = args.ModelMap.Get( args.TestObject.FolderType.FunctionalEntityCapabilitiesType.NodeId.toString() );
    }
    
    // HasComponent
    args.TestObject.HasComponent = new MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.HasComponent ) ] )[0];
    args.TestObject.HasComponent.References = args.ModelMap.Get( args.TestObject.HasComponent.NodeId.toString() );

    var searchDefinition_HasComponent = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "HasSubFunctionalEntity" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "HasInputGroup" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "HasOutputGroup" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "HasControlGroup" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "HasConnectionEndpoint" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "HasCapability" } )
        }
    ];
    FindReferencesVerifyingNamespaceIndex( args.TestObject.HasComponent.References.ReferenceDescriptions, searchDefinition_HasComponent, args.ModelMapHelper );
    if( isDefined( searchDefinition_HasComponent[0].ReferenceIndex ) ) {
        args.TestObject.HasComponent.HasSubFunctionalEntity = new MonitoredItem( args.TestObject.HasComponent.References.ReferenceDescriptions[searchDefinition_HasComponent[0].ReferenceIndex].NodeId.NodeId );
        args.TestObject.HasComponent.HasSubFunctionalEntity.References = args.ModelMap.Get( args.TestObject.HasComponent.HasSubFunctionalEntity.NodeId.toString() );
    }
    if( isDefined( searchDefinition_HasComponent[1].ReferenceIndex ) ) {
        args.TestObject.HasComponent.HasInputGroup = new MonitoredItem( args.TestObject.HasComponent.References.ReferenceDescriptions[searchDefinition_HasComponent[1].ReferenceIndex].NodeId.NodeId );
        args.TestObject.HasComponent.HasInputGroup.References = args.ModelMap.Get( args.TestObject.HasComponent.HasInputGroup.NodeId.toString() );
    }
    if( isDefined( searchDefinition_HasComponent[2].ReferenceIndex ) ) {
        args.TestObject.HasComponent.HasOutputGroup = new MonitoredItem( args.TestObject.HasComponent.References.ReferenceDescriptions[searchDefinition_HasComponent[2].ReferenceIndex].NodeId.NodeId );
        args.TestObject.HasComponent.HasOutputGroup.References = args.ModelMap.Get( args.TestObject.HasComponent.HasOutputGroup.NodeId.toString() );
    }
    if( isDefined( searchDefinition_HasComponent[3].ReferenceIndex ) ) {
        args.TestObject.HasComponent.HasControlGroup = new MonitoredItem( args.TestObject.HasComponent.References.ReferenceDescriptions[searchDefinition_HasComponent[3].ReferenceIndex].NodeId.NodeId );
        args.TestObject.HasComponent.HasControlGroup.References = args.ModelMap.Get( args.TestObject.HasComponent.HasControlGroup.NodeId.toString() );
    }
    if( isDefined( searchDefinition_HasComponent[4].ReferenceIndex ) ) {
        args.TestObject.HasComponent.HasConnectionEndpoint = new MonitoredItem( args.TestObject.HasComponent.References.ReferenceDescriptions[searchDefinition_HasComponent[4].ReferenceIndex].NodeId.NodeId );
        args.TestObject.HasComponent.HasConnectionEndpoint.References = args.ModelMap.Get( args.TestObject.HasComponent.HasConnectionEndpoint.NodeId.toString() );
    }
    if( isDefined( searchDefinition_HasComponent[5].ReferenceIndex ) ) {
        args.TestObject.HasComponent.HasCapability = new MonitoredItem( args.TestObject.HasComponent.References.ReferenceDescriptions[searchDefinition_HasComponent[5].ReferenceIndex].NodeId.NodeId );
        args.TestObject.HasComponent.HasCapability.References = args.ModelMap.Get( args.TestObject.HasComponent.HasCapability.NodeId.toString() );
    }
    
    // HierarchicalReferences
    args.TestObject.HierarchicalReferences = new MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.HierarchicalReferences ) ] )[0];
    args.TestObject.HierarchicalReferences.References = args.ModelMap.Get( args.TestObject.HierarchicalReferences.NodeId.toString() );

    var searchDefinition_HierarchicalReferences = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "Controls" } )
        }
    ];
    FindReferencesVerifyingNamespaceIndex( args.TestObject.HierarchicalReferences.References.ReferenceDescriptions, searchDefinition_HierarchicalReferences, args.ModelMapHelper );
    if( isDefined( searchDefinition_HierarchicalReferences[0].ReferenceIndex ) ) {
        args.TestObject.HierarchicalReferences.Controls = new MonitoredItem( args.TestObject.HierarchicalReferences.References.ReferenceDescriptions[searchDefinition_HierarchicalReferences[0].ReferenceIndex].NodeId.NodeId );
        args.TestObject.HierarchicalReferences.Controls.References = args.ModelMap.Get( args.TestObject.HierarchicalReferences.Controls.NodeId.toString() );
    }
    
    // NonHierarchicalReferences
    args.TestObject.NonHierarchicalReferences = new MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.NonHierarchicalReferences ) ] )[0];
    args.TestObject.NonHierarchicalReferences.References = args.ModelMap.Get( args.TestObject.NonHierarchicalReferences.NodeId.toString() );

    var searchDefinition_NonHierarchicalReferences = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ToDataSetReader" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ToDataSetWriter" } )
        }
    ];
    FindReferencesVerifyingNamespaceIndex( args.TestObject.NonHierarchicalReferences.References.ReferenceDescriptions, searchDefinition_NonHierarchicalReferences, args.ModelMapHelper );
    if( isDefined( searchDefinition_NonHierarchicalReferences[0].ReferenceIndex ) ) {
        args.TestObject.NonHierarchicalReferences.ToDataSetReader = new MonitoredItem( args.TestObject.NonHierarchicalReferences.References.ReferenceDescriptions[searchDefinition_NonHierarchicalReferences[0].ReferenceIndex].NodeId.NodeId );
        args.TestObject.NonHierarchicalReferences.ToDataSetReader.References = args.ModelMap.Get( args.TestObject.NonHierarchicalReferences.ToDataSetReader.NodeId.toString() );
    }
    if( isDefined( searchDefinition_NonHierarchicalReferences[1].ReferenceIndex ) ) {
        args.TestObject.NonHierarchicalReferences.ToDataSetWriter = new MonitoredItem( args.TestObject.NonHierarchicalReferences.References.ReferenceDescriptions[searchDefinition_NonHierarchicalReferences[1].ReferenceIndex].NodeId.NodeId );
        args.TestObject.NonHierarchicalReferences.ToDataSetWriter.References = args.ModelMap.Get( args.TestObject.NonHierarchicalReferences.ToDataSetWriter.NodeId.toString() );
    }
    
    // ServerCapabilities
    args.TestObject.ServerCapabilities = new MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.Server_ServerCapabilities ) ] )[0];
    args.TestObject.ServerCapabilities.References = args.ModelMap.Get( args.TestObject.ServerCapabilities.NodeId.toString() );

    var searchDefinition_ServerCapabilities = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "MaxInactiveLockTime" } )
        }
    ];
    FindReferencesVerifyingNamespaceIndex( args.TestObject.ServerCapabilities.References.ReferenceDescriptions, searchDefinition_ServerCapabilities, args.ModelMapHelper );
    if( isDefined( searchDefinition_ServerCapabilities[0].ReferenceIndex ) ) {
        args.TestObject.ServerCapabilities.MaxInactiveLockTime = new MonitoredItem( args.TestObject.ServerCapabilities.References.ReferenceDescriptions[searchDefinition_ServerCapabilities[0].ReferenceIndex].NodeId.NodeId );
        args.TestObject.ServerCapabilities.MaxInactiveLockTime.References = args.ModelMap.Get( args.TestObject.ServerCapabilities.MaxInactiveLockTime.NodeId.toString() );
    }
    
    // Structure
    args.TestObject.Structure = new MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.Structure ) ] )[0];
    args.TestObject.Structure.References = args.ModelMap.Get( args.TestObject.Structure.NodeId.toString() );

    var searchDefinition_Structure = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ApplicationIdentifierDataType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "FxVersion" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "RelatedEndpointDataType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: 0, Name: "Union" } )
        }
    ];
    FindReferencesVerifyingNamespaceIndex( args.TestObject.Structure.References.ReferenceDescriptions, searchDefinition_Structure, args.ModelMapHelper );
    if( isDefined( searchDefinition_Structure[0].ReferenceIndex ) ) {
        args.TestObject.Structure.ApplicationIdentifierDataType = new MonitoredItem( args.TestObject.Structure.References.ReferenceDescriptions[searchDefinition_Structure[0].ReferenceIndex].NodeId.NodeId );
        args.TestObject.Structure.ApplicationIdentifierDataType.References = args.ModelMap.Get( args.TestObject.Structure.ApplicationIdentifierDataType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_Structure[1].ReferenceIndex ) ) {
        args.TestObject.Structure.FxVersion = new MonitoredItem( args.TestObject.Structure.References.ReferenceDescriptions[searchDefinition_Structure[1].ReferenceIndex].NodeId.NodeId );
        args.TestObject.Structure.FxVersion.References = args.ModelMap.Get( args.TestObject.Structure.FxVersion.NodeId.toString() );
    }
    if( isDefined( searchDefinition_Structure[2].ReferenceIndex ) ) {
        args.TestObject.Structure.RelatedEndpointDataType = new MonitoredItem( args.TestObject.Structure.References.ReferenceDescriptions[searchDefinition_Structure[2].ReferenceIndex].NodeId.NodeId );
        args.TestObject.Structure.RelatedEndpointDataType.References = args.ModelMap.Get( args.TestObject.Structure.RelatedEndpointDataType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_Structure[3].ReferenceIndex ) ) {
        args.TestObject.Structure.Union = new MonitoredItem( args.TestObject.Structure.References.ReferenceDescriptions[searchDefinition_Structure[3].ReferenceIndex].NodeId.NodeId );
        args.TestObject.Structure.Union.References = args.ModelMap.Get( args.TestObject.Structure.Union.NodeId.toString() );
        
        // Structure.Union
        var searchDefinition_Union = [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ApplicationId" } )
            }
        ];
        FindReferencesVerifyingNamespaceIndex( args.TestObject.Structure.Union.References.ReferenceDescriptions, searchDefinition_Union, args.ModelMapHelper );
        if( isDefined( searchDefinition_Union[0].ReferenceIndex ) ) {
            args.TestObject.Structure.Union.ApplicationId = new MonitoredItem( args.TestObject.Structure.Union.References.ReferenceDescriptions[searchDefinition_Union[0].ReferenceIndex].NodeId.NodeId );
            args.TestObject.Structure.Union.ApplicationId.References = args.ModelMap.Get( args.TestObject.Structure.Union.ApplicationId.NodeId.toString() );
        }
    }
    
    // UInt16
    args.TestObject.UInt16 = new MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.UInt16 ) ] )[0];
    args.TestObject.UInt16.References = args.ModelMap.Get( args.TestObject.UInt16.NodeId.toString() );

    var searchDefinition_UInt16 = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "CommHealthOptionSet" } )
        }
    ];
    FindReferencesVerifyingNamespaceIndex( args.TestObject.UInt16.References.ReferenceDescriptions, searchDefinition_UInt16, args.ModelMapHelper );
    if( isDefined( searchDefinition_UInt16[0].ReferenceIndex ) ) {
        args.TestObject.UInt16.CommHealthOptionSet = new MonitoredItem( args.TestObject.UInt16.References.ReferenceDescriptions[searchDefinition_UInt16[0].ReferenceIndex].NodeId.NodeId );
        args.TestObject.UInt16.CommHealthOptionSet.References = args.ModelMap.Get( args.TestObject.UInt16.CommHealthOptionSet.NodeId.toString() );
    }
    
    // UInt32
    args.TestObject.UInt32 = new MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.UInt32 ) ] )[0];
    args.TestObject.UInt32.References = args.ModelMap.Get( args.TestObject.UInt32.NodeId.toString() );

    var searchDefinition_UInt32 = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "OperationalHealthOptionSet" } )
        }
    ];
    FindReferencesVerifyingNamespaceIndex( args.TestObject.UInt32.References.ReferenceDescriptions, searchDefinition_UInt32, args.ModelMapHelper );
    if( isDefined( searchDefinition_UInt32[0].ReferenceIndex ) ) {
        args.TestObject.UInt32.OperationalHealthOptionSet = new MonitoredItem( args.TestObject.UInt32.References.ReferenceDescriptions[searchDefinition_UInt32[0].ReferenceIndex].NodeId.NodeId );
        args.TestObject.UInt32.OperationalHealthOptionSet.References = args.ModelMap.Get( args.TestObject.UInt32.OperationalHealthOptionSet.NodeId.toString() );
    }
    
    if( !args.SkipAutomationComponent ) {
        if( !isDefined( args.TestObject.BaseObjectType.AutomationComponentType ) ) {
            addError( "Server is missing AutomationComponentType. Aborting initialization." );
            return( false );
        }
        var allAutomationComponents = FindAndInitializeAllNodesOfType( { Type: args.TestObject.BaseObjectType.AutomationComponentType } );
        if( allAutomationComponents.length == 0 ) {
            addError( "No AutomationComponentType instance found in AddressSpace of the server. Aborting initialization." );
            return( false );
        }
        else addLog( "Found " + allAutomationComponents.length + " AutomationComponents in AddressSpace" );
        
        // AutomationComponents
        args.TestObject.AutomationComponents = [];
        for( var ac=0; ac<allAutomationComponents.length; ac++ ) {
            args.TestObject.AutomationComponents[ac] = new MonitoredItem( allAutomationComponents[ac].NodeId );
            args.TestObject.AutomationComponents[ac].References = args.ModelMap.Get( args.TestObject.AutomationComponents[ac].NodeId.toString() );
            
            var searchDefinition = [
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Assets" } )
                },
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "EstablishConnections" } )
                },
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "FunctionalEntities" } )
                },
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "CloseConnections" } )
                },
                {
                    ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                    IsForward: true,
                    BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ComponentCapabilities" } )
                }
            ];
            FindReferencesVerifyingNamespaceIndex( args.TestObject.AutomationComponents[ac].References.ReferenceDescriptions, searchDefinition, args.ModelMapHelper );
            if( isDefined( searchDefinition[0].ReferenceIndex ) ) {
                args.TestObject.AutomationComponents[ac].Assets = new MonitoredItem( args.TestObject.AutomationComponents[ac].References.ReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId );
                args.TestObject.AutomationComponents[ac].Assets.References = args.ModelMap.Get( args.TestObject.AutomationComponents[ac].Assets.NodeId.toString() );
                
                // AllTopLevelAssets[]
                args.TestObject.AutomationComponents[ac].Assets.AllTopLevelAssets = FindAndInitializeAllTopLevelAssets( args.TestObject.AutomationComponents[ac].Assets.References.ReferenceDescriptions, args.ModelMap, args.ModelMapHelper, args.TestObject.BaseObjectType.FxAssetType );
                if( args.TestObject.AutomationComponents[ac].Assets.AllTopLevelAssets.length == 0 ) _log.store( "No top level Assets found in AutomationComponent '" + args.TestObject.AutomationComponents[ac].NodeId + "'. At least one is required." );
            }
            
            if( isDefined( searchDefinition[1].ReferenceIndex ) ) {
                args.TestObject.AutomationComponents[ac].EstablishConnections = new MonitoredItem( args.TestObject.AutomationComponents[ac].References.ReferenceDescriptions[searchDefinition[1].ReferenceIndex].NodeId.NodeId );
                args.TestObject.AutomationComponents[ac].EstablishConnections.References = args.ModelMap.Get( args.TestObject.AutomationComponents[ac].EstablishConnections.NodeId.toString() );
            }
            
            if( isDefined( searchDefinition[2].ReferenceIndex ) ) {
                args.TestObject.AutomationComponents[ac].FunctionalEntities = new MonitoredItem( args.TestObject.AutomationComponents[ac].References.ReferenceDescriptions[searchDefinition[2].ReferenceIndex].NodeId.NodeId );
                args.TestObject.AutomationComponents[ac].FunctionalEntities.References = args.ModelMap.Get( args.TestObject.AutomationComponents[ac].FunctionalEntities.NodeId.toString() );
                
                // AllTopLevelFunctionalEntities[]
                if( isDefined( args.TestObject.BaseObjectType.FunctionalEntityType ) ) {
                    args.TestObject.AutomationComponents[ac].FunctionalEntities.AllTopLevelFunctionalEntities = FindAndInitializeAllTopLevelFunctionalEntities( args.TestObject.AutomationComponents[ac].FunctionalEntities.References.ReferenceDescriptions, args.ModelMap, args.ModelMapHelper, args.TestObject.BaseObjectType.FunctionalEntityType );
                }
                else {
                    args.TestObject.AutomationComponents[ac].FunctionalEntities.AllTopLevelFunctionalEntities = [];
                    _warning.store( "Could not find TypeDefinition for FunctionalEntityType in the server, therefore no FunctionalEntities can be found." );
                }
            }
            
            if( isDefined( searchDefinition[3].ReferenceIndex ) ) {
                args.TestObject.AutomationComponents[ac].CloseConnections = new MonitoredItem( args.TestObject.AutomationComponents[ac].References.ReferenceDescriptions[searchDefinition[3].ReferenceIndex].NodeId.NodeId );
                args.TestObject.AutomationComponents[ac].CloseConnections.References = args.ModelMap.Get( args.TestObject.AutomationComponents[ac].CloseConnections.NodeId.toString() );
            }
            if( isDefined( searchDefinition[4].ReferenceIndex ) ) {
                args.TestObject.AutomationComponents[ac].ComponentCapabilities = new MonitoredItem( args.TestObject.AutomationComponents[ac].References.ReferenceDescriptions[searchDefinition[4].ReferenceIndex].NodeId.NodeId );
                args.TestObject.AutomationComponents[ac].ComponentCapabilities.References = args.ModelMap.Get( args.TestObject.AutomationComponents[ac].ComponentCapabilities.NodeId.toString() );
                
                // AutomationComponent.ComponentCapabilities
                var searchDefinition_ComponentCapabilities = [
                    {
                        ReferenceTypeId: args.TestObject.HasComponent.HasCapability.NodeId,
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "SupportsPersistence" } )
                    },
                    {
                        ReferenceTypeId: args.TestObject.HasComponent.HasCapability.NodeId,
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "MaxFunctionalEntities" } )
                    },
                    {
                        ReferenceTypeId: args.TestObject.HasComponent.HasCapability.NodeId,
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "MaxConnections" } )
                    },
                    {
                        ReferenceTypeId: args.TestObject.HasComponent.HasCapability.NodeId,
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "MaxConnectionsPerCall" } )
                    },
                    {
                        ReferenceTypeId: args.TestObject.HasComponent.HasCapability.NodeId,
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "CommandBundleRequired" } )
                    }
                ];
                FindReferencesVerifyingNamespaceIndex( args.TestObject.AutomationComponents[ac].ComponentCapabilities.References.ReferenceDescriptions, searchDefinition_ComponentCapabilities, args.ModelMapHelper );
                if( isDefined( searchDefinition_ComponentCapabilities[0].ReferenceIndex ) ) {
                    args.TestObject.AutomationComponents[ac].ComponentCapabilities.SupportsPersistence = new MonitoredItem( args.TestObject.AutomationComponents[ac].ComponentCapabilities.References.ReferenceDescriptions[searchDefinition_ComponentCapabilities[0].ReferenceIndex].NodeId.NodeId );
                    args.TestObject.AutomationComponents[ac].ComponentCapabilities.SupportsPersistence.References = args.ModelMap.Get( args.TestObject.AutomationComponents[ac].ComponentCapabilities.SupportsPersistence.NodeId.toString() );
                }
                if( isDefined( searchDefinition_ComponentCapabilities[1].ReferenceIndex ) ) {
                    args.TestObject.AutomationComponents[ac].ComponentCapabilities.MaxFunctionalEntities = new MonitoredItem( args.TestObject.AutomationComponents[ac].ComponentCapabilities.References.ReferenceDescriptions[searchDefinition_ComponentCapabilities[1].ReferenceIndex].NodeId.NodeId );
                    args.TestObject.AutomationComponents[ac].ComponentCapabilities.MaxFunctionalEntities.References = args.ModelMap.Get( args.TestObject.AutomationComponents[ac].ComponentCapabilities.MaxFunctionalEntities.NodeId.toString() );
                }
                if( isDefined( searchDefinition_ComponentCapabilities[2].ReferenceIndex ) ) {
                    args.TestObject.AutomationComponents[ac].ComponentCapabilities.MaxConnections = new MonitoredItem( args.TestObject.AutomationComponents[ac].ComponentCapabilities.References.ReferenceDescriptions[searchDefinition_ComponentCapabilities[2].ReferenceIndex].NodeId.NodeId );
                    args.TestObject.AutomationComponents[ac].ComponentCapabilities.MaxConnections.References = args.ModelMap.Get( args.TestObject.AutomationComponents[ac].ComponentCapabilities.MaxConnections.NodeId.toString() );
                }
                if( isDefined( searchDefinition_ComponentCapabilities[3].ReferenceIndex ) ) {
                    args.TestObject.AutomationComponents[ac].ComponentCapabilities.MaxConnectionsPerCall = new MonitoredItem( args.TestObject.AutomationComponents[ac].ComponentCapabilities.References.ReferenceDescriptions[searchDefinition_ComponentCapabilities[3].ReferenceIndex].NodeId.NodeId );
                    args.TestObject.AutomationComponents[ac].ComponentCapabilities.MaxConnectionsPerCall.References = args.ModelMap.Get( args.TestObject.AutomationComponents[ac].ComponentCapabilities.MaxConnectionsPerCall.NodeId.toString() );
                }
                if( isDefined( searchDefinition_ComponentCapabilities[4].ReferenceIndex ) ) {
                    args.TestObject.AutomationComponents[ac].ComponentCapabilities.CommandBundleRequired = new MonitoredItem( args.TestObject.AutomationComponents[ac].ComponentCapabilities.References.ReferenceDescriptions[searchDefinition_ComponentCapabilities[4].ReferenceIndex].NodeId.NodeId );
                    args.TestObject.AutomationComponents[ac].ComponentCapabilities.CommandBundleRequired.References = args.ModelMap.Get( args.TestObject.AutomationComponents[ac].ComponentCapabilities.CommandBundleRequired.NodeId.toString() );
                }
            }
        }
    }
    
    return( true );
}

if( !initializeStandardVariables( { TestObject: UAFXBaseVariables, SkipAutomationComponent: true } ) ) addError( "Error while initializing UAFX Base variables" );
     
/**
 * Function calls FindReferences() of the BuildLocalCacheMapService(),
 * but trying every NamespaceIndex in the NamespaceArray, if references could not
 * be found initially with the expected NamespaceIndex, printing a warning if they
 * could be found on an unexpected one instead.
 * 
 * @param {object[]} referenceDescriptions - Array of referenceDescriptions, typically from a specific model object
 * @param {object} searchDefinitions - Parameters that should match for a reference description to considered a match.
 * @param {function} modelMapHelper - ModelMapHelper to use
 * @param {boolean} suppressMessages - (Optional) Set to true to suppress warnings if a node was found on an unexpected NamespaceIndex (default=false)
 * 
 * @returns {boolean} Returns True
 */
function FindReferencesVerifyingNamespaceIndex( referenceDescriptions, searchDefinitions, modelMapHelper, suppressMessages ) {
    if( !isDefined( suppressMessages ) ) suppressMessages = UAFXBaseVariables.suppressNamespaceWarnings;
    // initialize arrays
    var expectedNamespaces = [];
    var actualNamespaces = [];
    for( var i=0; i < searchDefinitions.length; i++ ) {
        expectedNamespaces[i] = searchDefinitions[i].BrowseName.NamespaceIndex;
        actualNamespaces[i] = null;
    }
    // call FindReferences once and check if references are missing
    modelMapHelper.FindReferences( referenceDescriptions, searchDefinitions );
    var referenceMissing = false;
    for( var i=0; i < searchDefinitions.length; i++ ) {
        if( !isDefined( searchDefinitions[i].ReferenceIndex ) ) referenceMissing = true;
        else actualNamespaces[i] = searchDefinitions[i].BrowseName.NamespaceIndex;
    }
    // if references are missing, try to call FindReferences for every NamespaceIndex defined in the NamespaceArray of the server
    var n=0;
    while( referenceMissing && n < UAFXBaseVariables.NamespaceArrayLength ) {
        referenceMissing = false;
        // set NamespaceIndex on every missing reference to n and call FindReferences
        for( var i=0; i < searchDefinitions.length; i++ ) if( actualNamespaces[i] == null ) searchDefinitions[i].BrowseName.NamespaceIndex = n;
        modelMapHelper.FindReferences( referenceDescriptions, searchDefinitions );
        // check again if references are still missing
        for( var i=0; i < searchDefinitions.length; i++ ) {
            if( !isDefined( searchDefinitions[i].ReferenceIndex ) ) referenceMissing = true;
            else actualNamespaces[i] = searchDefinitions[i].BrowseName.NamespaceIndex;
        }
        n++;
    }
    // print a warning for every reference found on an unexpected NamespaceIndex
    for( var i=0; i < searchDefinitions.length; i++ ) {
        if( actualNamespaces[i] != null && expectedNamespaces[i] != actualNamespaces[i] && !suppressMessages ) addWarning( "Browsed Node '" + referenceDescriptions[searchDefinitions[i].ReferenceIndex].NodeId.NodeId + "' ('" + searchDefinitions[i].BrowseName.Name + "') was found on unexpected NamespaceIndex.\nExpected NamespaceIndex: " + ( expectedNamespaces[i] == -1 ? "[NOT FOUND]" : expectedNamespaces[i] ) + ". Actual NamespaceIndex: " + actualNamespaces[i] );
    }
    return( true );
}

/**
 * Checks if a Node meets the criteria of an UAFX Asset
 * 
 * @param {MonitoredItem} mI - The item to check
 * @param {MonitoredItem|UaNodeId} fxAssetType - FxAssetType node in the server to check against
 * 
 * @returns {boolean} Returns True if the given node meets the criteria of an UAFX Asset
 */
function isAsset( mI, fxAssetType ) {
    if( !isDefined( mI ) ) throw( "isAsset(mI): No MonitoredItem defined" );
    if( !isDefined( mI.NodeId ) ) throw( "isAsset(mI): Passed object appears to not be of type MonitoredItem" );
        
    // Node shall be an object
    if( GetNodeClassOfNodeByNodeId( mI.NodeId ) != NodeClass.Object ) return false;
    
    // Check if node is of FxAssetType or a subtype of it. True = Object is an Asset
    if( isDefined( fxAssetType ) && isNodeOfTypeOrSubType( mI, fxAssetType ) ) return true;
    
    // If not, check if HasInterface References to the IVendorNameplateType, ITagNameplateType, IDeviceHealthType and IAssetRevisionType are exposed
    var HasInterface_IVendorNameplateType = CheckHasReferenceTo( { 
        Node: mI,
        Name: "IVendorNameplateType",
        ReferenceTypeId: new UaNodeId( Identifier.HasInterface ),
        SuppressMessages: true 
    } );
    var HasInterface_ITagNameplateType = CheckHasReferenceTo( { 
        Node: mI,
        Name: "ITagNameplateType",
        ReferenceTypeId: new UaNodeId( Identifier.HasInterface ),
        SuppressMessages: true 
    } );
    var HasInterface_IDeviceHealthType = CheckHasReferenceTo( { 
        Node: mI,
        Name: "IDeviceHealthType",
        ReferenceTypeId: new UaNodeId( Identifier.HasInterface ),
        SuppressMessages: true 
    } );
    var HasInterface_IAssetRevisionType = CheckHasReferenceTo( { 
        Node: mI,
        Name: "IAssetRevisionType",
        ReferenceTypeId: new UaNodeId( Identifier.HasInterface ),
        SuppressMessages: true 
    } );
    
    // if every reference is exposed, node is an Asset
    if( 
        HasInterface_IVendorNameplateType != false &&
        HasInterface_ITagNameplateType != false &&
        HasInterface_IDeviceHealthType != false &&
        HasInterface_IAssetRevisionType != false
    ) return true;
    
    // if not, check if a Type in the TypeHierarchy has all needed Interface references
    if( _isSubTypeOfAnAssetType( GetTypeDefinitionOfNode( mI ) ) ) return true;
    
    // else it is not an asset
    return false;
}

/**
 * Recursively checks if a type node or one of those in its hierarchy is exposing
 * HasInterface references for IVendorNameplateType, ITagNameplateType, IDeviceHealthType and IAssetRevisionType
 * 
 * @param {UaNodeId} typeNodeId - The NodeId of the type to check
 * 
 * @returns {boolean} Returns True if the given type or one in its hierarchy is exposing all interfaces
 */
function _isSubTypeOfAnAssetType( typeNodeId ) {
    var neededInterfaces = [ 
        "IVendorNameplateType", "ITagNameplateType",
        "IDeviceHealthType", "IAssetRevisionType"
    ];
    
    if( isDefined( typeNodeId ) ) {
        var typeNodeId_mI = new MonitoredItem( typeNodeId );
        for( var n=0; n<neededInterfaces.length; n++ ) {
            var hasInterfaceRef = CheckHasReferenceTo( { 
                Node: typeNodeId_mI,
                Name: neededInterfaces[n],
                ReferenceTypeId: new UaNodeId( Identifier.HasInterface ),
                SuppressMessages: true 
            } );
            // if an interface is missing, check parent type
            if( hasInterfaceRef == false ) {
                var parentType = GetParentNode( typeNodeId_mI );
                if( !parentType.NodeId.equals( new UaNodeId() ) ) {
                    if( _isSubTypeOfAnAssetType( parentType.NodeId ) ) return true;
                }
                return false;
            }
        }
        // all interfaces found
        return true;
    }
    return false;
}

// Finds all nodes fitting the description of an FxAsset and initializes the standard variables
function FindAndInitializeAllTopLevelAssets( refDescriptions, modelMap, modelMapHelper, fxAssetType ) {
    var results = [];
    // iterate through every reference
    for( var i=0; i < refDescriptions.length; i++ ) {
        // if node is an asset, initialize and push into results
        if( isAsset( new MonitoredItem( refDescriptions[i].NodeId.NodeId ), fxAssetType ) ) {
            var item = new MonitoredItem( refDescriptions[i].NodeId.NodeId );
            item.References = modelMap.Get( item.NodeId.toString() );
            
                // initialize properties of found FxAssetType item
                var searchDefinition = [
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "AssetId" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "BuildAssetNumber" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "ComponentName" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "DeviceClass" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "DeviceManual" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "DeviceRevision" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "HardwareRevision" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "MajorAssetVersion" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "Manufacturer" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "ManufacturerUri" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "MinorAssetVersion" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "Model" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "ProductCode" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "ProductInstanceUri" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "RevisionCounter" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "SerialNumber" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.DINamespaceIndex, Name: "SoftwareRevision" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "SubBuildAssetNumber" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "VerifyAsset" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Connectors" } )
                    }
                ];
                FindReferencesVerifyingNamespaceIndex( item.References.ReferenceDescriptions, searchDefinition, modelMapHelper );
                if( isDefined( searchDefinition[0].ReferenceIndex ) ) {
                    item.AssetId = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId );
                    item.AssetId.References = modelMap.Get( item.AssetId.NodeId.toString() );
                }
                if( isDefined( searchDefinition[1].ReferenceIndex ) ) {
                    item.BuildAssetNumber = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[1].ReferenceIndex].NodeId.NodeId );
                    item.BuildAssetNumber.References = modelMap.Get( item.BuildAssetNumber.NodeId.toString() );
                }
                if( isDefined( searchDefinition[2].ReferenceIndex ) ) {
                    item.ComponentName = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[2].ReferenceIndex].NodeId.NodeId );
                    item.ComponentName.References = modelMap.Get( item.ComponentName.NodeId.toString() );
                }
                if( isDefined( searchDefinition[3].ReferenceIndex ) ) {
                    item.DeviceClass = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[3].ReferenceIndex].NodeId.NodeId );
                    item.DeviceClass.References = modelMap.Get( item.DeviceClass.NodeId.toString() );
                }
                if( isDefined( searchDefinition[4].ReferenceIndex ) ) {
                    item.DeviceManual = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[4].ReferenceIndex].NodeId.NodeId );
                    item.DeviceManual.References = modelMap.Get( item.DeviceManual.NodeId.toString() );
                }
                if( isDefined( searchDefinition[5].ReferenceIndex ) ) {
                    item.DeviceRevision = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[5].ReferenceIndex].NodeId.NodeId );
                    item.DeviceRevision.References = modelMap.Get( item.DeviceRevision.NodeId.toString() );
                }
                if( isDefined( searchDefinition[6].ReferenceIndex ) ) {
                    item.HardwareRevision = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[6].ReferenceIndex].NodeId.NodeId );
                    item.HardwareRevision.References = modelMap.Get( item.HardwareRevision.NodeId.toString() );
                }
                if( isDefined( searchDefinition[7].ReferenceIndex ) ) {
                    item.MajorAssetVersion = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[7].ReferenceIndex].NodeId.NodeId );
                    item.MajorAssetVersion.References = modelMap.Get( item.MajorAssetVersion.NodeId.toString() );
                }
                if( isDefined( searchDefinition[8].ReferenceIndex ) ) {
                    item.Manufacturer = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[8].ReferenceIndex].NodeId.NodeId );
                    item.Manufacturer.References = modelMap.Get( item.Manufacturer.NodeId.toString() );
                }
                if( isDefined( searchDefinition[9].ReferenceIndex ) ) {
                    item.ManufacturerUri = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[9].ReferenceIndex].NodeId.NodeId );
                    item.ManufacturerUri.References = modelMap.Get( item.ManufacturerUri.NodeId.toString() );
                }
                if( isDefined( searchDefinition[10].ReferenceIndex ) ) {
                    item.MinorAssetVersion = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[10].ReferenceIndex].NodeId.NodeId );
                    item.MinorAssetVersion.References = modelMap.Get( item.MinorAssetVersion.NodeId.toString() );
                }
                if( isDefined( searchDefinition[11].ReferenceIndex ) ) {
                    item.Model = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[11].ReferenceIndex].NodeId.NodeId );
                    item.Model.References = modelMap.Get( item.Model.NodeId.toString() );
                }
                if( isDefined( searchDefinition[12].ReferenceIndex ) ) {
                    item.ProductCode = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[12].ReferenceIndex].NodeId.NodeId );
                    item.ProductCode.References = modelMap.Get( item.ProductCode.NodeId.toString() );
                }
                if( isDefined( searchDefinition[13].ReferenceIndex ) ) {
                    item.ProductInstanceUri = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[13].ReferenceIndex].NodeId.NodeId );
                    item.ProductInstanceUri.References = modelMap.Get( item.ProductInstanceUri.NodeId.toString() );
                }
                if( isDefined( searchDefinition[14].ReferenceIndex ) ) {
                    item.RevisionCounter = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[14].ReferenceIndex].NodeId.NodeId );
                    item.RevisionCounter.References = modelMap.Get( item.RevisionCounter.NodeId.toString() );
                }
                if( isDefined( searchDefinition[15].ReferenceIndex ) ) {
                    item.SerialNumber = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[15].ReferenceIndex].NodeId.NodeId );
                    item.SerialNumber.References = modelMap.Get( item.SerialNumber.NodeId.toString() );
                }
                if( isDefined( searchDefinition[16].ReferenceIndex ) ) {
                    item.SoftwareRevision = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[16].ReferenceIndex].NodeId.NodeId );
                    item.SoftwareRevision.References = modelMap.Get( item.SoftwareRevision.NodeId.toString() );
                }
                if( isDefined( searchDefinition[17].ReferenceIndex ) ) {
                    item.SubBuildAssetNumber = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[17].ReferenceIndex].NodeId.NodeId );
                    item.SubBuildAssetNumber.References = modelMap.Get( item.SubBuildAssetNumber.NodeId.toString() );
                }
                if( isDefined( searchDefinition[18].ReferenceIndex ) ) {
                    item.VerifyAsset = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[18].ReferenceIndex].NodeId.NodeId );
                    item.VerifyAsset.References = modelMap.Get( item.VerifyAsset.NodeId.toString() );
                    
                    // initialize properties of found VerifyAsset method
                    var searchDefinition_VerifyAsset = [
                        {
                            ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                            IsForward: true,
                            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.UANamespaceIndex, Name: "InputArguments" } )
                        },
                        {
                            ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                            IsForward: true,
                            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.UANamespaceIndex, Name: "OutputArguments" } )
                        }
                    ];
                    FindReferencesVerifyingNamespaceIndex( item.VerifyAsset.References.ReferenceDescriptions, searchDefinition_VerifyAsset, modelMapHelper );
                    if( isDefined( searchDefinition_VerifyAsset[0].ReferenceIndex ) ) {
                        item.VerifyAsset.InputArguments = new MonitoredItem( item.VerifyAsset.References.ReferenceDescriptions[searchDefinition_VerifyAsset[0].ReferenceIndex].NodeId.NodeId );
                        item.VerifyAsset.InputArguments.References = modelMap.Get( item.VerifyAsset.InputArguments.NodeId.toString() );
                    }
                    if( isDefined( searchDefinition_VerifyAsset[1].ReferenceIndex ) ) {
                        item.VerifyAsset.OutputArguments = new MonitoredItem( item.VerifyAsset.References.ReferenceDescriptions[searchDefinition_VerifyAsset[1].ReferenceIndex].NodeId.NodeId );
                        item.VerifyAsset.OutputArguments.References = modelMap.Get( item.VerifyAsset.OutputArguments.NodeId.toString() );
                    }
                    
                }
                if( isDefined( searchDefinition[19].ReferenceIndex ) ) {
                    item.Connectors = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[19].ReferenceIndex].NodeId.NodeId );
                    item.Connectors.References = modelMap.Get( item.Connectors.NodeId.toString() );
                }
            // push initialized FxAssetType item into results
            results.push( item );
        }
    }
    return( results );
}

// Finds all nodes of FunctionalEntityType and initializes the standard variables
function FindAndInitializeAllTopLevelFunctionalEntities( refDescriptions, modelMap, modelMapHelper, functionalEntityType ) {
    var results = [];
    // iterate through every reference
    for( var i=0; i < refDescriptions.length; i++ ) {
        // if node is of FunctionalEntityType or a subtype, initialize and push into results
        if( isNodeOfTypeOrSubType( new MonitoredItem( refDescriptions[i].NodeId.NodeId ), functionalEntityType ) ) {
            var item = new MonitoredItem( refDescriptions[i].NodeId.NodeId );
            item.References = modelMap.Get( item.NodeId.toString() );
            
                // initialize components and properties of found FunctionalEntityType item
                var searchDefinition = [
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "AuthorUri" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "AuthorAssignedIdentifier" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "AuthorAssignedVersion" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ApplicationIdentifier" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ConfigurationData" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ConnectionEndpoints" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ControlGroups" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "InputData" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "OutputData" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "PublisherCapabilities" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "SubscriberCapabilities" } )
                    },
                    {
                        ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                        IsForward: true,
                        BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "Verify" } )
                    }
                ];
                FindReferencesVerifyingNamespaceIndex( item.References.ReferenceDescriptions, searchDefinition, modelMapHelper );
                if( isDefined( searchDefinition[0].ReferenceIndex ) ) {
                    item.AuthorUri = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[0].ReferenceIndex].NodeId.NodeId );
                    item.AuthorUri.References = modelMap.Get( item.AuthorUri.NodeId.toString() );
                }
                if( isDefined( searchDefinition[1].ReferenceIndex ) ) {
                    item.AuthorAssignedIdentifier = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[1].ReferenceIndex].NodeId.NodeId );
                    item.AuthorAssignedIdentifier.References = modelMap.Get( item.AuthorAssignedIdentifier.NodeId.toString() );
                }
                if( isDefined( searchDefinition[2].ReferenceIndex ) ) {
                    item.AuthorAssignedVersion = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[2].ReferenceIndex].NodeId.NodeId );
                    item.AuthorAssignedVersion.References = modelMap.Get( item.AuthorAssignedVersion.NodeId.toString() );
                }
                if( isDefined( searchDefinition[3].ReferenceIndex ) ) {
                    item.ApplicationIdentifier = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[3].ReferenceIndex].NodeId.NodeId );
                    item.ApplicationIdentifier.References = modelMap.Get( item.ApplicationIdentifier.NodeId.toString() );
                }
                if( isDefined( searchDefinition[4].ReferenceIndex ) ) {
                    item.ConfigurationData = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[4].ReferenceIndex].NodeId.NodeId );
                    item.ConfigurationData.References = modelMap.Get( item.ConfigurationData.NodeId.toString() );
                }
                if( isDefined( searchDefinition[5].ReferenceIndex ) ) {
                    item.ConnectionEndpoints = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[5].ReferenceIndex].NodeId.NodeId );
                    item.ConnectionEndpoints.References = modelMap.Get( item.ConnectionEndpoints.NodeId.toString() );
                    
                    // ConnectionEndpoints
                    var searchDefinition_ConnectionEndpoints = [
                        {
                            ReferenceTypeId: new UaNodeId( Identifier.HasComponent ),
                            IsForward: true,
                            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "CommHealth" } )
                        }
                    ];
                    FindReferencesVerifyingNamespaceIndex( item.ConnectionEndpoints.References.ReferenceDescriptions, searchDefinition_ConnectionEndpoints, modelMapHelper );
                    if( isDefined( searchDefinition_ConnectionEndpoints[0].ReferenceIndex ) ) {
                        item.ConnectionEndpoints.CommHealth = new MonitoredItem( item.ConnectionEndpoints.References.ReferenceDescriptions[searchDefinition_ConnectionEndpoints[0].ReferenceIndex].NodeId.NodeId );
                        item.ConnectionEndpoints.CommHealth.References = modelMap.Get( item.ConnectionEndpoints.CommHealth.NodeId.toString() );
                    }
                    
                }
                if( isDefined( searchDefinition[6].ReferenceIndex ) ) {
                    item.ControlGroups = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[6].ReferenceIndex].NodeId.NodeId );
                    item.ControlGroups.References = modelMap.Get( item.ControlGroups.NodeId.toString() );
                }
                if( isDefined( searchDefinition[7].ReferenceIndex ) ) {
                    item.InputData = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[7].ReferenceIndex].NodeId.NodeId );
                    item.InputData.References = modelMap.Get( item.InputData.NodeId.toString() );
                }
                if( isDefined( searchDefinition[8].ReferenceIndex ) ) {
                    item.OutputData = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[8].ReferenceIndex].NodeId.NodeId );
                    item.OutputData.References = modelMap.Get( item.OutputData.NodeId.toString() );
                }
                if( isDefined( searchDefinition[9].ReferenceIndex ) ) {
                    item.PublisherCapabilities = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[9].ReferenceIndex].NodeId.NodeId );
                    item.PublisherCapabilities.References = modelMap.Get( item.PublisherCapabilities.NodeId.toString() );
                }
                if( isDefined( searchDefinition[10].ReferenceIndex ) ) {
                    item.SubscriberCapabilities = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[10].ReferenceIndex].NodeId.NodeId );
                    item.SubscriberCapabilities.References = modelMap.Get( item.SubscriberCapabilities.NodeId.toString() );
                }
                if( isDefined( searchDefinition[11].ReferenceIndex ) ) {
                    item.Verify = new MonitoredItem( item.References.ReferenceDescriptions[searchDefinition[11].ReferenceIndex].NodeId.NodeId );
                    item.Verify.References = modelMap.Get( item.Verify.NodeId.toString() );
                    
                    // initialize properties of found Verify method
                    var searchDefinition_Verify = [
                        {
                            ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                            IsForward: true,
                            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.UANamespaceIndex, Name: "InputArguments" } )
                        },
                        {
                            ReferenceTypeId: new UaNodeId( Identifier.HasProperty ),
                            IsForward: true,
                            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.UANamespaceIndex, Name: "OutputArguments" } )
                        }
                    ];
                    FindReferencesVerifyingNamespaceIndex( item.Verify.References.ReferenceDescriptions, searchDefinition_Verify, modelMapHelper );
                    if( isDefined( searchDefinition_Verify[0].ReferenceIndex ) ) {
                        item.Verify.InputArguments = new MonitoredItem( item.Verify.References.ReferenceDescriptions[searchDefinition_Verify[0].ReferenceIndex].NodeId.NodeId );
                        item.Verify.InputArguments.References = modelMap.Get( item.Verify.InputArguments.NodeId.toString() );
                    }
                    if( isDefined( searchDefinition_Verify[1].ReferenceIndex ) ) {
                        item.Verify.OutputArguments = new MonitoredItem( item.Verify.References.ReferenceDescriptions[searchDefinition_Verify[1].ReferenceIndex].NodeId.NodeId );
                        item.Verify.OutputArguments.References = modelMap.Get( item.Verify.OutputArguments.NodeId.toString() );
                    }
                }
            // push initialized FunctionalEntityType item into results
            results.push( item );
        }
    }
    return( results );
}

/**
 * Function reads all ExpectedVerificationVariables of an asset and checks if mandatory and
 * configured supported optional variables are available given a certain verification mode
 * 
 * @param {object} args - An object containing all parameters
 * @param {MonitoredItem} args.Asset - A MonitoredItem of the asset to use
 * @param {Number} args.VerificationMode - (Optional) The Index of the VerificationMode. 0: AssetCompatibility, 1: AssetIdentity, 2: AssetIdentityAndCompatibility (default=0)
 * @param {boolean} args.SuppressWarnings - (Optional) Set to true to suppress warnings if a node was not found but expected according to the VerificationMode (default=false)
 * 
 * @returns {object} Returns an object containing the variables with the received values
 */
function readSupportedExpectedVerificationVariables( args ) {
    if( !isDefined( args ) || args.length < 1 ) throw( "readSupportedExpectedVerificationVariables(): No args specified" );
    if( !isDefined( args.Asset ) ) throw( "readSupportedExpectedVerificationVariables(): No Asset specified" );
    if( !isDefined( args.VerificationMode ) ) args.VerificationMode = 0;
    if( !isDefined( args.SuppressWarnings ) ) args.SuppressWarnings = false;
    if( args.VerificationMode < 0 || args.VerificationMode > 2 ) throw( "readSupportedExpectedVerificationVariables(): Invalid VerificationMode. Accepted values are 0, 1 and 2" );
    var results = new Object();
    results.result = new UaKeyValuePairs();
    results.variablesMissing = false;
    var variablesToRead = [ "ManufacturerUri", "ProductCode", "MajorAssetVersion", "MinorAssetVersion",
                            "BuildAssetNumber", "SubBuildAssetNumber", "HardwareRevision", "SoftwareRevision",
                            "SerialNumber", "ProductInstanceUri" ];
    var verificationModeMask = [ 
                                 [ true, true, true, true, true, true, true, true, false, false ],
                                 [ true, true, false, false, false, false, false, false, true, true ],
                                 [ true, true, true, true, true, true, true, true, true, true ]
                               ];
    var serialNumberOrProductInstanceUriFound = false;
    for( var i=0; i<variablesToRead.length; i++ ) {
        if( verificationModeMask[ args.VerificationMode ][i] ) {
            if( isDefined( args.Asset[ variablesToRead[i] ] ) ) {
                var keyValuePair = new UaKeyValuePair();
                // Get the BrowseName and store it as Key of the new KeyValuePair
                args.Asset[ variablesToRead[i] ].AttributeId = Attribute.BrowseName;
                ReadHelper.Execute( { NodesToRead: [ args.Asset[ variablesToRead[i] ] ], OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNodeIdUnknown ] ) } );
                keyValuePair.Key = args.Asset[ variablesToRead[i] ].Value.Value.toQualifiedName();
                // Get the Value and store it as Value of the new KeyValuePair
                args.Asset[ variablesToRead[i] ].AttributeId = Attribute.Value;
                ReadHelper.Execute( { NodesToRead: [ args.Asset[ variablesToRead[i] ] ], OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNodeIdUnknown ] ) } );
                keyValuePair.Value = args.Asset[ variablesToRead[i] ].Value.Value;
                // Add the KeyValuePair to the Results
                results.result[results.result.length] = keyValuePair;
                if( i>7 ) serialNumberOrProductInstanceUriFound = true;
            }
            else if( !args.SuppressWarnings ) {
                if( i<4 ) {
                    addWarning( "Mandatory variable '" + variablesToRead[i] + "' not found in Asset '" + args.Asset.NodeId + "', but it is needed for VerificationMode '" + AssetVerificationMode_Names[args.VerificationMode] + "'." );
                    results.variablesMissing = true;
                }
                else addLog( "Optional variable '" + variablesToRead[i] + "' not found in Asset '" + args.Asset.NodeId + "'. Assuming that it is not supported." );
            }
        }
    }
    // if VerificationMode is AssetIdentity(1) or AssetIdentityAndCompatibility(2), check if at least SerialNumber or ProductInstanceUri was found
    if( args.VerificationMode > 0 && !serialNumberOrProductInstanceUriFound && !args.SuppressWarnings ) { addWarning( "Both variables 'SerialNumber' and 'ProductInstanceUri' not found in Asset '" + args.Asset.NodeId + "' or not configured supported in settings. At least one shall be defined for VerificationMode '" + AssetVerificationMode_Names[args.VerificationMode] + "'." ); results.variablesMissing = true; }
    return( results );
}

/**
 * Function reads all Variables of an asset that are not ExpectedVerificationVariables
 * 
 * @param {object} args - An object containing all parameters
 * @param {MonitoredItem} args.Asset - A MonitoredItem of the asset to use
 * 
 * @returns {UaKeyValuePairs} Returns an object array containing the variables with Key = NodeId and Value = received value of the variables found
 */
function readSupportedAdditionalExpectedVerificationVariables( args ) {
    if( !isDefined( args ) || args.length < 1 ) throw( "readSupportedAdditionalExpectedVerificationVariables(): No args specified" );
    if( !isDefined( args.Asset ) ) throw( "readSupportedAdditionalExpectedVerificationVariables(): No Asset specified" );
    var result = [];
    var variablesToRead = [ 
        "AssetId", "ComponentName", "DeviceClass", "DeviceManual",
        "DeviceRevision", "Manufacturer", "Model", "RevisionCounter"
    ];
    for( var i=0; i<variablesToRead.length; i++ ) {
        if( isDefined( args.Asset[ variablesToRead[i] ] ) ) {
            var keyValuePair = new Object();
            // Store the NodeId of the variable as Key in the keyValuePair object
            keyValuePair.Key = args.Asset[ variablesToRead[i] ].NodeId;
            // Get the Value and store it as Value of the keyValuePair object
            args.Asset[ variablesToRead[i] ].AttributeId = Attribute.Value;
            ReadHelper.Execute( { NodesToRead: [ args.Asset[ variablesToRead[i] ] ], OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadNodeIdUnknown ] ) } );
            keyValuePair.Value = args.Asset[ variablesToRead[i] ].Value.Value;
            // Add the keyValuePair object to the results
            result.push( keyValuePair );
        }
    }
    return( result );
}

// Finds and initializes all UAFX specific Structure Types (will be stored in UAFXBaseVariables.Structures)
function initializeUAFXStructures() {
    modelMapHelper = new BuildLocalCacheMapService();
    modelMap = modelMapHelper.GetModelMap();
    UAFXBaseVariables.Structures = new Object();

    StructureReferences = modelMap.Get( new UaNodeId( Identifier.Structure ) );

    var searchDefinition_Structure = [
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "AssetVerificationDataType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "AssetVerificationResultDataType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "ConnectionEndpointConfigurationDataType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "ConnectionEndpointConfigurationResultDataType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "NodeIdValuePair" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "ReserveCommunicationIdsDataType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "ReserveCommunicationIdsResultDataType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "CommunicationLinkConfigurationDataType" } )
        },
        {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "ConnectionEndpointParameterDataType" } )
        }
    ];
    FindReferencesVerifyingNamespaceIndex( StructureReferences.ReferenceDescriptions, searchDefinition_Structure, modelMapHelper );
    if( isDefined( searchDefinition_Structure[0].ReferenceIndex ) ) {
        UAFXBaseVariables.Structures.AssetVerificationDataType = new MonitoredItem( StructureReferences.ReferenceDescriptions[searchDefinition_Structure[0].ReferenceIndex].NodeId.NodeId );
        UAFXBaseVariables.Structures.AssetVerificationDataType.References = modelMap.Get( UAFXBaseVariables.Structures.AssetVerificationDataType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_Structure[1].ReferenceIndex ) ) {
        UAFXBaseVariables.Structures.AssetVerificationResultDataType = new MonitoredItem( StructureReferences.ReferenceDescriptions[searchDefinition_Structure[1].ReferenceIndex].NodeId.NodeId );
        UAFXBaseVariables.Structures.AssetVerificationResultDataType.References = modelMap.Get( UAFXBaseVariables.Structures.AssetVerificationResultDataType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_Structure[2].ReferenceIndex ) ) {
        UAFXBaseVariables.Structures.ConnectionEndpointConfigurationDataType = new MonitoredItem( StructureReferences.ReferenceDescriptions[searchDefinition_Structure[2].ReferenceIndex].NodeId.NodeId );
        UAFXBaseVariables.Structures.ConnectionEndpointConfigurationDataType.References = modelMap.Get( UAFXBaseVariables.Structures.ConnectionEndpointConfigurationDataType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_Structure[3].ReferenceIndex ) ) {
        UAFXBaseVariables.Structures.ConnectionEndpointConfigurationResultDataType = new MonitoredItem( StructureReferences.ReferenceDescriptions[searchDefinition_Structure[3].ReferenceIndex].NodeId.NodeId );
        UAFXBaseVariables.Structures.ConnectionEndpointConfigurationResultDataType.References = modelMap.Get( UAFXBaseVariables.Structures.ConnectionEndpointConfigurationResultDataType.NodeId.toString() );
    }
    if( isDefined( searchDefinition_Structure[4].ReferenceIndex ) ) {
        UAFXBaseVariables.Structures.NodeIdValuePair = new MonitoredItem( StructureReferences.ReferenceDescriptions[searchDefinition_Structure[4].ReferenceIndex].NodeId.NodeId );
        UAFXBaseVariables.Structures.NodeIdValuePair.References = modelMap.Get( UAFXBaseVariables.Structures.NodeIdValuePair.NodeId.toString() );
    }
    if( isDefined( searchDefinition_Structure[5].ReferenceIndex ) ) {
        UAFXBaseVariables.Structures.ReserveCommunicationIdsDataType = new MonitoredItem( StructureReferences.ReferenceDescriptions[searchDefinition_Structure[5].ReferenceIndex].NodeId.NodeId );
        UAFXBaseVariables.Structures.ReserveCommunicationIdsDataType.References = modelMap.Get( UAFXBaseVariables.Structures.ReserveCommunicationIdsDataType.NodeId.toString() );
        
        // Structure.ReserveCommunicationIdsDataType
        var searchDefinition_ReserveCommunicationIdsDataType = [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "PubSubReserveCommunicationIdsDataType" } )
            }
        ];
        FindReferencesVerifyingNamespaceIndex( UAFXBaseVariables.Structures.ReserveCommunicationIdsDataType.References.ReferenceDescriptions, searchDefinition_ReserveCommunicationIdsDataType, modelMapHelper );
        if( isDefined( searchDefinition_ReserveCommunicationIdsDataType[0].ReferenceIndex ) ) {
            UAFXBaseVariables.Structures.ReserveCommunicationIdsDataType.PubSubReserveCommunicationIdsDataType = new MonitoredItem( UAFXBaseVariables.Structures.ReserveCommunicationIdsDataType.References.ReferenceDescriptions[searchDefinition_ReserveCommunicationIdsDataType[0].ReferenceIndex].NodeId.NodeId );
            UAFXBaseVariables.Structures.ReserveCommunicationIdsDataType.PubSubReserveCommunicationIdsDataType.References = modelMap.Get( UAFXBaseVariables.Structures.ReserveCommunicationIdsDataType.PubSubReserveCommunicationIdsDataType.NodeId.toString() );
        }
    }
    if( isDefined( searchDefinition_Structure[6].ReferenceIndex ) ) {
        UAFXBaseVariables.Structures.ReserveCommunicationIdsResultDataType = new MonitoredItem( StructureReferences.ReferenceDescriptions[searchDefinition_Structure[6].ReferenceIndex].NodeId.NodeId );
        UAFXBaseVariables.Structures.ReserveCommunicationIdsResultDataType.References = modelMap.Get( UAFXBaseVariables.Structures.ReserveCommunicationIdsResultDataType.NodeId.toString() );
        
        // Structure.ReserveCommunicationIdsResultDataType
        var searchDefinition_ReserveCommunicationIdsResultDataType = [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "PubSubReserveCommunicationIdsResultDataType" } )
            }
        ];
        FindReferencesVerifyingNamespaceIndex( UAFXBaseVariables.Structures.ReserveCommunicationIdsResultDataType.References.ReferenceDescriptions, searchDefinition_ReserveCommunicationIdsResultDataType, modelMapHelper );
        if( isDefined( searchDefinition_ReserveCommunicationIdsResultDataType[0].ReferenceIndex ) ) {
            UAFXBaseVariables.Structures.ReserveCommunicationIdsResultDataType.PubSubReserveCommunicationIdsResultDataType = new MonitoredItem( UAFXBaseVariables.Structures.ReserveCommunicationIdsResultDataType.References.ReferenceDescriptions[searchDefinition_ReserveCommunicationIdsResultDataType[0].ReferenceIndex].NodeId.NodeId );
            UAFXBaseVariables.Structures.ReserveCommunicationIdsResultDataType.PubSubReserveCommunicationIdsResultDataType.References = modelMap.Get( UAFXBaseVariables.Structures.ReserveCommunicationIdsResultDataType.PubSubReserveCommunicationIdsResultDataType.NodeId.toString() );
        }
    }
    if( isDefined( searchDefinition_Structure[7].ReferenceIndex ) ) {
        UAFXBaseVariables.Structures.CommunicationLinkConfigurationDataType = new MonitoredItem( StructureReferences.ReferenceDescriptions[searchDefinition_Structure[7].ReferenceIndex].NodeId.NodeId );
        UAFXBaseVariables.Structures.CommunicationLinkConfigurationDataType.References = modelMap.Get( UAFXBaseVariables.Structures.CommunicationLinkConfigurationDataType.NodeId.toString() );
        
        // Structure.CommunicationLinkConfigurationDataType
        var searchDefinition_CommunicationLinkConfigurationDataType = [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "PubSubCommunicationLinkConfigurationDataType" } )
            }
        ];
        FindReferencesVerifyingNamespaceIndex( UAFXBaseVariables.Structures.CommunicationLinkConfigurationDataType.References.ReferenceDescriptions, searchDefinition_CommunicationLinkConfigurationDataType, modelMapHelper );
        if( isDefined( searchDefinition_CommunicationLinkConfigurationDataType[0].ReferenceIndex ) ) {
            UAFXBaseVariables.Structures.CommunicationLinkConfigurationDataType.PubSubCommunicationLinkConfigurationDataType = new MonitoredItem( UAFXBaseVariables.Structures.CommunicationLinkConfigurationDataType.References.ReferenceDescriptions[searchDefinition_CommunicationLinkConfigurationDataType[0].ReferenceIndex].NodeId.NodeId );
            UAFXBaseVariables.Structures.CommunicationLinkConfigurationDataType.PubSubCommunicationLinkConfigurationDataType.References = modelMap.Get( UAFXBaseVariables.Structures.CommunicationLinkConfigurationDataType.PubSubCommunicationLinkConfigurationDataType.NodeId.toString() );
        }
    }
    if( isDefined( searchDefinition_Structure[8].ReferenceIndex ) ) {
        UAFXBaseVariables.Structures.ConnectionEndpointParameterDataType = new MonitoredItem( StructureReferences.ReferenceDescriptions[searchDefinition_Structure[8].ReferenceIndex].NodeId.NodeId );
        UAFXBaseVariables.Structures.ConnectionEndpointParameterDataType.References = modelMap.Get( UAFXBaseVariables.Structures.ConnectionEndpointParameterDataType.NodeId.toString() );
        
        // Structure.ConnectionEndpointParameterDataType
        var searchDefinition_ConnectionEndpointParameterDataType = [
            {
                ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
                IsForward: true,
                BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXDataNamespaceIndex, Name: "PubSubConnectionEndpointParameterDataType" } )
            }
        ];
        FindReferencesVerifyingNamespaceIndex( UAFXBaseVariables.Structures.ConnectionEndpointParameterDataType.References.ReferenceDescriptions, searchDefinition_ConnectionEndpointParameterDataType, modelMapHelper );
        if( isDefined( searchDefinition_ConnectionEndpointParameterDataType[0].ReferenceIndex ) ) {
            UAFXBaseVariables.Structures.ConnectionEndpointParameterDataType.PubSubConnectionEndpointParameterDataType = new MonitoredItem( UAFXBaseVariables.Structures.ConnectionEndpointParameterDataType.References.ReferenceDescriptions[searchDefinition_ConnectionEndpointParameterDataType[0].ReferenceIndex].NodeId.NodeId );
            UAFXBaseVariables.Structures.ConnectionEndpointParameterDataType.PubSubConnectionEndpointParameterDataType.References = modelMap.Get( UAFXBaseVariables.Structures.CommunicationLinkConfigurationDataType.PubSubCommunicationLinkConfigurationDataType.NodeId.toString() );
        }
    }
}

/**
 * Function calls the EstablishConnections method of a given AutomationComponent with the CommandMask set to VerifyAssetCmd
 * and converts and passes the given parameters
 * 
 * @param {object} args - An object containing all parameters
 * @param {MonitoredItem} args.AutomationComponent - The AutomationComponent initialized with initializeStandardVariables() method to call the EstablishConnections method on
 * @param {UaNodeId} args.AssetNodeId - AssetToVerify parameter of the AssetVerification ExtensionObject to pass
 * @param {Number} args.VerificationMode - (Optional) VerificationMode parameter of the AssetVerification ExtensionObject to pass (default=0(AssetCompatibility))
 * @param {Number} args.ExpectedVerificationResult - (Optional) ExpectedVerificationResult parameter of the AssetVerification ExtensionObject to pass (default=1(Match))
 * @param {KeyPairCollection} args.ExpectedVerificationVariables - (Optional) ExpectedVerificationVariables parameter of the AssetVerification ExtensionObject to pass (default=empty)
 * @param {KeyPairCollection} args.ExpectedAdditionalVerificationVariables - (Optional) ExpectedAdditionalVerificationVariables parameter of the AssetVerification ExtensionObject to pass (default=empty)
 *
 * @returns {object} Returns an object containing the property 'success' (boolean), which represents if the call was successful,
 *                   'StatusCode' (OperationResult) and the returned 'AssetVerificationResult'
 */
function callEstablishConnectionsMethod_VerifyAssetCmd( args ) {
    if( !isDefined( args ) || args.length < 1 ) throw( "callEstablishConnectionsMethod_VerifyAssetCmd(): No args specified" );
    if( !isDefined( args.AutomationComponent ) ) throw( "callEstablishConnectionsMethod_VerifyAssetCmd(): No AutomationComponent specified" );
    if( !isDefined( args.AssetNodeId ) ) throw( "callEstablishConnectionsMethod_VerifyAssetCmd(): No AssetNodeId specified" );
    if( !isDefined( args.VerificationMode ) ) args.VerificationMode = AssetVerificationMode.AssetCompatibility;
    if( !isDefined( args.ExpectedVerificationResult ) ) args.ExpectedVerificationResult = AssetVerificationResult.Match;
    if( !isDefined( args.ExpectedVerificationVariables ) ) args.ExpectedVerificationVariables = new UaKeyValuePairs();
    if( !isDefined( args.ExpectedAdditionalVerificationVariables ) ) args.ExpectedAdditionalVerificationVariables = [];
    if( !isDefined( args.ServiceResult ) ) args.ServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( !isDefined( args.OperationResults ) ) args.OperationResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
    if( !isDefined( args.CallCreateConnectionEndpointCmd ) ) args.CallCreateConnectionEndpointCmd = false;
    
    if( args.CallCreateConnectionEndpointCmd ) {
        // ConnectionEndpoint parameters
        if( !isDefined( args.Name ) ) args.Name = "Connection_1";
        if( !isDefined( args.InputVariableIds ) ) args.InputVariableIds = new UaNodeIds();
        if( !isDefined( args.OutputVariableIds ) ) args.OutputVariableIds = new UaNodeIds();
        if( !isDefined( args.IsPersistent ) ) args.IsPersistent = false;
        if( !isDefined( args.IsPreconfigured ) ) args.IsPreconfigured = false;
        if( !isDefined( args.CleanupTimeout ) ) args.CleanupTimeout = 0;
        if( !isDefined( args.RelatedEndpointData ) ) args.RelatedEndpointData = CTTRelatedEndpointData;
        if( !isDefined( args.Mode ) ) args.Mode = PubSubConnectionEndpointModeEnum.PublisherSubscriber;
    }
            
    var result = new Object();
    
    // Learn needed StructureDefinitions from Server
    if( !isDefined( UAFXBaseVariables.Structures ) ) initializeUAFXStructures();
    if( isDefined( UAFXBaseVariables.Structures.AssetVerificationDataType ) ) {
        var AssetVerificationDataType = UaStructureDefinition.FromTypeNodeId( UAFXBaseVariables.Structures.AssetVerificationDataType.NodeId );
    }
    else {
        addError( "Failed to call EstablishConnections method. AssetVerificationDataType missing in server." );
        return false;
    }
    if( isDefined( UAFXBaseVariables.Structures.AssetVerificationResultDataType ) ) {
        var AssetVerificationResultDataType = UaStructureDefinition.FromTypeNodeId( UAFXBaseVariables.Structures.AssetVerificationResultDataType.NodeId );
    }
    else {
        addError( "Failed to call EstablishConnections method. AssetVerificationResultDataType missing in server." );
        return false;
    }
    
    if( args.CallCreateConnectionEndpointCmd ) {
        if( isDefined( UAFXBaseVariables.Structures.ConnectionEndpointConfigurationResultDataType ) ) {
            var ConnectionEndpointConfigurationResultDataType = UaStructureDefinition.FromTypeNodeId( UAFXBaseVariables.Structures.ConnectionEndpointConfigurationResultDataType.NodeId, true );
        }
        else {
            addError( "Failed to call EstablishConnections method. ConnectionEndpointConfigurationResultDataType missing in server." );
            return false;
        }
    }

    // Construct the InputArguments
    var CommandMask = 1; // VerifyAssetCmd = true
    var emptyExtensionObjectArray = UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: new UaExtensionObjects(), Array: true } ); // empty ExtensionObject array
    
    var ExpectedVerificationVariables_GenericStructureValues = [];
    for( var i=0; i<args.ExpectedVerificationVariables.length; i++ ) {
        ExpectedVerificationVariables_GenericStructureValues.push(
            UaGenericStructureValue.New( {
                StructureDefinition: AssetVerificationDataType.child(3).structureDefinition(),
                Fields: [
                    UaVariant.New( { Type: BuiltInType.QualifiedName, Value: args.ExpectedVerificationVariables[i].Key } ),
                    args.ExpectedVerificationVariables[i].Value
                ]
            } )
        );
    }
    
    var ExpectedAdditionalVerificationVariables_GenericStructureValues = [];
    for( var i=0; i<args.ExpectedAdditionalVerificationVariables.length; i++ ) {
        var keyField = UaVariant.New( { Type: BuiltInType.NodeId, Value: args.ExpectedAdditionalVerificationVariables[i].Key } );
        if( i== 0 && isDefined( args.SetFirstAdditionalVariableKeyToNull ) && args.SetFirstAdditionalVariableKeyToNull ) keyField = new UaVariant();
        ExpectedAdditionalVerificationVariables_GenericStructureValues.push(
            UaGenericStructureValue.New( {
                StructureDefinition: AssetVerificationDataType.child(4).structureDefinition(),
                Fields: [
                    UaGenericStructureValue.New( {
                        StructureDefinition: AssetVerificationDataType.child(4).structureDefinition().child(0).structureDefinition(),
                        Fields: [
                            keyField
                        ]
                    } ),
                    args.ExpectedAdditionalVerificationVariables[i].Value
                ]
            } )
        );
    }
    
    var AssetVerifications = new UaExtensionObjects(1);
    AssetVerifications[0] = UaGenericStructureValue.New( {
        StructureDefinition: AssetVerificationDataType,
        Fields: [
            UaVariant.New( { Type: BuiltInType.NodeId, Value: args.AssetNodeId } ),
            UaVariant.New( { Type: BuiltInType.Int32, Value: args.VerificationMode } ),
            UaVariant.New( { Type: BuiltInType.Int32, Value: args.ExpectedVerificationResult } ),
            UaGenericStructureArray.New( {
                StructureDefinition: AssetVerificationDataType.child(3).structureDefinition(),
                GenericStructureValues: ExpectedVerificationVariables_GenericStructureValues
            } ),
            UaGenericStructureArray.New( {
                StructureDefinition: AssetVerificationDataType.child(4).structureDefinition(),
                GenericStructureValues: ExpectedAdditionalVerificationVariables_GenericStructureValues
            } )
        ]
    } ).toExtensionObject();
    
    var inputArguments = [ 
        UaVariant.New( { Type: BuiltInType.UInt32, Value: CommandMask } ), // CommandMask
        UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: AssetVerifications, Array: true } ), //AssetVerifications
        emptyExtensionObjectArray, // ConnectionEndpointConfigurations (shall be empty array)
        emptyExtensionObjectArray, // ReserveCommunicationIds (shall be empty array)
        emptyExtensionObjectArray  // CommunicationConfigurations (shall be empty array)
    ];
    
    // Modify InputArguments if CallCreateConnectionEndpointCmd is set
    if( args.CallCreateConnectionEndpointCmd ) {
        CommandMask += 4; // CreateConnectionEndpointCmd = true
        inputArguments[0] = UaVariant.New( { Type: BuiltInType.UInt32, Value: CommandMask } ); // Update CommandMask
        
        if( isDefined( args.ConnectionEndpointConfigurations ) ) var ConnectionEndpointConfigurations = args.ConnectionEndpointConfigurations;
        else {
            var ConnectionEndpointConfigurations = new UaExtensionObjects(1);
            ConnectionEndpointConfigurations[0] = createConnectionEndpointConfiguration( args );
        }
        
        if( !isDefined( ConnectionEndpointConfigurations[0].toBinary() ) ) {
            addError( "callEstablishConnectionsMethod_VerifyAssetCmd(): Failed to create ConnectionEndpointConfigurations argument for method call" );
            return( false );
        }
        inputArguments[2] = UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: ConnectionEndpointConfigurations, Array: true } ); // Update ConnectionEndpointConfigurations
    }
    
    if( CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: args.AutomationComponent.EstablishConnections.NodeId,
            ObjectId: args.AutomationComponent.NodeId,
            InputArguments: inputArguments
        } ],
        ServiceResult: args.ServiceResult,
        OperationResults: args.OperationResults,
    } ) ) {
        if( CallHelper.Response.Results[0].StatusCode.isGood() || CallHelper.Response.Results[0].StatusCode.isUncertain() ) {
            if( !CallHelper.Response.Results[0].OutputArguments[0].isEmpty() ) {
                result.AssetVerificationResults = [];
                var extObjArray = CallHelper.Response.Results[0].OutputArguments[0].toExtensionObjectArray();
                for( var i=0; i<extObjArray.length; i++ ) {
                    var resultExtObj = new UaGenericStructureValue( extObjArray[i], AssetVerificationResultDataType )
                    result.AssetVerificationResults.push( {
                        VerificationStatus: resultExtObj.value(0).toStatusCode(),
                        VerificationResult: resultExtObj.value(1).toInt32(),
                        VerificationVariablesErrors: resultExtObj.value(2).toStatusCodeArray(),
                        VerificationAdditionalVariablesErrors: resultExtObj.value(3).toStatusCodeArray()
                    } );
                }
            }
            else {
                result.AssetVerificationResults = null;
                result.success = false;
            }
            result.success = true;
        }
        else result.success = false;
    }
    else result.success = false;
    
    result.StatusCode = CallHelper.Response.Results[0].StatusCode;
    
    if( args.CallCreateConnectionEndpointCmd ) {
        if( !CallHelper.Response.Results[0].OutputArguments[1].isEmpty() ) {
            result.ConnectionEndpointConfigurationResults = [];
            var extObjArray = CallHelper.Response.Results[0].OutputArguments[1].toExtensionObjectArray();
            for( var i=0; i<extObjArray.length; i++ ) {
                var resultExtObj = new UaGenericStructureValue( extObjArray[i], ConnectionEndpointConfigurationResultDataType )
                result.ConnectionEndpointConfigurationResults.push( {
                    ConnectionEndpointId: resultExtObj.value(0).toNodeId(),
                    FunctionalEntityNodeResult: resultExtObj.value(1).toStatusCode(),
                    ConnectionEndpointResult: resultExtObj.value(2).toStatusCode()
                } );
            }
        }
    }
    
    return( result );
}

/**
 * Function calls the EstablishControl (or the ReassignControl) method of a given ControlGroupType instance
 * 
 * @param {MonitoredItem} controlGroup - The ControlGroupType instance to call EstablishControl on
 * @param {string} lockContext - The LockContext parameter (default=null-string)
 * @param {boolean} reassignControl - (Optional) Call the ReassignControl instead of the EstablishControl method (with same arguments) (default=FALSE)
 * 
 * @returns {object} Returns an object containing the property 'success' (boolean), which represents if the call was successful,
 *                   'OperationResult' and the returned 'LockStatus'
 */
function callEstablishControlMethod( controlGroup, lockContext, serviceResult, operationResults, reassignControl ) {
    if( !isDefined( controlGroup ) ) throw( "callEstablishControlMethod(): No ControlGroupType instance specified" );
    if( !isDefined( controlGroup.NodeId ) ) throw( "callEstablishControlMethod(): ControlGroupType instance appears to be no MonitoredItem" );
    if( !isDefined( reassignControl ) ) var reassignControl = false;
    if( !reassignControl && !isDefined( controlGroup.EstablishControl ) ) throw( "callEstablishControlMethod(): ControlGroupType instance does not expose the EstablishControl method" );
    if( reassignControl && !isDefined( controlGroup.ReassignControl ) ) throw( "callEstablishControlMethod(): ControlGroupType instance does not expose the ReassignControl method" );
    if( !isDefined( lockContext ) ) lockContext = "";
    if( !isDefined( serviceResult ) ) var serviceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( !isDefined( operationResults ) ) var operationResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
    
    var result = new Object();
    
    var MethodName = ( ( reassignControl ) ? "ReassignControl" : "EstablishControl" );
    var MethodId = ( ( reassignControl ) ? controlGroup.ReassignControl.NodeId : controlGroup.EstablishControl.NodeId );
    
    if( CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: MethodId,
            ObjectId: controlGroup.NodeId,
            InputArguments: UaVariant.New( { Type: BuiltInType.String, Value: lockContext } )
        } ] ,
        ServiceResult: serviceResult,
        OperationResults: operationResults
    } ) ) {
         if( CallHelper.Response.Results[0].StatusCode.isGood() ) {
             result.OperationResult = CallHelper.Response.Results[0].StatusCode;
             if( !CallHelper.Response.Results[0].OutputArguments[0].isEmpty() ) {
                 result.LockStatus = CallHelper.Response.Results[0].OutputArguments[0].toInt32();
                 result.success = true;
             }
             else {
                 addError( "Received an empty result for 'LockStatus' on calling " + MethodName + " method ('" + MethodId + "')" );
                 result.success = false;
             }
         }
         else result.success = false;
    }
    else result.success = false;
    
    return( result );
}

/**
 * Function calls the ReleaseControl method of a given ControlGroupType instance
 * 
 * @param {MonitoredItem} controlGroup - The ControlGroupType instance to call ReleaseControl on
 * 
 * @returns {object} Returns TRUE on success, FALSE otherwise
 */
function callReleaseControlMethod( controlGroup, serviceResult, operationResults ) {
    if( !isDefined( controlGroup ) ) throw( "callReleaseControlMethod(): No ControlGroupType instance specified" );
    if( !isDefined( controlGroup.NodeId ) ) throw( "callReleaseControlMethod(): ControlGroupType instance appears to be no MonitoredItem" );
    if( !isDefined( controlGroup.ReleaseControl ) ) throw( "callReleaseControlMethod(): ControlGroupType instance does not expose the ReleaseControl method" );
    if( !isDefined( serviceResult ) ) var serviceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( !isDefined( operationResults ) ) var operationResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
    
    var result = new Object();
    
    return( CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: controlGroup.ReleaseControl.NodeId,
            ObjectId: controlGroup.NodeId,
            InputArguments: []
        } ] ,
        ServiceResult: serviceResult,
        OperationResults: operationResults
    } ) );
}

/*
 *
 * Function calls the EstablishConnections method of a given AutomationComponent with the CommandMask set to CreateConnectionEndpointCmd
 * and converts and passes the given parameters to create a Dynamic PubSubConnectionEndpoint
 * 
 * @param {object} args - An object containing all parameters
 * @param {MonitoredItem} args.AutomationComponent - The AutomationComponent initialized with initializeStandardVariables() method to call the EstablishConnections method on
 * @param {UaNodeId} args.AssetNodeId - AssetToVerify parameter of the AssetVerification ExtensionObject to pass
 * @param {Number} args.VerificationMode - (Optional) VerificationMode parameter of the AssetVerification ExtensionObject to pass (default=0(AssetCompatibility))
 * @param {Number} args.ExpectedVerificationResult - (Optional) ExpectedVerificationResult parameter of the AssetVerification ExtensionObject to pass (default=1(Match))
 * @param {KeyPairCollection} args.ExpectedVerificationVariables - (Optional) ExpectedVerificationVariables parameter of the AssetVerification ExtensionObject to pass (default=empty)
 * @param {KeyPairCollection} args.ExpectedAdditionalVerificationVariables - (Optional) ExpectedAdditionalVerificationVariables parameter of the AssetVerification ExtensionObject to pass (default=empty)
 *
 * @returns {object} Returns an object containing the property 'success' (boolean), which represents if the call was successful,
 *                   'StatusCode' (OperationResult) and the returned 'AssetVerificationResult'
 */
function callEstablishConnectionsMethod_CreateConnectionEndpointCmd( args ) {
    if( !isDefined( args ) || args.length < 1 ) throw( "callEstablishConnectionsMethod_CreateConnectionEndpointCmd(): No args specified" );
    if( !isDefined( args.AutomationComponent ) ) throw( "callEstablishConnectionsMethod_CreateConnectionEndpointCmd(): No AutomationComponent specified" );
    if( !isDefined( args.FunctionalEntityNodeId ) && !isDefined( args.ConnectionEndpointConfigurations ) ) throw( "callEstablishConnectionsMethod_CreateConnectionEndpointCmd(): No FunctionalEntityNodeId specified" );
    if( !isDefined( args.ServiceResult ) ) args.ServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( !isDefined( args.OperationResults ) ) args.OperationResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
    
    // ConnectionEndpoint parameters
    if( !isDefined( args.Name ) ) args.Name = "Connection_1";
    if( !isDefined( args.InputVariableIds ) ) args.InputVariableIds = new UaNodeIds();
    if( !isDefined( args.OutputVariableIds ) ) args.OutputVariableIds = new UaNodeIds();
    if( !isDefined( args.IsPersistent ) ) args.IsPersistent = false;
    if( !isDefined( args.IsPreconfigured ) ) args.IsPreconfigured = false;
    if( !isDefined( args.CleanupTimeout ) ) args.CleanupTimeout = 0;
    if( !isDefined( args.RelatedEndpointData ) ) args.RelatedEndpointData = CTTRelatedEndpointData;
    if( !isDefined( args.Mode ) ) args.Mode = PubSubConnectionEndpointModeEnum.PublisherSubscriber;
    
    var result = new Object();
    
    // Learn needed StructureDefinitions from Server
    if( !isDefined( UAFXBaseVariables.Structures ) ) initializeUAFXStructures();
    
    if( isDefined( UAFXBaseVariables.Structures.ConnectionEndpointConfigurationResultDataType ) ) {
        var ConnectionEndpointConfigurationResultDataType = UaStructureDefinition.FromTypeNodeId( UAFXBaseVariables.Structures.ConnectionEndpointConfigurationResultDataType.NodeId, true );
    }
    else {
        addError( "Failed to call EstablishConnections method. ConnectionEndpointConfigurationResultDataType missing in server." );
        return false;
    }
    
    // Construct the InputArguments
    var CommandMask = 4; // CreateConnectionEndpointCmd = true
    var emptyExtensionObjectArray = UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: new UaExtensionObjects(), Array: true } ); // empty ExtensionObject array
    
    var result = callEstablishConnectionsMethod_ReserveCommunicationIdsCmd( {
        AutomationComponent: args.AutomationComponent
    } );
    
    if( result.success && isDefined( result.ReserveCommunicationIdsResults[0] ) && result.ReserveCommunicationIdsResults[0].Result.StatusCode == StatusCode.Good ) {
        addLog( "Successfully called ReserveCommunicationIds command. DefaultPublisherId is: " + result.ReserveCommunicationIdsResults[0].DefaultPublisherId );
    }
    else {
        addError( "Failed to call ReserveCommunicationIds command" );
        return( false );
    }
    
    if( isDefined( args.ConnectionEndpointConfigurations ) ) var ConnectionEndpointConfigurations = args.ConnectionEndpointConfigurations;
    else {
        var ConnectionEndpointConfigurations = new UaExtensionObjects(1);
        ConnectionEndpointConfigurations[0] = createConnectionEndpointConfiguration( args );
    }
    
    if( !isDefined( ConnectionEndpointConfigurations[0].toBinary() ) ) {
        addError( "callEstablishConnectionsMethod_CreateConnectionEndpointCmd(): Failed to create ConnectionEndpointConfigurations argument for method call" );
        return( false );
    }
    var inputArguments = [ 
        UaVariant.New( { Type: BuiltInType.UInt32, Value: CommandMask } ), // CommandMask
        emptyExtensionObjectArray, //AssetVerifications (shall be empty array)
        UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: ConnectionEndpointConfigurations, Array: true } ), // ConnectionEndpointConfigurations
        emptyExtensionObjectArray, // ReserveCommunicationIds (shall be empty array)
        emptyExtensionObjectArray  // CommunicationConfigurations (shall be empty array)
    ];
    
    result.success = true;
    
    if( !CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: args.AutomationComponent.EstablishConnections.NodeId,
            ObjectId: args.AutomationComponent.NodeId,
            InputArguments: inputArguments,
        } ],
        ServiceResult: args.ServiceResult,
        OperationResults: args.OperationResults
    } ) ) result.success = false;
    
    if( CallHelper.Response.Results[0].StatusCode.isGood() || CallHelper.Response.Results[0].StatusCode.isUncertain() ) {
        if( !CallHelper.Response.Results[0].OutputArguments[0].isEmpty() ) {
            result.ConnectionEndpointConfigurationResults = [];
            var extObjArray = CallHelper.Response.Results[0].OutputArguments[1].toExtensionObjectArray();
            for( var i=0; i<extObjArray.length; i++ ) {
                var resultExtObj = new UaGenericStructureValue( extObjArray[i], ConnectionEndpointConfigurationResultDataType )
                result.ConnectionEndpointConfigurationResults.push( {
                    ConnectionEndpointId: resultExtObj.value(0).toNodeId(),
                    FunctionalEntityNodeResult: resultExtObj.value(1).toStatusCode(),
                    ConnectionEndpointResult: resultExtObj.value(2).toStatusCode()
                } );
            }
        }
        else {
            result.ConnectionEndpointConfigurationResults = null;
            result.success = false;
        }
    }
    else result.success = false;
    
    result.StatusCode = CallHelper.Response.Results[0].StatusCode;
    
    return( result );
}

function createConnectionEndpointConfiguration( args ) {
    if( !isDefined( args.IsPreconfigured ) ) args.IsPreconfigured = false;
    // Learn needed StructureDefinitions from Server
    if( !isDefined( UAFXBaseVariables.Structures ) ) initializeUAFXStructures();
    if( isDefined( UAFXBaseVariables.Structures.ConnectionEndpointConfigurationDataType ) ) {
        var ConnectionEndpointConfigurationDataType = UaStructureDefinition.FromTypeNodeId( 
            UAFXBaseVariables.Structures.ConnectionEndpointConfigurationDataType.NodeId,
            true,
            [
                null,
                {
                    Children: [
                        {
                            AllowSubTypes: true,
                            TypeNodeId: UAFXBaseVariables.Structures.ConnectionEndpointParameterDataType.PubSubConnectionEndpointParameterDataType.NodeId,
                            ForceUsageOfServerType: true
                        },
                        null
                    ]
                },
                null,
                null,
                null,
                {
                    AllowSubTypes: true,
                    TypeNodeId: UAFXBaseVariables.Structures.CommunicationLinkConfigurationDataType.PubSubCommunicationLinkConfigurationDataType.NodeId,
                    ForceUsageOfServerType: true
                }
            ]
        );
        if( ConnectionEndpointConfigurationDataType === false ) {
            addError( "Error while learning ConnectionEndpointConfigurationDataType from server." );
            return false;
        }
    }
    else {
        addError( "Failed to create ConnectionEndpointConfiguration. ConnectionEndpointConfigurationDataType missing in server." );
        return false;
    }
    
    if( isDefined( UAFXBaseVariables.Structures.ConnectionEndpointParameterDataType.PubSubConnectionEndpointParameterDataType ) ) {
        var PubSubConnectionEndpointParameterDataType = UaStructureDefinition.FromTypeNodeId( UAFXBaseVariables.Structures.ConnectionEndpointParameterDataType.PubSubConnectionEndpointParameterDataType.NodeId, true );
        if( PubSubConnectionEndpointParameterDataType === false ) {
            addError( "Error while learning PubSubConnectionEndpointParameterDataType from server." );
            return false;
        }
    }
    else {
        addError( "Failed to create ConnectionEndpointConfiguration. PubSubConnectionEndpointParameterDataType missing in server." );
        return false;
    }
    
    if( isDefined( UAFXBaseVariables.Structures.CommunicationLinkConfigurationDataType.PubSubCommunicationLinkConfigurationDataType ) ) {
        var PubSubCommunicationLinkConfigurationDataType = UaStructureDefinition.FromTypeNodeId( UAFXBaseVariables.Structures.CommunicationLinkConfigurationDataType.PubSubCommunicationLinkConfigurationDataType.NodeId, true );
        if( PubSubCommunicationLinkConfigurationDataType === false ) {
            addError( "Error while learning PubSubCommunicationLinkConfigurationDataType from server." );
            return false;
        }
    }
    else {
        addError( "Failed to create ConnectionEndpointConfiguration. PubSubCommunicationLinkConfigurationDataType missing in server." );
        return false;
    }
    
    var ConnectionEndpointPath = [];
    
    if( isDefined( args.RelatedEndpointData ) ) {
        for( var cep=0; cep<args.RelatedEndpointData.ConnectionEndpointPath.length; cep++ ) {
            ConnectionEndpointPath.push( UaGenericStructureValue.New( {
                StructureDefinition: ConnectionEndpointConfigurationDataType.child(1).structureDefinition().child(0).structureDefinition().child(6).structureDefinition().child(1).structureDefinition(),
                Fields: [
                    UaVariant.New( { Type: BuiltInType.String, Value: args.RelatedEndpointData.ConnectionEndpointPath[cep].NamespaceUri } ), // NamespaceUri
                    UaVariant.New( { Type: BuiltInType.String, Value: args.RelatedEndpointData.ConnectionEndpointPath[cep].Name } ), // Name
                ]
            } ) );
        }
    }
    
    var RelatedEndpoint = UaGenericStructureValue.New( { // RelatedEndpoint
        StructureDefinition: ConnectionEndpointConfigurationDataType.child(1).structureDefinition().child(0).structureDefinition().child(6).structureDefinition(),
        Fields: [
            UaVariant.New( { Type: BuiltInType.String, Value: args.RelatedEndpointData.Address } ), // Address
            UaGenericStructureArray.New( { // ConnectionEndpointPath
                StructureDefinition: ConnectionEndpointConfigurationDataType.child(1).structureDefinition().child(0).structureDefinition().child(6).structureDefinition().child(1).structureDefinition(),
                GenericStructureValues: ConnectionEndpointPath
            } ),
            UaVariant.New( { Type: BuiltInType.String, Value: args.RelatedEndpointData.ConnectionEndpointName } ) // ConnectionEndpointName
        ]
    } );
    
    if( args.RelatedEndpointDataNull ) RelatedEndpoint = new UaVariant();
    if( args.UseAbstractConnectionEndpointTypeId ) var usedConnectionEndpointTypeId = UAFXBaseVariables.BaseObjectType.ConnectionEndpointType.NodeId;
    else var usedConnectionEndpointTypeId = UAFXBaseVariables.BaseObjectType.ConnectionEndpointType.PubSubConnectionEndpointType.NodeId;
     
    var Parameter = UaGenericStructureValue.New( { // Parameter
        StructureDefinition: ConnectionEndpointConfigurationDataType.child(1).structureDefinition().child(0).structureDefinition(),
        Fields: [
            UaVariant.New( { Type: BuiltInType.String, Value: args.Name } ), // Name
            UaVariant.New( { Type: BuiltInType.NodeId, Value: usedConnectionEndpointTypeId } ), // ConnectionEndpointTypeId
            UaVariant.New( { Type: BuiltInType.NodeId, Value: args.InputVariableIds, Array: true } ), // InputVariableIds
            UaVariant.New( { Type: BuiltInType.NodeId, Value: args.OutputVariableIds, Array: true } ), // OutputVariableIds
            UaVariant.New( { Type: BuiltInType.Boolean, Value: args.IsPersistent } ), // IsPersistent
            UaVariant.New( { Type: BuiltInType.Double, Value: args.CleanupTimeout } ), // CleanupTimeout
            RelatedEndpoint,
            UaVariant.New( { Type: BuiltInType.Boolean, Value: args.IsPreconfigured } ), // IsPreconfigured
            UaVariant.New( { Type: BuiltInType.Int32, Value: args.Mode } ) // Mode
        ]
    } ).toExtensionObject();
    
    var ControlGroups = new UaNodeIds();
   
    var ConnectionEndpointConfiguration = new UaExtensionObject();
    ConnectionEndpointConfiguration = UaGenericStructureValue.New( {
        StructureDefinition: ConnectionEndpointConfigurationDataType,
        Fields: [
            UaVariant.New( { Type: BuiltInType.NodeId, Value: args.FunctionalEntityNodeId } ), // FunctionalEntityNode
            UaGenericStructureValue.New( { // ConnectionEndpoint
                StructureDefinition: ConnectionEndpointConfigurationDataType.child(1).structureDefinition(),
                IsUnion: true,
                UnionFieldToSet: {
                    Name: "Parameter",
                    Value: UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: Parameter } )
                }
            } ),
            UaGenericStructureArray.New( { // ExpectedVerificationVariables
                StructureDefinition: ConnectionEndpointConfigurationDataType.child(2).structureDefinition(),
                GenericStructureValues: []//ExpectedVerificationVariables_Generic
            } ),
            UaVariant.New( { Type: BuiltInType.NodeId, Value: ControlGroups, Array: true } ),
            UaGenericStructureArray.New( { // ConfigurationData
                StructureDefinition: ConnectionEndpointConfigurationDataType.child(4).structureDefinition(),
                GenericStructureValues: []//ConfigurationData_Generic
            } ),
            UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: 
                UaGenericStructureValue.New( { // CommunicationLinks
                    StructureDefinition: ConnectionEndpointConfigurationDataType.child(5).structureDefinition(),
                    Fields: [
                        UaGenericStructureValue.New( { // DataSetReaderRef 
                            StructureDefinition: ConnectionEndpointConfigurationDataType.child(5).structureDefinition().child(0).structureDefinition(),
                            Fields: [
                                UaVariant.New( { Type: BuiltInType.UInt32, Value: 32 } ), // ConfigurationMask
                                UaVariant.New( { Type: BuiltInType.UInt16, Value: 0 } ), // ElementIndex
                                UaVariant.New( { Type: BuiltInType.UInt16, Value: 0 } ), // ConnectionIndex
                                UaVariant.New( { Type: BuiltInType.UInt16, Value: 0 } ) // GroupIndex
                            ]
                        } ),
                        UaGenericStructureValue.New( { // ExpectedSubscribedDataSetVersion 
                            StructureDefinition: ConnectionEndpointConfigurationDataType.child(5).structureDefinition().child(1).structureDefinition(),
                            Fields: [
                                UaVariant.New( { Type: BuiltInType.UInt32, Value: 0 } ), // MajorVersion
                                UaVariant.New( { Type: BuiltInType.UInt32, Value: 0 } ) // MinorVersion
                            ]
                        } ),
                        UaGenericStructureValue.New( { // DataSetWriterRef 
                            StructureDefinition: ConnectionEndpointConfigurationDataType.child(5).structureDefinition().child(2).structureDefinition(),
                            Fields: [
                                UaVariant.New( { Type: BuiltInType.UInt32, Value: 16 } ), // ConfigurationMask
                                UaVariant.New( { Type: BuiltInType.UInt16, Value: 0 } ), // ElementIndex
                                UaVariant.New( { Type: BuiltInType.UInt16, Value: 0 } ), // ConnectionIndex
                                UaVariant.New( { Type: BuiltInType.UInt16, Value: 0 } ) // GroupIndex
                            ]
                        } ),
                        UaGenericStructureValue.New( { // ExpectedPublishedDataSetVersion 
                            StructureDefinition: ConnectionEndpointConfigurationDataType.child(5).structureDefinition().child(3).structureDefinition(),
                            Fields: [
                                UaVariant.New( { Type: BuiltInType.UInt32, Value: 0 } ), // MajorVersion
                                UaVariant.New( { Type: BuiltInType.UInt32, Value: 0 } ) // MinorVersion
                            ]
                        } )
                    ]
                } ).toExtensionObject()
            } )
        ]
    } ).toExtensionObject();
    
    return ConnectionEndpointConfiguration;
}

/*
 *
 * Function calls the CloseConnections method of a given AutomationComponent
 * 
 * @param {object} args - An object containing all parameters
 * @param {MonitoredItem} args.AutomationComponent - The AutomationComponent initialized with initializeStandardVariables() method to call the EstablishConnections method on
 * @param {UaNodeId[]} args.ConnectionEndpoints - The ConnectionEndpoints argument (Connections to close)
 * @param {boolean} args.Remove - (Optional) The Remove argument (default=TRUE)
 * @param {boolean} args.SkipResultValidation - (Optional) Skip checking the 'Results' OutputArgument for bad StatusCodes (default=FALSE)
 * @param {boolean} args.SuppressErrors - (Optional) Suppress error messages (default=FALSE)
 * @param {ExpectedAndAcceptedResults} args.ServiceResult - (Optional) The expected ServiceResult (default=Good)
 * @param {ExpectedAndAcceptedResults[]} args.OperationResults - (Optional) The expected OperationResults (default=[Good])
 *
 * @returns {object} Returns an object containing the property 'success' (boolean), which represents if the call was successful,
 *                   'StatusCode' (OperationResult) and the returned 'Results' output argument (array of StatusCode)
 */
function callCloseConnectionsMethod( args ) {
    if( !isDefined( args ) || args.length < 1 ) throw( "callCloseConnectionsMethod(): No args specified" );
    if( !isDefined( args.AutomationComponent ) ) throw( "callCloseConnectionsMethod(): No AutomationComponent specified" );
    if( isDefined( args.AllowEmptyConnectionEndpoint ) && args.AllowEmptyConnectionEndpoint && !isDefined( args.ConnectionEndpoints ) ) args.ConnectionEndpoints = [ new UaNodeId() ];
    if( !isDefined( args.ConnectionEndpoints ) ) throw( "callCloseConnectionsMethod(): No ConnectionEndpoints argument specified" );
    if( !isDefined( args.ConnectionEndpoints.length ) )  args.ConnectionEndpoints = [ args.ConnectionEndpoints ];
    if( !isDefined( args.Remove ) ) args.Remove = true;
    if( !isDefined( args.SkipResultValidation ) ) args.SkipResultValidation = false;
    if( !isDefined( args.SuppressErrors ) ) args.SuppressErrors = false;
    if( !isDefined( args.ServiceResult ) ) args.ServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( !isDefined( args.OperationResults ) ) args.OperationResults = [new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.Uncertain )];
    
    var result = new Object();
    
    // Create UaNodeIds from passed NodeId array
    var nodeIds = new UaNodeIds();
    for( var i=0; i<args.ConnectionEndpoints.length; i++ ) nodeIds[i] = args.ConnectionEndpoints[i];
    
    var inputArguments = [ 
        UaVariant.New( { Type: BuiltInType.NodeId, Value: nodeIds, Array: true } ), // ConnectionEndpoints
        UaVariant.New( { Type: BuiltInType.Boolean, Value: args.Remove } )          // Remove
    ];
    
    if( CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: args.AutomationComponent.CloseConnections.NodeId,
            ObjectId: args.AutomationComponent.NodeId,
            InputArguments: inputArguments
        } ],
        ServiceResult: args.ServiceResult,
        OperationResults: args.OperationResults
    } ) ) {
        if( !CallHelper.Response.Results[0].OutputArguments[0].isEmpty() ) {
            result.Results = CallHelper.Response.Results[0].OutputArguments[0].toStatusCodeArray();
            if( !args.SkipResultValidation ) {
                for( var i=0; i<result.Results.length; i++ ) {
                    Assert.StatusCodeIs( new ExpectedAndAcceptedResults( StatusCode.Good ), result.Results[i], "callCloseConnectionsMethod(): Returned Output argument Results[" + i + "] is not Good" );
                }
            }
        }
        else {
            if( !args.SuppressErrors ) addError( "callCloseConnectionsMethod(): Returned 'Results' output argument is empty" );
            result.Results = null;
            result.success = false;
        }
        result.success = true;
    }
    else result.success = false;
    
    result.StatusCode = CallHelper.Response.Results[0].StatusCode;
    
    return( result );
}

/**
 * Function finds and returns all ControlGroupType instances having at least one nested ControlGroupType instance
 * 
 * @returns {MonitoredItem[]} Returns all ControlGroupType instances having at least one nested<br>
 * ControlGroupType instance (nested control groups will be in results[i].NestedControlGroups)
 */
function GetControlGroupInstancesWithNestedControlGroups() {
    var results = [];
    var ControlGroupType = null;
    // Get ControlGroupType
    if( 
        isDefined( CU_Variables ) &&
        isDefined( CU_Variables.Test ) &&
        isDefined( CU_Variables.Test.BaseObjectType ) &&
        isDefined( CU_Variables.Test.BaseObjectType.ControlGroupType )
    ) 
    {
        ControlGroupType = CU_Variables.Test.BaseObjectType.ControlGroupType.clone();
    }
    else // if not already defined, try to get type from server
    {
        var mI_BaseObjectType = new MonitoredItem( new UaNodeId( Identifier.BaseObjectType ) );
        mI_BaseObjectType.References = BaseVariables.ModelMap.Get( mI_BaseObjectType.NodeId.toString() );
        var searchDef = [ {
            ReferenceTypeId: new UaNodeId( Identifier.HasSubtype ),
            IsForward: true,
            BrowseName: UaQualifiedName.New( { NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex, Name: "ControlGroupType" } )
        } ];
        FindReferencesVerifyingNamespaceIndex( mI_BaseObjectType.References.ReferenceDescriptions, searchDef, BaseVariables.ModelMapHelper );
        if( isDefined( searchDef[0].ReferenceIndex ) ) ControlGroupType = new MonitoredItem( mI_BaseObjectType.References.ReferenceDescriptions[searchDef[0].ReferenceIndex].NodeId.NodeId );
    }
    // Find and initialize all instances of type 'ControlGroupType'
    if( isDefined( ControlGroupType ) ) results = FindAndInitializeAllNodesOfType( { Type: ControlGroupType } );
    else addWarning( "GetControlGroupInstancesWithNestedControlGroups():\nType definition of 'ControlGroupType' not found in server, therefore no instances of this type can be browsed." );
    // Find nested ControlGroups and filter results by existence of at least one
    for( var i=0; i<results.length; i++ ) {
        var children = GetChildNodes( results[i] );
        results[i].NestedControlGroups = [];
        // Find a child of 'ControlGroupType'
        for( c=0; c<children.length; c++ ) {
            var type = GetTypeDefinitionOfNode( children[c] );
            if( type.equals( ControlGroupType.NodeId ) ) results[i].NestedControlGroups.push( children[c].clone() );
        }
        // If no children of 'ControlGroupType' found, remove result from list
        if( results[i].NestedControlGroups.length == 0 ) { results.splice( i, 1 ); i--; }
    }
    return results;
}

/**
 * Function calls the Verify method of a given FunctionalEntity
 * 
 * @param {object} args - An object containing all parameters
 * @param {MonitoredItem} args.FunctionalEntity - The FunctionalEntity to call the Verify method on
 * @param {UaNodeId|UaNodeId[]} args.NodeIds - (Optional) An array of NodeIds representing the Key.Node parameter of the ExpectedVerificationVariables argument (default=[])
 * @param {Number[]|Number[][]} args.ArrayIndexes - (Optional) An array of ArrayIndex arrays representing the Key.ArrayIndexe parameter of the ExpectedVerificationVariables argument (default=[])
 * @param {UaVariant|UaVariant[]} args.Values - (Optional) An array of variants representing the Value parameter of the ExpectedVerificationVariables argument (default=[])
 * @param {ExpectedAndAcceptedResults} args.ServiceResult - (Optional) The expected ServiceResult (default=Good)
 * @param {ExpectedAndAcceptedResults[]} args.OperationResults - (Optional) The expected OperationResults (default=[Good])
 * 
 * @returns {object} Returns an object containing the property 'success' (boolean), which represents if the call was successful,
 *                   'StatusCode' (OperationResult) and the returned arguments 'VerificationResult' and 'VerificationVariablesErrors'
 */
function callVerifyMethod( args ) {
    if( !isDefined( args ) || args.length < 1 ) throw( "callVerifyMethod(): No args specified" );
    if( !isDefined( args.FunctionalEntity ) ) throw( "callVerifyMethod(): No FunctionalEntity specified" );
    if( !isDefined( args.FunctionalEntity.Verify ) ) throw( "callVerifyMethod(): Defined FunctionalEntity has no Verify method specified" );
    if( !isDefined( args.NodeIds ) ) args.NodeIds = [];
    if( !isDefined( args.NodeIds.length ) ) args.NodeIds = [ args.NodeIds ];
    if( !isDefined( args.Values ) ) args.Values = [];
    if( !isDefined( args.Values.length ) ) args.Values = [ args.Values ];
    if( !isDefined( args.ArrayIndexes ) ) args.ArrayIndexes = [];
    if( !isDefined( args.ArrayIndexes.length ) ) args.ArrayIndexes = [ args.ArrayIndexes ];
    if( !isDefined( args.ServiceResult ) ) args.ServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( !isDefined( args.OperationResults ) ) args.OperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
    if( args.NodeIds.length != args.Values.length ) throw( "callVerifyMethod(): NodeId array and value array are not the same length. NodeIds: " + args.NodeIds.length + ", Values: " + args.Values.length );
    var result = new Object();
    
    // Learn needed StructureDefinitions from Server
    if( !isDefined( UAFXBaseVariables.Structures ) ) initializeUAFXStructures();
    if( isDefined( UAFXBaseVariables.Structures.NodeIdValuePair ) ) {
        var NodeIdValuePair = UaStructureDefinition.FromTypeNodeId( UAFXBaseVariables.Structures.NodeIdValuePair.NodeId );
    }
    else {
        addError( "Failed to call Verify method. NodeIdValuePair type missing in server." );
        return false;
    }

    // Construct the InputArguments
    var ExpectedVerificationVariables = new UaExtensionObjects();
    for( var i=0; i<args.NodeIds.length; i++ ) {
        var NodeId = ( isDefined( args.NodeIds[i].IdentifierType ) && isDefined( args.NodeIds[i].NamespaceIndex ) ) ? UaVariant.New( { Type: BuiltInType.NodeId, Value: args.NodeIds[i] } ) : args.NodeIds[i];
        var ArrayIndex = ( isDefined( args.ArrayIndexes[i] ) ) ? UaVariant.New( { Type: BuiltInType.UInt32, Value: args.ArrayIndexes[i], Array: true } ) : null;
        var Value = ( isDefined( args.Values[i].Value ) ) ? args.Values[i].Value : args.Values[i];
        ExpectedVerificationVariables[i] = UaGenericStructureValue.New( {
            StructureDefinition: NodeIdValuePair,
            Fields: [
                UaGenericStructureValue.New( { // Key
                    StructureDefinition: NodeIdValuePair.child(0).structureDefinition(),
                    Fields: [
                        NodeId,    // Node
                        ArrayIndex // ArrayIndex
                    ]
                } ),
                Value // Value
            ]
        } ).toExtensionObject();
    }
    
    if( CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: args.FunctionalEntity.Verify.NodeId,
            ObjectId: args.FunctionalEntity.NodeId,
            InputArguments: UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: ExpectedVerificationVariables, Array: true } )
        } ] ,
        ServiceResult: args.ServiceResult,
        OperationResults: args.OperationResults
    } ) ) {
        result.success = true;
        result.StatusCode = CallHelper.Response.Results[0].StatusCode;
        if( isDefined( CallHelper.Response.Results[0].OutputArguments ) ) {
            if( !CallHelper.Response.Results[0].OutputArguments[0].isEmpty() ) {
                result.VerificationResult = CallHelper.Response.Results[0].OutputArguments[0].toInt32();
            }
            if( !CallHelper.Response.Results[0].OutputArguments[1].isEmpty() ) {
                result.VerificationVariablesErrors = CallHelper.Response.Results[0].OutputArguments[1].toStatusCodeArray();
            }
        }
    }
    else result.success = false;
    
    return( result );
}

/**
 * Function calls the EstablishConnections method of a given AutomationComponent with the CommandMask set to ReserveCommunicationIdsCmd<br>
 * providing the argument ReserveCommunicationIds as an array of PubSubReserveCommunicationIdsResultDataType with a single element
 * 
 * @param {object} args - An object containing all parameters
 * @param {MonitoredItem} args.AutomationComponent - The AutomationComponent initialized with initializeStandardVariables() method to call the EstablishConnections method on
 * @param {string} args.TransportProfileUri - (Optional) The TransportProfileUri parameter (default="http://opcfoundation.org/UA-Profile/Transport/pubsub-udp-uadp")
 * @param {Number} args.NumReqWriterGroupIds - (Optional) The NumReqWriterGroupIds parameter (default=1)
 * @param {Number} args.NumReqDataSetWriterIds - (Optional) The NumReqDataSetWriterIds parameter (default=1)
 * 
 * @returns {object} Returns an object containing the property 'success' (boolean), which represents if the call was successful,
 *                   'StatusCode' (OperationResult) and the returned 'ReserveCommunicationIdsResults' argument
 */
function callEstablishConnectionsMethod_ReserveCommunicationIdsCmd( args ) {
    if( !isDefined( args ) || args.length < 1 ) throw( "callEstablishConnectionsMethod_ReserveCommunicationIdsCmd(): No args specified" );
    if( !isDefined( args.AutomationComponent ) ) throw( "callEstablishConnectionsMethod_ReserveCommunicationIdsCmd(): No AutomationComponent specified" );
    if( !isDefined( args.TransportProfileUri ) ) args.TransportProfileUri = "http://opcfoundation.org/UA-Profile/Transport/pubsub-udp-uadp";
    if( !isDefined( args.NumReqWriterGroupIds ) ) args.NumReqWriterGroupIds = 1;
    if( !isDefined( args.NumReqDataSetWriterIds ) ) args.NumReqDataSetWriterIds = 1;
    if( !isDefined( args.ServiceResult ) ) args.ServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( !isDefined( args.OperationResults ) ) args.OperationResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
    
    var result = new Object();
    
    // Learn needed StructureDefinitions from Server
    if( !isDefined( UAFXBaseVariables.Structures ) ) initializeUAFXStructures();
    if( isDefined( UAFXBaseVariables.Structures.ReserveCommunicationIdsDataType.PubSubReserveCommunicationIdsDataType ) ) {
        var PubSubReserveCommunicationIdsDataType = UaStructureDefinition.FromTypeNodeId( UAFXBaseVariables.Structures.ReserveCommunicationIdsDataType.PubSubReserveCommunicationIdsDataType.NodeId );
    }
    else {
        addError( "Failed to call EstablishConnections method. PubSubReserveCommunicationIdsDataType missing in server." );
        return false;
    }
    if( isDefined( UAFXBaseVariables.Structures.ReserveCommunicationIdsResultDataType.PubSubReserveCommunicationIdsResultDataType ) ) {
        var PubSubReserveCommunicationIdsResultDataType = UaStructureDefinition.FromTypeNodeId( UAFXBaseVariables.Structures.ReserveCommunicationIdsResultDataType.PubSubReserveCommunicationIdsResultDataType.NodeId );
    }
    else {
        addError( "Failed to call EstablishConnections method. PubSubReserveCommunicationIdsResultDataType missing in server." );
        return false;
    }

    // Construct the InputArguments
    var CommandMask = 64; // ReserveCommunicationIdsCmd = true
    var emptyExtensionObjectArray = UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: new UaExtensionObjects(), Array: true } ); // empty ExtensionObject array
    
    var ReserveCommunicationIds = new UaExtensionObjects(1);
    ReserveCommunicationIds[0] = UaGenericStructureValue.New( {
        StructureDefinition: PubSubReserveCommunicationIdsDataType,
        Fields: [
            UaVariant.New( { Type: BuiltInType.String, Value: args.TransportProfileUri } ),
            UaVariant.New( { Type: BuiltInType.UInt16, Value: args.NumReqWriterGroupIds } ),
            UaVariant.New( { Type: BuiltInType.UInt16, Value: args.NumReqDataSetWriterIds } )
        ]
    } ).toExtensionObject();

    var inputArguments = [ 
        UaVariant.New( { Type: BuiltInType.UInt32, Value: CommandMask } ), // CommandMask
        emptyExtensionObjectArray, // AssetVerifications (shall be empty array)
        emptyExtensionObjectArray, // ConnectionEndpointConfigurations (shall be empty array)
        UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: ReserveCommunicationIds, Array: true } ), // ReserveCommunicationIds
        emptyExtensionObjectArray  // CommunicationConfigurations (shall be empty array)
    ];
    
    if( CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: args.AutomationComponent.EstablishConnections.NodeId,
            ObjectId: args.AutomationComponent.NodeId,
            InputArguments: inputArguments
        } ],
        ServiceResult: args.ServiceResult,
        OperationResults: args.OperationResults
    } ) ) {
        result.success = true;
        result.StatusCode = CallHelper.Response.Results[0].StatusCode;
        if( isDefined( CallHelper.Response.Results[0].OutputArguments ) ) {
            if( !CallHelper.Response.Results[0].OutputArguments[2].isEmpty() ) {
                result.ReserveCommunicationIdsResults = [];
                var extObjArray = CallHelper.Response.Results[0].OutputArguments[2].toExtensionObjectArray();
                for( var i=0; i<extObjArray.length; i++ ) {
                    var resultExtObj = new UaGenericStructureValue( extObjArray[i], PubSubReserveCommunicationIdsResultDataType )
                    result.ReserveCommunicationIdsResults.push( {
                        Result:             resultExtObj.value(0).toStatusCode(),
                        DefaultPublisherId: resultExtObj.value(1),
                        WriterGroupIds:     resultExtObj.value(2).toUInt16Array(),
                        DataSetWriterIds:   resultExtObj.value(3).toUInt16Array()
                    } );
                }
            }
        }
    }
    else result.success = false;
    
    return( result );
}

/**
 * Function calls the SetStoredVariables method of a given ConfigurationDataFolderType instance
 * 
 * @param {MonitoredItem} configurationDataFolder - The ConfigurationDataFolderType instance to call SetStoredVariables on
 * @param {NodeId[]} variablesToStore - The VariablesToStore parameter (default=empty array)
 * @param {ExpectedAndAcceptedResults} serviceResult - Expected ServiceResult (default=Good)
 * @param {ExpectedAndAcceptedResults[]} operationResults - Expected OperationResults (default=[Good])
 * 
 * @returns {object} Returns an object containing the property 'success' (boolean), which represents if the call was successful,
 *                   'OperationResult' and the returned 'Results' StatusCode array
 */
function callSetStoredVariablesMethod( configurationDataFolder, variablesToStore, serviceResult, operationResults ) {
    if( !isDefined( configurationDataFolder ) ) throw( "callSetStoredVariablesMethod(): No ConfigurationDataFolderType instance specified" );
    if( !isDefined( configurationDataFolder.NodeId ) ) throw( "callSetStoredVariablesMethod(): ConfigurationDataFolderType instance appears to be no MonitoredItem" );
    if( !isDefined( variablesToStore ) ) variablesToStore = [];
    if( !isDefined( serviceResult ) ) var serviceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( !isDefined( operationResults ) ) var operationResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
    
    var result = new Object();
    
    // convert NodeId[] to UaNodeIds
    var variablesToStoreArray = new UaNodeIds();
    for( var v=0; v<variablesToStore.length; v++ ) variablesToStoreArray[v] = variablesToStore[v];
    
    if( !isDefined( configurationDataFolder.SetStoredVariables ) ) {
        addError( "Unable to call SetStoredVariables method: ConfigurationDataFolderType instance '" + configurationDataFolder.NodeId + "' does not expose the SetStoredVariables method" );
        return { success: false };
    }
    
    if( CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: configurationDataFolder.SetStoredVariables.NodeId,
            ObjectId: configurationDataFolder.NodeId,
            InputArguments: UaVariant.New( { Type: BuiltInType.NodeId, Value: variablesToStoreArray, Array: true } )
        } ] ,
        ServiceResult: serviceResult,
        OperationResults: operationResults
    } ) ) {
         result.success = true;
         if( CallHelper.Response.Results[0].StatusCode.isGood() ) {
             result.OperationResult = CallHelper.Response.Results[0].StatusCode;
             if( !CallHelper.Response.Results[0].OutputArguments[0].isEmpty() ) {
                 result.Results = CallHelper.Response.Results[0].OutputArguments[0].toStatusCodeArray();
                 result.success = true;
             }
             else {
                 addError( "Received an empty result for 'Results' on calling SetStoredVariables method ('" + configurationDataFolder.SetStoredVariables.NodeId + "')" );
                 result.success = false;
             }
         }
    }
    else result.success = false;
    
    return( result );
}

/**
 * Function calls the ClearStoredVariables method of a given ConfigurationDataFolderType instance
 * 
 * @param {MonitoredItem} configurationDataFolder - The ConfigurationDataFolderType instance to call ClearStoredVariables on
 * @param {NodeId[]} variablesToClear - The VariablesToClear parameter (default=empty array)
 * @param {ExpectedAndAcceptedResults} serviceResult - Expected ServiceResult (default=Good)
 * @param {ExpectedAndAcceptedResults[]} operationResults - Expected OperationResults (default=[Good])
 * 
 * @returns {object} Returns an object containing the property 'success' (boolean), which represents if the call was successful,
 *                   'OperationResult' and the returned 'Results' StatusCode array
 */
function callClearStoredVariablesMethod( configurationDataFolder, variablesToClear, serviceResult, operationResults ) {
    if( !isDefined( configurationDataFolder ) ) throw( "callClearStoredVariablesMethod(): No ConfigurationDataFolderType instance specified" );
    if( !isDefined( configurationDataFolder.NodeId ) ) throw( "callClearStoredVariablesMethod(): ConfigurationDataFolderType instance appears to be no MonitoredItem" );
    if( !isDefined( variablesToClear ) ) variablesToClear = [];
    if( !isDefined( serviceResult ) ) var serviceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( !isDefined( operationResults ) ) var operationResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
    
    var result = new Object();
    
    // convert NodeId[] to UaNodeIds
    var variablesToClearArray = new UaNodeIds();
    for( var v=0; v<variablesToClear.length; v++ ) variablesToClearArray[v] = variablesToClear[v];
    
    if( !isDefined( configurationDataFolder.ClearStoredVariables ) ) {
        addError( "Unable to call ClearStoredVariables method: ConfigurationDataFolderType instance '" + configurationDataFolder.NodeId + "' does not expose the ClearStoredVariables method" );
        return { success: false };
    }
    
    if( CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: configurationDataFolder.ClearStoredVariables.NodeId,
            ObjectId: configurationDataFolder.NodeId,
            InputArguments: UaVariant.New( { Type: BuiltInType.NodeId, Value: variablesToClearArray, Array: true } )
        } ] ,
        ServiceResult: serviceResult,
        OperationResults: operationResults
    } ) ) {
         result.success = true;
         if( CallHelper.Response.Results[0].StatusCode.isGood() ) {
             result.OperationResult = CallHelper.Response.Results[0].StatusCode;
             if( !CallHelper.Response.Results[0].OutputArguments[0].isEmpty() ) {
                 result.Results = CallHelper.Response.Results[0].OutputArguments[0].toStatusCodeArray();
                 result.success = true;
             }
             else {
                 addError( "Received an empty result for 'Results' on calling ClearStoredVariables method ('" + configurationDataFolder.ClearStoredVariables.NodeId + "')" );
                 result.success = false;
             }
         }
    }
    else result.success = false;
    
    return( result );
}

/**
 * Function calls the ListStoredVariables method of a given ConfigurationDataFolderType instance
 * 
 * @param {MonitoredItem} configurationDataFolder - The ConfigurationDataFolderType instance to call ListStoredVariables on
 * @param {ExpectedAndAcceptedResults} serviceResult - Expected ServiceResult (default=Good)
 * @param {ExpectedAndAcceptedResults[]} operationResults - Expected OperationResults (default=[Good])
 * 
 * @returns {object} Returns an object containing the property 'success' (boolean), which represents if the call was successful,
 *                   'OperationResult' and the returned 'StoredVariables' NodeIdValuePair (UaGenericStructureValue) array
 */
function callListStoredVariablesMethod( configurationDataFolder, serviceResult, operationResults ) {
    if( !isDefined( configurationDataFolder ) ) throw( "callListStoredVariablesMethod(): No ConfigurationDataFolderType instance specified" );
    if( !isDefined( configurationDataFolder.NodeId ) ) throw( "callListStoredVariablesMethod(): ConfigurationDataFolderType instance appears to be no MonitoredItem" );
    if( !isDefined( serviceResult ) ) var serviceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( !isDefined( operationResults ) ) var operationResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
    
    var result = new Object();
    
    if( !isDefined( configurationDataFolder.ListStoredVariables ) ) {
        addError( "Unable to call ListStoredVariables method: ConfigurationDataFolderType instance '" + configurationDataFolder.NodeId + "' does not expose the ListStoredVariables method" );
        return { success: false };
    }
    
    // Learn needed StructureDefinitions from Server
    if( !isDefined( UAFXBaseVariables.Structures ) ) initializeUAFXStructures();
    if( isDefined( UAFXBaseVariables.Structures.NodeIdValuePair ) ) {
        var NodeIdValuePair = UaStructureDefinition.FromTypeNodeId( UAFXBaseVariables.Structures.NodeIdValuePair.NodeId );
    }
    else {
        addError( "Failed to call Verify method. NodeIdValuePair type missing in server." );
        return false;
    }
    
    if( CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: configurationDataFolder.ListStoredVariables.NodeId,
            ObjectId: configurationDataFolder.NodeId,
            InputArguments: []
        } ] ,
        ServiceResult: serviceResult,
        OperationResults: operationResults
    } ) ) {
         result.success = true;
         if( CallHelper.Response.Results[0].StatusCode.isGood() ) {
             result.OperationResult = CallHelper.Response.Results[0].StatusCode;
             if( !CallHelper.Response.Results[0].OutputArguments[0].isEmpty() ) {
                result.StoredVariables = [];
                var extObjArray = CallHelper.Response.Results[0].OutputArguments[0].toExtensionObjectArray();
                var nodeIdValuePair = new UaGenericStructureValue( extObjArray[i], NodeIdValuePair );
                for( var i=0; i<extObjArray.length; i++ ) {
                    var key = nodeIdValuePair.genericStructure(0);
                    result.StoredVariables.push( {
                        Key: {
                            Node: key.value(0).toNodeId(),
                            ArrayIndex: key.value(1).toUInt32Array()
                        },
                        Value: nodeIdValuePair.value(1)
                    } );
                }
                result.success = true;
             }
             else {
                 addError( "Received an empty result for 'StoredVariables' on calling ListStoredVariables method ('" + configurationDataFolder.ListStoredVariables.NodeId + "')" );
                 result.success = false;
             }
         }
    }
    else result.success = false;
    
    return( result );
}

/**
 * Function returns all Variables of an instance (referenced with Organizes reference) having AccessLevelEx.NonVolatile bit not set
 * 
 * @param {MonitoredItem} parent - The parent instance to return Variables from
 * 
 * @returns {MonitoredItem[]} Returns all found child nodes of the given parent node having no NonVoltile bit set
 */
function GetAllVolatileVariables( parent ) {
    if( !isDefined( parent ) ) throw( "GetAllVolatileVariables(): No parent instance specified" );
    if( !isDefined( parent.NodeId ) ) throw( "GetAllVolatileVariables(): Parent instance appears to be no MonitoredItem" );
    if( !isDefined( serviceResult ) ) var serviceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( !isDefined( operationResults ) ) var operationResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
    var results = [];
    var children = GetChildNodesByReferenceTypeId( parent, new UaNodeId( Identifier.Organizes ) );
    for( var i=0; i<children.length; i++ ) {
        if( children[i].NodeClass == NodeClass.Variable ) {
            children[i].AttributeId = Attribute.AccessLevelEx;
            if( ReadHelper.Execute( { NodesToRead: children[i], OperationResults: new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadAttributeIdInvalid ) } ) ){
                if( ReadHelper.Response.Results[0].StatusCode.StatusCode != StatusCode.BadAttributeIdInvalid ) {
                    if( ( children[i].Value.Value.toUInt32() & 2048 ) == 0 ) results.push( children[i].clone() ); // 2048: NonVolatile bit
                }
                else results.push( children[i].clone() );
            }
        }
    }
    return( results );
}

/**
 * Function returns all Variables of an instance (referenced with Organizes reference) having the AccessLevelEx.NonVolatile bit set
 * 
 * @param {MonitoredItem} parent - The parent instance to return Variables from
 * 
 * @returns {MonitoredItem[]} Returns all found child nodes of the given parent node having the NonVolatile bit set
 */
function GetAllNonVolatileVariables( parent ) {
    if( !isDefined( parent ) ) throw( "GetAllNonVolatileVariables(): No parent instance specified" );
    if( !isDefined( parent.NodeId ) ) throw( "GetAllNonVolatileVariables(): Parent instance appears to be no MonitoredItem" );
    if( !isDefined( serviceResult ) ) var serviceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( !isDefined( operationResults ) ) var operationResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
    var results = [];
    var children = GetChildNodesByReferenceTypeId( parent, new UaNodeId( Identifier.Organizes ) );
    for( var i=0; i<children.length; i++ ) {
        if( children[i].NodeClass == NodeClass.Variable ) {
            children[i].AttributeId = Attribute.AccessLevelEx;
            if( ReadHelper.Execute( { NodesToRead: children[i], OperationResults: new ExpectedAndAcceptedResults( StatusCode.Good, StatusCode.BadAttributeIdInvalid ) } ) ){
                if( ReadHelper.Response.Results[0].StatusCode.StatusCode != StatusCode.BadAttributeIdInvalid ) {
                    if( ( children[i].Value.Value.toUInt32() & 2048 ) == 2048 ) results.push( children[i].clone() ); // 2048: NonVolatile bit
                }
            }
        }
    }
    return( results );
}

/**
 * Function recursively browses all nodes of a given FunctionalEntity and returns<br> 
 * all Variables matching a set of criteria
 * 
 * @param {object} args - An object containing all parameters
 * @param {MonitoredItem} args.StartingNode - The FunctionalEntity to get all variables from.
 * @param {Number[]} args.ExcludeDataTypes - (Optional) A set of DataTypes (Identifiers) to exclude from the results (default=[])
 * @param {boolean} args.Nested - (Optional) Defines if only top level variables(FALSE), only nested variables(TRUE) or both(undefined) shall be in the results (default=undefined)
 * @param {Number} args.ValueRank - (Optional) Desired ValueRank of the variables
 * @param {Number} args.DataType - (Optional) Desired DataType of the variables
 * 
 * @returns {MonitoredItem[]} Returns all found child nodes of the given StartingNode matching the given criteria
 */
function GetVariablesFromFunctionalEntity( args ) {
    if( !isDefined( args ) ) throw( "GetVariablesFromFunctionalEntity(): No args specified" );
    if( !isDefined( args.StartingNode ) ) throw( "GetVariablesFromFunctionalEntity(): No StartingNode specified" );
    if( !isDefined( args.ExcludeDataTypes ) ) args.ExcludeDataTypes = [];
    if( !isDefined( args.ExcludeDataTypes.length ) ) args.ExcludeDataTypes = [ args.ExcludeDataTypes ];
    var result = [];
    var children = GetChildNodes( args.StartingNode );
    for( var c=0; c<children.length; c++ ) {
        if( children[c].NodeClass != NodeClass.Variable || !isDefined( args.Nested ) || args.Nested === true ) {
            var subnodes = GetVariablesFromFunctionalEntity( {
                StartingNode: children[c],
                Nested: args.Nested,
                ValueRank: args.ValueRank,
                DataType: args.DataType,
                ExcludeDataTypes: args.ExcludeDataTypes,
                ParentNodeClass: children[c].NodeClass
            } );
            for( var s=0; s<subnodes.length; s++ ) result.push( subnodes[s] );
        }
        if( children[c].NodeClass == NodeClass.Variable ) {
            // check ValueRank
            children[c].AttributeId = Attribute.ValueRank;
            if( isDefined( args.ValueRank ) && ReadHelper.Execute( { NodesToRead: children[c], SuppressMessages: true } ) ) {
                if( children[c].Value.Value.toInt32() != args.ValueRank ) continue;
            }
            children[c].AttributeId = Attribute.Value;
            if( ( isDefined( args.DataType ) || args.ExcludeDataTypes.length > 0 ) && ReadHelper.Execute( { NodesToRead: children[c], SuppressMessages: true } ) ) {
                // check DataType
                if( isDefined( args.DataType ) && children[c].Value.Value.DataType != args.DataType ) continue;
                // check ExcludeDataTypes
                var isToExclude = false;
                for( var d=0; d<args.ExcludeDataTypes.length; d++ ) if( children[c].Value.Value.DataType == args.ExcludeDataTypes[d] ) { isToExclude = true; break; };
                if( isToExclude ) continue;
            }
            // check Nested
            if( isDefined( args.Nested ) && args.Nested === true && isDefined( args.ParentNodeClass ) && args.ParentNodeClass != NodeClass.Variable ) continue;
            // if matching criteria, add child to result
            result.push( children[c] );
        }
    }
    return result;
}

/**
 * Function reads the values of InputVariables and OutputVariables of a ConnectionEndpointType instance
 * 
 * @param {MonitoredItem} connectionEndpointInstance - The ConnectionEndpoint to read the InputVariables and OutputVariables from. (Must be initialized with SetAllChildren_recursive())
 * 
 * @returns {object} Returns an object including members 'InputVariables (UaNodeId[])' and 'OutputVariables (UaNodeId[])'
 */
function GetConnectionEnpointVariables( connectionEndpointInstance ) {
    if( !isDefined( connectionEndpointInstance ) ) throw( "GetConnectionEnpointVariables(): No ConnectionEndpoint instance defined" );
    var result = new Object();
    result.InputVariables = [];
    result.OutputVariables = [];
    // InputVariables
    if( isDefined( connectionEndpointInstance.InputVariables ) ) {
        if( ReadHelper.Execute( { NodesToRead: connectionEndpointInstance.InputVariables, SuppressMessages: true } ) ) {
            if( !connectionEndpointInstance.InputVariables.Value.Value.isEmpty() ) {
                result.InputVariables = connectionEndpointInstance.InputVariables.Value.Value.toNodeIdArray();
            }
        }
    }
    // OutputVariables
    if( isDefined( connectionEndpointInstance.OutputVariables ) ) {
        if( ReadHelper.Execute( { NodesToRead: connectionEndpointInstance.OutputVariables, SuppressMessages: true } ) ) {
            if( !connectionEndpointInstance.OutputVariables.Value.Value.isEmpty() ) {
                result.OutputVariables = connectionEndpointInstance.OutputVariables.Value.Value.toNodeIdArray();
            }
        }
    }
    return( result );
}

/**
 * Function calls the VerifyAsset method of a given FxAssetType instance
 * 
 * @param {object} args - An object containing all parameters
 * @param {MonitoredItem} args.FxAssetTypeInstance - The FxAssetType instance to call the VerifyAsset method on
 * @param {Number} args.VerificationMode - (Optional) VerificationMode parameter (default=0(AssetCompatibility))
 * @param {UaKeyValuePairs} args.ExpectedVerificationVariables - (Optional) ExpectedVerificationVariables parameter (default=empty)
 * @param {object[]} args.ExpectedAdditionalVerificationVariables - (Optional) ExpectedAdditionalVerificationVariables parameter (default=empty)
 *
 * @returns {object} Returns an object containing the property 'success' (boolean), which represents if the call was successful,
 *                   'StatusCode' (OperationResult) and the returned 'AssetVerificationResult'
 */
function callVerifyAssetMethod( args ) {
    if( !isDefined( args ) || args.length < 1 ) throw( "callVerifyAssetMethod(): No args specified" );
    if( !isDefined( args.FxAssetTypeInstance ) ) throw( "callVerifyAssetMethod(): No FxAssetType instance specified" );
    if( !isDefined( args.FxAssetTypeInstance.VerifyAsset ) ) throw( "callVerifyAssetMethod(): Provided FxAssetType instance does not expose the VerifyAsset method" );
    if( !isDefined( args.VerificationMode ) ) args.VerificationMode = AssetVerificationMode.AssetCompatibility;
    if( !isDefined( args.ExpectedVerificationVariables ) ) args.ExpectedVerificationVariables = new UaKeyValuePairs();
    if( !isDefined( args.ExpectedAdditionalVerificationVariables ) ) args.ExpectedAdditionalVerificationVariables = [];
    if( !isDefined( args.ArrayIndexes ) ) args.ArrayIndexes = [];
    if( !isDefined( args.ServiceResult ) ) args.ServiceResult = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( !isDefined( args.OperationResults ) ) args.OperationResults = [new ExpectedAndAcceptedResults( StatusCode.Good )];
    
    var result = new Object();
    result.AssetVerificationResults = null;
    result.VerificationVariablesErrors = null;
    result.VerificationAdditionalVariablesErrors = null;
    result.success = true;
    
    // Learn needed StructureDefinitions
    if( !isDefined( UAFXBaseVariables.Structures ) ) initializeUAFXStructures();
    // KeyValuePair
    var KeyValuePair = UaStructureDefinition.FromTypeNodeId( new UaNodeId( Identifier.KeyValuePair ) );
    if( KeyValuePair === false ) {
        addError( "Failed to call VerifyAsset method. Could not load StructureDefinition of 'KeyValuePair'." );
        return false;
    }
    // NodeIdValuePair
    if( isDefined( UAFXBaseVariables.Structures.NodeIdValuePair ) ) {
        var NodeIdValuePair = UaStructureDefinition.FromTypeNodeId( UAFXBaseVariables.Structures.NodeIdValuePair.NodeId );
    }
    else {
        addError( "Failed to call VerifyAsset method. Structure type 'NodeIdValuePair' missing in server." );
        return false;
    }

    // Construct the InputArguments
    var ExpectedVerificationVariables = new UaExtensionObjects();
    for( var i=0; i<args.ExpectedVerificationVariables.length; i++ ) {
        ExpectedVerificationVariables[i] = UaGenericStructureValue.New( {
            StructureDefinition: KeyValuePair,
            Fields: [
                UaVariant.New( { Type: BuiltInType.QualifiedName, Value: args.ExpectedVerificationVariables[i].Key } ),
                args.ExpectedVerificationVariables[i].Value
            ]
        } ).toExtensionObject();
    }
    
    var ExpectedAdditionalVerificationVariables = new UaExtensionObjects();
    for( var i=0; i<args.ExpectedAdditionalVerificationVariables.length; i++ ) {
        ExpectedAdditionalVerificationVariables[i] = UaGenericStructureValue.New( {
            StructureDefinition: NodeIdValuePair,
            Fields: [
                UaGenericStructureValue.New( {
                    StructureDefinition: NodeIdValuePair.child(0).structureDefinition(),
                    Fields: [
                        UaVariant.New( { Type: BuiltInType.NodeId, Value: args.ExpectedAdditionalVerificationVariables[i].Key } ),
                        ( isDefined( args.ArrayIndexes[i] ) ? UaVariant.New( { Type: BuiltInType.UInt32, Value: args.ArrayIndexes[i] } ) : undefined )
                    ]
                } ),
                args.ExpectedAdditionalVerificationVariables[i].Value
            ]
        } ).toExtensionObject();
    }
    
    var inputArguments = [ 
        UaVariant.New( { Type: BuiltInType.Int32, Value: args.VerificationMode } ), // VerificationMode
        UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: ExpectedVerificationVariables, Array: true } ), // ExpectedVerificationVariables
        UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: ExpectedAdditionalVerificationVariables, Array: true } ) // ExpectedAdditionalVerificationVariables
    ];
    
    if( CallHelper.Execute( { 
        MethodsToCall: [ { 
            MethodId: args.FxAssetTypeInstance.VerifyAsset.NodeId,
            ObjectId: args.FxAssetTypeInstance.NodeId,
            InputArguments: inputArguments
        } ],
        ServiceResult: args.ServiceResult,
        OperationResults: args.OperationResults
    } ) ) {
        if( !CallHelper.Response.Results[0].OutputArguments[0].isEmpty() ) 
            result.VerificationResult = CallHelper.Response.Results[0].OutputArguments[0].toInt32();
        if( !CallHelper.Response.Results[0].OutputArguments[1].isEmpty() ) 
            result.VerificationVariablesErrors = CallHelper.Response.Results[0].OutputArguments[1].toStatusCodeArray();
        if( !CallHelper.Response.Results[0].OutputArguments[2].isEmpty() ) 
            result.VerificationAdditionalVariablesErrors = CallHelper.Response.Results[0].OutputArguments[2].toStatusCodeArray();
    }
    else result.success = false;
    
    result.ServiceResult = CallHelper.Response.ResponseHeader.ServiceResult;
    result.OperationResult = CallHelper.Response.Results[0].StatusCode;
    
    return( result );
}

function isCommandBundleRequiredSet( AC ) {
    if( isDefined( AC ) ) {
        if( isDefined( AC.ComponentCapabilities ) ) {
            if( isDefined( AC.ComponentCapabilities.CommandBundleRequired ) ) {
                if( !ReadHelper.Execute( { NodesToRead: AC.ComponentCapabilities.CommandBundleRequired } ) ) return false;
                if( AC.ComponentCapabilities.CommandBundleRequired.Value.Value.toBoolean() == true ) return true;
            }
        }
        else addError( "AutomationComponent '" + AC.NodeId + "' is missing mandatory ComponentCapabilities folder" );
    }
    else addError( "isCommandBundleRequiredSet(): AutomationComponent not defined" );
    
    return false;
}

function isFeedbackSignalRequiredSet( FE ) {
    if( isDefined( FE ) ) {
        if( isDefined( FE.Capabilities ) ) {
            if( isDefined( FE.Capabilities.FeedbackSignalRequired ) ) {
                if( !ReadHelper.Execute( { NodesToRead: FE.Capabilities.FeedbackSignalRequired } ) ) return false;
                if( FE.Capabilities.FeedbackSignalRequired.Value.Value.toBoolean() == true ) return true;
            }
        }
        else addLog( "FunctionalEntity '" + FE.NodeId + "' is missing optional Capabilities folder" );
    }
    else addError( "isFeedbackSignalRequiredSet(): FunctionalEntity not defined" );
    
    return false;
}

function isSupportsPersistenceSet( AC ) {
    if( isDefined( AC ) ) {
        if( isDefined( AC.ComponentCapabilities ) ) {
            if( isDefined( AC.ComponentCapabilities.SupportsPersistence ) ) {
                if( !ReadHelper.Execute( { NodesToRead: AC.ComponentCapabilities.SupportsPersistence } ) ) return false;
                if( AC.ComponentCapabilities.SupportsPersistence.Value.Value.toBoolean() == true ) return true;
            }
        }
        else addError( "AutomationComponent '" + AC.NodeId + "' is missing mandatory ComponentCapabilities folder" );
    }
    else addError( "isSupportsPersistenceSet(): AutomationComponent not defined" );
    
    return false;
}

function AssertConnectionEndpointValues( args ) {
    var bResult = true;
    
    // Verify InputVariableIds
    if( isDefined( args.InputVariableIds ) ) {
        var inputVariables = GetTargetNode( {
            SourceNode: args.ConnectionEndpoint,
            TargetNodeName: UaQualifiedName.New( {
                Name: "InputVariables",
                NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex
            } ),
            ReferenceTypeId: new UaNodeId( Identifier.HasComponent )
        } );
        
        if( isDefined( inputVariables ) ) {
            if( ReadHelper.Execute( { NodesToRead: inputVariables } ) ) {
                var inputVariables_value = inputVariables.Value.Value.toNodeIdArray();
                if( isDefined( inputVariables_value ) ) {
                    // Check values match the value used to create the ConnectionEndpoint
                    for( var a=0; a<args.InputVariableIds.length; a++ ) {
                        if( !Assert.Equal( args.InputVariableIds[a], inputVariables_value[a], "Received unexpected value in InputVariables '" + inputVariables.NodeId + "' on index " + a ) ) bResult = false;
                    }
                }
                else {
                    addError( "AssertConnectionEndpointValues(): Could not get value of InputVariables '" + inputVariables.NodeId + "'." );
                    bResult = false;
                }
            }
            else bResult = false;
        }
        else {
            addError( "AssertConnectionEndpointValues(): Could not find InputVariables component on node '" + connectionEndpointId + "'." );
            bResult = false;
        }
    }
    
    // Verify OuputVariableIds
    if( isDefined( args.OutputVariableIds ) ) {
        var outputVariables = GetTargetNode( {
            SourceNode: args.ConnectionEndpoint,
            TargetNodeName: UaQualifiedName.New( {
                Name: "OutputVariables",
                NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex
            } ),
            ReferenceTypeId: new UaNodeId( Identifier.HasComponent )
        } );
        
        if( isDefined( outputVariables ) ) {
            if( ReadHelper.Execute( { NodesToRead: outputVariables } ) ) {
                var outputVariables_value = outputVariables.Value.Value.toNodeIdArray();
                if( isDefined( outputVariables_value ) ) {
                    // Check values match the value used to create the ConnectionEndpoint
                    for( var a=0; a<args.OutputVariableIds.length; a++ ) {
                        if( !Assert.Equal( args.OutputVariableIds[a], outputVariables_value[a], "Received unexpected value in OutputVariables '" + outputVariables.NodeId + "' on index " + a ) ) bResult = false;
                    }
                }
                else {
                    addError( "AssertConnectionEndpointValues(): Could not get value of OutputVariables '" + outputVariables.NodeId + "'." );
                    bResult = false;
                }
            }
            else bResult = false;
        }
        else {
            addError( "AssertConnectionEndpointValues(): Could not find OuputVariables component on node '" + connectionEndpointId + "'." );
            bResult = false;
        }
    }
    
    // Verify IsPersistent
    if( isDefined( args.IsPersistent ) ) {
        var isPersistent = GetTargetNode( {
            SourceNode: args.ConnectionEndpoint,
            TargetNodeName: UaQualifiedName.New( {
                Name: "IsPersistent",
                NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex
            } ),
            ReferenceTypeId: new UaNodeId( Identifier.HasComponent )
        } );
        
        if( isDefined( isPersistent ) ) {
            if( ReadHelper.Execute( { NodesToRead: isPersistent } ) ) {
                var isPersistent_value = isPersistent.Value.Value.toBoolean();
                if( isDefined( isPersistent_value ) ) {
                    // Check values match the value used to create the ConnectionEndpoint
                    if( !Assert.Equal( args.IsPersistent, isPersistent_value, "Received unexpected value for IsPersistent '" + isPersistent.NodeId + "'" ) ) bResult = false;
                }
                else {
                    addError( "AssertConnectionEndpointValues(): Could not get value of IsPersistent '" + isPersistent.NodeId + "'." );
                    bResult = false;
                }
            }
            else bResult = false;
        }
        else {
            addError( "AssertConnectionEndpointValues(): Could not find IsPersistent component on node '" + connectionEndpointId + "'." );
            bResult = false;
        }
    }
    
    // Verify CleanupTimeout
    if( isDefined( args.CleanupTimeout ) ) {
        var cleanupTimeout = GetTargetNode( {
            SourceNode: args.ConnectionEndpoint,
            TargetNodeName: UaQualifiedName.New( {
                Name: "CleanupTimeout",
                NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex
            } ),
            ReferenceTypeId: new UaNodeId( Identifier.HasComponent )
        } );
        
        if( isDefined( cleanupTimeout ) ) {
            if( ReadHelper.Execute( { NodesToRead: cleanupTimeout } ) ) {
                var cleanupTimeout_value = cleanupTimeout.Value.Value.toDouble();
                if( isDefined( cleanupTimeout_value ) ) {
                    // Check values match the value used to create the ConnectionEndpoint
                    if( !Assert.Equal( args.CleanupTimeout, cleanupTimeout_value, "Received unexpected value for CleanupTimeout '" + cleanupTimeout.NodeId + "'" ) ) bResult = false;
                }
                else {
                    addError( "AssertConnectionEndpointValues(): Could not get value of CleanupTimeout '" + cleanupTimeout.NodeId + "'." );
                    bResult = false;
                }
            }
            else bResult = false;
        }
        else {
            addError( "AssertConnectionEndpointValues(): Could not find CleanupTimeout component on node '" + connectionEndpointId + "'." );
            bResult = false;
        }
    }
    
    // Verify RelatedEndpoint
    if( isDefined( args.RelatedEndpoint ) ) {
        var relatedEndpoint = GetTargetNode( {
            SourceNode: args.ConnectionEndpoint,
            TargetNodeName: UaQualifiedName.New( {
                Name: "RelatedEndpoint",
                NamespaceIndex: UAFXBaseVariables.FXACNamespaceIndex
            } ),
            ReferenceTypeId: new UaNodeId( Identifier.HasComponent )
        } );
        
        if( isDefined( relatedEndpoint ) ) {
            if( ReadHelper.Execute( { NodesToRead: relatedEndpoint } ) ) {
                // Decode relatedEnpoint structure
                var RelatedEndpointDataType = UaStructureDefinition.FromTypeNodeId( UAFXBaseVariables.Structure.RelatedEndpointDataType.NodeId );
                var relatedEndpointValue = new UaGenericStructureValue( relatedEndpoint.Value.Value.toExtensionObject(), RelatedEndpointDataType );
                if( isDefined( relatedEndpointValue ) ) {
                    // Check values match the value used to create the ConnectionEndpoint
                    if( !Assert.Equal( args.RelatedEndpoint.Address, relatedEndpointValue.value(0), "Received unexpected value for Field 'Address' of value attribute of node '" + relatedEndpoint.NodeId + "'" ) ) bResult = false;
                    if( Assert.Equal( args.RelatedEndpoint.ConnectionEndpointPath.length, relatedEndpointValue.genericStructureArray(1).length(), "Received unexpected length for Field 'ConnectionEndpointPath' of value attribute of node '" + relatedEndpoint.NodeId + "'" ) ) {
                        for( var a=0; a<args.RelatedEndpoint.ConnectionEndpointPath; a++ ) {
                            if( !Assert.Equal( args.RelatedEndpoint.ConnectionEndpointPath[a].NamespaceUri, UaGenericStructureArray.Get( relatedEndpointValue.genericStructureArray(1), a ).value(0), "Received unexpected value for Field 'NamespaceUri' of value attribute of node '" + relatedEndpoint.NodeId + "' on index " + a ) ) bResult = false;
                            if( !Assert.Equal( args.RelatedEndpoint.ConnectionEndpointPath[a].Name, UaGenericStructureArray.Get( relatedEndpointValue.genericStructureArray(1), a ).value(1), "Received unexpected value for Field 'Name' of value attribute of node '" + relatedEndpoint.NodeId + "' on index " + a ) ) bResult = false;
                        }
                    } else bResult = false;
                    if( !Assert.Equal( args.RelatedEndpoint.ConnectionEndpointName, relatedEndpointValue.value(2), "Received unexpected value for Field 'ConnectionEndpointName' of value attribute of node '" + relatedEndpoint.NodeId + "'" ) ) bResult = false;
                }
                else {
                    addError( "AssertConnectionEndpointValues(): Error decoding structure value of RelatedEndpoint '" + relatedEndpoint.NodeId + "'." );
                    bResult = false;
                }
            }
            else bResult = false;
        }
        else {
            addError( "AssertConnectionEndpointValues(): Could not find RelatedEndpoint component on node '" + connectionEndpointId + "'." );
            bResult = false;
        }
    }
    
    return bResult;
}

function GetParentAutomationComponent( functionalEntity ) {
    var result = null;
    if( isDefined( functionalEntity ) && !functionalEntity.NodeId.equals( new UaNodeId() ) ) {
        var functionalEntityFolder = GetParentNode( functionalEntity );
        if( isDefined( functionalEntityFolder ) && !functionalEntityFolder.NodeId.equals( new UaNodeId() ) ) {
            var parentAutomationComponent = GetParentNode( functionalEntityFolder );
            if( isDefined( parentAutomationComponent ) && !parentAutomationComponent.NodeId.equals( new UaNodeId() ) ) {
                result = parentAutomationComponent;
            }
        }
    }
    return result;
}

function GetDynamicConnectionEndpointsSettings( args ) {
    if( !isDefined( args ) ) throw( "GetDynamicConnectionEndpointsSettings(): No args defined" );
    if( !isDefined( args.FunctionalEntities ) ) addWarning( "GetDynamicConnectionEndpointsSettings(): No FunctionalEntities defined" );
    if( !isDefined( args.FunctionalEntities.length ) ) args.FunctionalEntities = [ args.FunctionalEntities ];
    
    var results = [];
    
    for( var f=0; f<args.FunctionalEntities.length; f++ ) {
        
        // Get FunctionalEntity
        result = new MonitoredItem( args.FunctionalEntities[f].NodeId );
        SetAllChildren_recursive( result );
        
        // Get parent AutomationComponent
        result.AutomationComponent = GetParentAutomationComponent( args.FunctionalEntities[f] );
        if( !isDefined( result.AutomationComponent ) ) {
            addError( "GetDynamicConnectionEndpointsSettings(): Could not find parent AutomationComponent for FunctionalEntity '" + args.FunctionalEntities[f].NodeId + "'. Skipping FunctionalEntity." );
            continue;
        }
        SetAllChildren_recursive( result.AutomationComponent );
        
        // Check if AC supports persistence
        result.IsPersistent = false;
        var supportsPersistence = isSupportsPersistenceSet( result.AutomationComponent );
        if( isDefined( args.SupportsPersistence ) ) {
            if( args.SupportsPersistence != supportsPersistence ) {
                addLog( "GetDynamicConnectionEndpointsSettings(): Persistence support of AutomationComponent of FunctionalEntity '" + args.FunctionalEntities[f].NodeId + "' does not fit argument SupportsPersistence (" + args.SupportsPersistence + "). Skipping FunctionalEntity." );
                continue;
            }
            result.IsPersistent = args.SupportsPersistence;
        }
        
        // Get InputVariableIds
        if( isDefined( args.FunctionalEntities[f].InputData ) ) {
            var inputVariables = GetVariablesFromFunctionalEntity( {
                StartingNode: args.FunctionalEntities[f].InputData,
                Nested: false
            } );
            if( inputVariables.length == 0 ) {
                addLog( "GetDynamicConnectionEndpointsSettings(): FunctionalEntity '" + args.FunctionalEntities[f].NodeId + "' has no variables in its InputData folder. Skipping FunctionalEntity." );
                continue;
            }
            result.InputVariableIds = new UaNodeIds();
            for( var n=0; n<inputVariables.length; n++ ) result.InputVariableIds[n] = inputVariables[n].NodeId.clone();
        }
        else {
            addLog( "GetDynamicConnectionEndpointsSettings(): FunctionalEntity '" + args.FunctionalEntities[f].NodeId + "' is missing InputData folder. Skipping FunctionalEntity." );
            continue;
        }
        
        // Get OutputVariableIds
        if( isDefined( args.FunctionalEntities[f].OutputData ) ) {
            var outputVariables = GetVariablesFromFunctionalEntity( {
                StartingNode: args.FunctionalEntities[f].OutputData,
                Nested: false
            } );
            if( outputVariables.length == 0 ) {
                addLog( "GetDynamicConnectionEndpointsSettings(): FunctionalEntity '" + args.FunctionalEntities[f].NodeId + "' has no variables in its OutputData folder. Skipping FunctionalEntity." );
                continue;
            }
            result.OutputVariableIds = new UaNodeIds();
            for( var n=0; n<outputVariables.length; n++ ) result.OutputVariableIds[n] = outputVariables[n].NodeId.clone();
        }
        else {
            addLog( "GetDynamicConnectionEndpointsSettings(): FunctionalEntity '" + args.FunctionalEntities[f].NodeId + "' is missing OutputData folder. Skipping FunctionalEntity." );
            continue;
        }
        
        // Set CleanupTimeout
        result.CleanupTimeout = 0;
        
        // Set CTT RelatedEndpoint
        result.RelatedEndpoint = CTTRelatedEndpointData;
        
        // FunctionalEntity is fitting -> Add to results
        results.push( result );
            
    }

    return results;
}

function ReadConnectionEndpointData( connectionEndpoint ) {
    if( !isDefined( connectionEndpoint ) )  throw( "ReadConnectionEndpointData(): No ConnecionEndpoint item defined" );
    
    var result = {
        ParentAutomationComponent: null,
        ParentFunctionalEntity: null,
        Name: "",
        Status: 0,
        RelatedEndpoint: {
            Address: "",
            ConnectionEndpointPath: [],
            ConnectionEndpointName: ""
        },
        InputVariables: new UaNodeIds(),
        OutputVariables: new UaNodeIds(),
        IsPersistent: false,
        CleanupTimeout: 0,
        Mode: 0
    };
    
    SetAllChildren_recursive( connectionEndpoint );
    
    // Get BrowseName
    connectionEndpoint.AttributeId = Attribute.BrowseName;
    if( ReadHelper.Execute( { NodesToRead: connectionEndpoint } ) ) {
        result.Name = connectionEndpoint.Value.Value.toQualifiedName().Name;
    }
    else {
        addError( "ReadConnectionEndpointData(): Failed to read BrowseName attribute of ConnectionEndpoint '" + connectionEndpoint.NodeId + "'." );
        return null;
    }
    
    // Get parent FunctionalEntity
    result.ParentFunctionalEntity = GetParentFunctionalEntity( connectionEndpoint );
    SetAllChildren_recursive( result.ParentFunctionalEntity );
    
    // Get parent AutomationComponent
    result.ParentAutomationComponent = GetParentAutomationComponent( result.ParentFunctionalEntity );
    SetAllChildren_recursive( result.ParentAutomationComponent );
    
    // Read Status
    if( isDefined( connectionEndpoint.Status ) ) {
        if( ReadHelper.Execute( { NodesToRead: connectionEndpoint.Status } ) ) {
            result.Status = connectionEndpoint.Status.Value.Value.toInt32();
        }
        else {
            addError( "ReadConnectionEndpointData(): Failed to read mandatory variable Status of ConnectionEndpoint '" + connectionEndpoint.NodeId + "'." );
            return null;
        }
    }
    else {
        addError( "ReadConnectionEndpointData(): Mandatory variable Status does not exist in ConnectionEndpoint '" + connectionEndpoint.NodeId + "'." );
        return null;
    }
    
    // Read RelatedEndpoint
    if( isDefined( connectionEndpoint.RelatedEndpoint ) ) {
        if( ReadHelper.Execute( { NodesToRead: connectionEndpoint.RelatedEndpoint } ) ) {
            // Decode relatedEnpoint structure
            var RelatedEndpointDataType = UaStructureDefinition.FromTypeNodeId( UAFXBaseVariables.Structure.RelatedEndpointDataType.NodeId );
            var relatedEndpointValue = new UaGenericStructureValue( connectionEndpoint.RelatedEndpoint.Value.Value.toExtensionObject(), RelatedEndpointDataType );
            if( isDefined( relatedEndpointValue ) ) {
                
                result.RelatedEndpoint.Address = relatedEndpointValue.value(0);
                
                for( var a=0; a<relatedEndpointValue.genericStructureArray(1).length(); a++ ) {
                    result.RelatedEndpoint.ConnectionEndpointPath.push( new Object() );
                    result.RelatedEndpoint.ConnectionEndpointPath[a].NamespaceUri = UaGenericStructureArray.Get( relatedEndpointValue.genericStructureArray(1), a ).value(0);
                    result.RelatedEndpoint.ConnectionEndpointPath[a].Name         = UaGenericStructureArray.Get( relatedEndpointValue.genericStructureArray(1), a ).value(1);
                }
                
                result.RelatedEndpoint.ConnectionEndpointName = relatedEndpointValue.value(2);
                
            }
            else {
                addError( "ReadConnectionEndpointData(): Failed to decode mandatory variable RelatedEndpoint of ConnectionEndpoint '" + connectionEndpoint.NodeId + "'." );
                return null;
            }
        }
        else {
            addError( "ReadConnectionEndpointData(): Failed to read mandatory variable RelatedEndpoint of ConnectionEndpoint '" + connectionEndpoint.NodeId + "'." );
            return null;
        }
    }
    else {
        addError( "ReadConnectionEndpointData(): Mandatory variable RelatedEndpoint does not exist in ConnectionEndpoint '" + connectionEndpoint.NodeId + "'." );
        return null;
    }
    
    // Read InputVariables
    if( isDefined( connectionEndpoint.InputVariables ) ) {
        if( ReadHelper.Execute( { NodesToRead: connectionEndpoint.InputVariables } ) ) {
            result.InputVariables = connectionEndpoint.InputVariables.Value.Value.toNodeIdArray();
        }
        else {
            addError( "ReadConnectionEndpointData(): Failed to read variable InputVariables of ConnectionEndpoint '" + connectionEndpoint.NodeId + "'." );
            return null;
        }
    }
    
    // Read OutputVariables
    if( isDefined( connectionEndpoint.OutputVariables ) ) {
        if( ReadHelper.Execute( { NodesToRead: connectionEndpoint.OutputVariables } ) ) {
            result.OutputVariables = connectionEndpoint.OutputVariables.Value.Value.toNodeIdArray();
        }
        else {
            addError( "ReadConnectionEndpointData(): Failed to read variable OutputVariables of ConnectionEndpoint '" + connectionEndpoint.NodeId + "'." );
            return null;
        }
    }
    
    // Read IsPersistent
    if( isDefined( connectionEndpoint.IsPersistent ) ) {
        if( ReadHelper.Execute( { NodesToRead: connectionEndpoint.IsPersistent } ) ) {
            result.IsPersistent = connectionEndpoint.IsPersistent.Value.Value.toBoolean();
        }
        else {
            addError( "ReadConnectionEndpointData(): Failed to read mandatory variable IsPersistent of ConnectionEndpoint '" + connectionEndpoint.NodeId + "'." );
            return null;
        }
    }
    else {
        addError( "ReadConnectionEndpointData(): Mandatory variable IsPersistent does not exist in ConnectionEndpoint '" + connectionEndpoint.NodeId + "'." );
        return null;
    }
    
    // Read CleanupTimeout
    if( isDefined( connectionEndpoint.CleanupTimeout ) ) {
        if( ReadHelper.Execute( { NodesToRead: connectionEndpoint.CleanupTimeout } ) ) {
            result.CleanupTimeout = connectionEndpoint.CleanupTimeout.Value.Value.toDouble();
        }
        else {
            addError( "ReadConnectionEndpointData(): Failed to read mandatory variable CleanupTimeout of ConnectionEndpoint '" + connectionEndpoint.NodeId + "'." );
            return null;
        }
    }
    else {
        addError( "ReadConnectionEndpointData(): Mandatory variable CleanupTimeout does not exist in ConnectionEndpoint '" + connectionEndpoint.NodeId + "'." );
        return null;
    }
    
    // Read Mode
    if( isDefined( connectionEndpoint.Mode ) ) {
        if( ReadHelper.Execute( { NodesToRead: connectionEndpoint.Mode } ) ) {
            result.Mode = connectionEndpoint.Mode.Value.Value.toUInt32();
        }
        else {
            addError( "ReadConnectionEndpointData(): Failed to read variable Mode of ConnectionEndpoint '" + connectionEndpoint.NodeId + "'." );
            return null;
        }
    }
    
    return result;
}

function GetParentFunctionalEntity( connectionEndpoint ) {
    var result = null;
    if( isDefined( connectionEndpoint ) && !connectionEndpoint.NodeId.equals( new UaNodeId() ) ) {
        var connectionEndpointFolder = GetParentNode( connectionEndpoint );
        if( isDefined( connectionEndpointFolder ) && !connectionEndpointFolder.NodeId.equals( new UaNodeId() ) ) {
            var parentFunctionalEntity = GetParentNode( connectionEndpointFolder );
            if( isDefined( parentFunctionalEntity ) && !parentFunctionalEntity.NodeId.equals( new UaNodeId() ) ) {
                result = parentFunctionalEntity;
            }
        }
    }
    return result;
}