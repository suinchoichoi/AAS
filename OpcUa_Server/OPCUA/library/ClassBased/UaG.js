function GetMethodParent( methodNodeId ) {
    // array of types that COULD be used to reference a method
    var referenceTypes = [ new UaNodeId( Identifier.HasComponent ),
                           new UaNodeId( Identifier.HasOrderedComponent ),
                           new UaNodeId( Identifier.Organizes ) ];
    var parentObject = null;
    methodNodeId.BrowseDirection = BrowseDirection.Inverse;
    if( BrowseHelper.Execute( { NodesToBrowse: methodNodeId, SuppressMessaging: true } ) ) {   // browse our method node for inverse references
        for( var t=0; t<referenceTypes.length; t++ ) {                                         // iterate thru each of our acceptable reference types
            for( var i=0; i<BrowseHelper.Response.Results.length; i++ ) {                          // iterate thru all browse results
                if( BrowseHelper.Response.Results[i].StatusCode.isGood() ) {                       // we care for good results only
                    for( var r=0; r<BrowseHelper.Response.Results[i].References.length; r++ ) {    // iterate thru all returned references for *this* result
                        if( BrowseHelper.Response.Results[i].References[r].ReferenceTypeId.equals( referenceTypes[t] ) ) { // HasComponent?
                           parentObject = MonitoredItem.fromNodeIds( BrowseHelper.Response.Results[i].References[r].NodeId.NodeId )[0]; // capture the parent object
                            break;                                                                       // exit this inner loop; outer loop exited next.
                        }    
                    }// for r...
                }// is good
                if( parentObject !== null ) break;                                                       // escape the loop if the object is defined
            }//for i...
        }//for r...
    }// browse
    return( parentObject );
}

/**
 * Function to create a new UaGenericStructureArray object of an array of UaGenericStructureValues
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaStructureDefinition} args.StructureDefinition - (Required) The StructureDefinition to use
 * @param {UaGenericStructureValue[]} args.GenericStructureValues - (Optional) Array of the GenericStructureValues to set.
 *
 * @returns {UaGenericStructureArray} Returns the created UaGenericStructureArray.
 */
UaGenericStructureArray.New = function( args ) {
    if( !isDefined( args ) ) throw( "UaGenericStructureArray.New(): No args defined" );
    if( !isDefined( args.StructureDefinition ) ) throw( "UaGenericStructureArray.New(): args.StructureDefinition not defined" );
    if( !isDefined( args.GenericStructureValues ) ) args.GenericStructureValues = [];
    if( !isDefined( args.GenericStructureValues.length ) ) args.GenericStructureValues = [ args.GenericStructureValues ];
    if( !isDefined( args.StructureDefinition.childrenCount ) ) throw( "UaGenericStructureArray.New(): Defined StructureDefinition does not appear to be of type UaStructureDefinition" );
    var ExtObjArray = new UaExtensionObjects( args.GenericStructureValues.length );
    for( var i=0; i<args.GenericStructureValues.length; i++ ) ExtObjArray[i] = args.GenericStructureValues[i].toExtensionObject();
    var VariantArray = UaVariant.New( { Type: BuiltInType.ExtensionObject, Value: ExtObjArray, Array: true } );
    return new UaGenericStructureArray( VariantArray, args.StructureDefinition );
}

/**
 * Function to get a UaGenericStructureValue object from an UaGenericStructureArray
 * 
 * @param {UaGenericStructureArray} array - UaGenericStructureArray to get the element from
 * @param {Number} index - Index of the UaGenericStructureValue to get from the array
 *
 * @returns {UaGenericStructureValue} Returns the UaGenericStructureValue at the specified index.
 */
UaGenericStructureArray.Get = function( array, index ) {
    var variant = array.toVariant();
    if( !variant.isEmpty() ) {
        var extensionObjectArray = variant.toExtensionObjectArray();
        if( extensionObjectArray.length >= index ) {
            var definition = array.getDefinition();
            if( isDefined( definition ) ) {
                return new UaGenericStructureValue( extensionObjectArray[index], definition );
            }
        }
    }
    return new UaGenericStructureValue();
}

/**
 * Function to create a new UaGenericStructureValue/UaGenericUnionValue given a StructureDefinition and Field values to set
 * 
 * @param {object} args - An object containing all parameter
 * @param {UaStructureDefinition} args.StructureDefinition - (Required) The StructureDefinition to use
 * @param {object[]} args.Fields - (Optional) Array of Fields to set. The values must be of type UaVariant, UaGenericStructureValue, UaGenericUnionValue or UaGenericStructureArray. Values to be skipped can be null.
 * @param {boolean} args.IsUnion - (Optional) Indicates the value is a Union (the last set index will be used as switch value, unused fields shall be null) (default=FALSE)
 *
 * @returns {UaGenericStructureValue|UaGenericUnionValue} Returns the created UaGenericStructureValue or UaGenericUnionValue if IsUnion is set to TRUE.
 */
UaGenericStructureValue.New = function( args ) {
    if( !isDefined( args ) ) throw( "UaGenericStructureValue.New(): No args defined" );
    if( !isDefined( args.StructureDefinition ) ) throw( "UaGenericStructureValue.New(): args.StructureDefinition not defined" );
    if( args.Fields == null || args.Fields == undefined ) args.Fields = [];
    if( !isDefined( args.Fields.length ) ) args.Fields = [ args.Fields ];
    if( !isDefined( args.StructureDefinition.childrenCount ) ) throw( "UaGenericStructureValue.New(): Defined StructureDefinition does not appear to be of type UaStructureDefinition" );
    if( !isDefined( args.IsUnion ) ) args.IsUnion = false;
    if( !args.IsUnion ) {
        // as UaGenericStructureValue
        var result = new UaGenericStructureValue( args.StructureDefinition );
        for( var i=0; i<args.Fields.length; i++ ) {
            if( isDefined( args.Fields[i] ) ) {
                if( isDefined( args.Fields[i].isEmpty ) || isDefined( args.Fields[i].setField ) || isDefined( args.Fields[i].setValue ) || isDefined( args.Fields[i].setGenericValueArray ) ) {
                    var statusCode = result.setField( i, args.Fields[i] );
                    if( !statusCode.isGood() ) addError( "UaGenericStructureValue.New(): Setting Field defined at Fields[" + i + "] returned bad StatusCode: " + statusCode );
                }
                else addError( "UaGenericStructureValue.New(): Field defined at Fields[" + i + "] must be of one of the following types: UaVariant | UaGenericStructureValue | UaGenericUnionValue | UaGenericStructureArray." );
            }
        }
    }
    else {
        // as UaGenericUnionValue
        var result = new UaGenericUnionValue( args.StructureDefinition );
        if( isDefined( args.UnionFieldToSet ) ) {
            if( isDefined( args.UnionFieldToSet.Name ) ) {
                if( isDefined( args.UnionFieldToSet.Value ) ) {
                    if( isDefined( args.UnionFieldToSet.Value.isEmpty ) || isDefined( args.UnionFieldToSet.Value.setField ) || isDefined( args.UnionFieldToSet.Value.setValue ) || isDefined( args.UnionFieldToSet.Value.setGenericValueArray ) ) {
                        var statusCode = result.setValue( args.UnionFieldToSet.Name, args.UnionFieldToSet.Value );
                        if( !statusCode.isGood() ) addError( "UaGenericStructureValue.New(): Setting Field '" + args.UnionFieldToSet.Name + "' returned bad StatusCode: " + statusCode );
                    }
                    else addError( "UaGenericStructureValue.New(): Field defined at Fields[" + i + "] must be of one of the following types: UaVariant | UaGenericStructureValue | UaGenericUnionValue | UaGenericStructureArray." );
                }
                else addLog( "UaGenericStructureValue.New(): UnionFieldToSet.Value is not defined. Nothing will be set." );
            }
            else addLog( "UaGenericStructureValue.New(): UnionFieldToSet.Name is not defined. Nothing will be set." );
        }
        else addLog( "UaGenericStructureValue.New(): IsUnion is set to TRUE, but argument UnionFieldToSet is not defined. Nothing will be set." );
    }
    return result;
}

UaGenericStructureValue.Print = function( value, lineBreaks, indent ) {
    var result = "";
    if( !isDefined( lineBreaks ) ) var lineBreaks = false;
    var lineBreak = lineBreaks ? "\n" : "";
    if( !isDefined( indent ) ) var indent = "";
    if( !lineBreaks ) indent = " ";
    var seperator = ",";
    if( value.definition().isUnion() ) {
        if( value.field().structureDefinition().childrenCount() > 0 ) {
            if( value.field().structureDefinition().isUnion() ) {
                result += indent + value.field().name() + ": {" + lineBreak + UaGenericStructureValue.Print( value.genericUnion(), lineBreaks, indent + "    " ) + lineBreak + indent + " }";
            }
            else {
                if( value.field().arrayType() == 1 ) {
                    result += indent + value.field().name() + ": [ " + ( ( value.genericStructureArray().length() > 0 ) ? lineBreak : "" );
                    for( var a=0; a<value.genericStructureArray().length(); a++ ) {
                        seperator = ( a < value.genericStructureArray().length() - 1 ) ? ", " : "";
                        result += ( lineBreaks ? ( indent + "    " ) : "") + "[" + a + "]: {" + UaGenericStructureValue.Print( UaGenericStructureArray.Get( value.genericStructureArray(), a ), false, indent + "    " ) + " }" + lineBreak;
                    }
                    result += indent + "]";
                }
                else {
                    result += indent + value.field().name() + ": {" + lineBreak + UaGenericStructureValue.Print( value.genericStructure(), lineBreaks, indent + "    " ) + lineBreak + indent +  "}";
                }
            }
        }
        else {
            result += indent + value.field().name() + ": " + value.value() + seperator;
        }
    }
    else {
        for( var i=0; i<value.definition().childrenCount(); i++ ) {
            var lastElement = ( i == value.definition().childrenCount() - 1 ) ? true : false;
            seperator = ( i < value.definition().childrenCount() - 1 ) ? "," : "";
            if( value.definition().child(i).structureDefinition().childrenCount() > 0 ) {
                if( value.definition().child(i).structureDefinition().isUnion() ) {
                    result += indent + value.definition().child(i).name() + ": {" + lineBreak + UaGenericStructureValue.Print( value.genericUnion(i), lineBreaks, indent + "    " ) + lineBreak + " }" + seperator + ( lastElement ? "" : lineBreak );
                }
                else {
                    if( value.definition().child(i).arrayType() == 1 ) {
                        result += indent + value.definition().child(i).name() + ": [ " + ( ( value.genericStructureArray(i).length() > 0 ) ? lineBreak : "" );
                        for( var a=0; a<value.genericStructureArray(i).length(); a++ ) {
                            seperator = ( a < value.genericStructureArray(i).length() - 1 ) ? ", " : "";
                            result += ( lineBreaks ? ( indent + "    " ) : "") + "[" + a + "]: {" + UaGenericStructureValue.Print( UaGenericStructureArray.Get( value.genericStructureArray(i), a ), false, indent + "    " ) + " }" + seperator + lineBreak;
                        }
                        seperator = ( i < value.definition().childrenCount() - 1 ) ? ( "," + lineBreak ) : "";
                        result += indent + "]" + seperator;
                    }
                    else {
                        result += indent + value.definition().child(i).name() + ": {" + lineBreak + UaGenericStructureValue.Print( value.genericStructure(i), lineBreaks, indent + "    " ) + lineBreak + indent +  "}" + seperator + ( lastElement ? "" : lineBreak );
                    }
                }
            }
            else {
                result += indent + value.definition().child(i).name() + ": " + value.value(i) + seperator + ( lastElement ? "" : lineBreak );
            }
        }
    }
    return result;
}