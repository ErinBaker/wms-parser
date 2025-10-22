# WFS GetCapabilities Parser Implementation

## Overview

This implementation provides a comprehensive WFS (Web Feature Service) GetCapabilities XML parser that extracts all relevant data according to the JSON schema specification. The parser filters and displays only WFS layers that meet these requirements:

1. **GeoJSON output format available** - Checked in `Parameter name="outputFormat"`
2. **EPSG:4326 default CRS** - Handles various formats including `urn:ogc:def:crs:EPSG::4326`

## Architecture

### TypeScript Types (`src/types.ts`)

Added comprehensive types matching the JSON schema:

- `WFSCapabilities` - Root object containing all parsed data
- `WFSServiceInfo` - Service identification (type, title, versions, etc.)
- `WFSProvider` - Provider information and contact details
- `WFSOperation` - Operations with methods (GET/POST) and parameters
- `WFSFeatureType` - Feature types with CRS, bounding boxes, metadata
- `WFSEndpoints` - Service endpoint URLs
- `WFSValidation` - EPSG support flags
- `WFSError` - Error collection for parsing issues

### Parser Implementation (`src/utils/wfsParser.ts`)

#### Main Function

```typescript
parseWFSCapabilities(xmlDoc: Document): WFSCapabilities
```

This is the primary entry point that returns the complete capabilities object.

#### Key Features

1. **CRS Normalization**
   - Handles URN format: `urn:ogc:def:crs:EPSG::4326` → `EPSG:4326`
   - Handles HTTP format: `http://www.opengis.net/def/crs/EPSG/0/4326` → `EPSG:4326`
   - Supports CRS84 (WGS84) recognition

2. **Operations Parsing**
   - Extracts all operations (GetCapabilities, DescribeFeatureType, GetFeature, etc.)
   - Parses GET and POST methods with URLs
   - Extracts parameters including:
     - `outputFormats` - Available output formats
     - `srsNames` - Supported spatial reference systems
     - `resultType` - Result type options
     - `countSupported` - Pagination support

3. **Feature Type Parsing**
   - Extracts name, title, abstract
   - Parses defaultCRS and otherCRS
   - Extracts WGS84 bounding boxes (lowerCorner, upperCorner)
   - Parses metadata URLs
   - Associates output formats (global or per-feature-type)

4. **Filtering Logic**
   - Only returns feature types that support BOTH:
     - GeoJSON output format (checks for "geojson", "json", or "application/json")
     - EPSG:4326 CRS (in defaultCRS or otherCRS)

5. **Version Compatibility**
   - Supports WFS 1.x (FeatureType, Service elements)
   - Supports WFS 2.x (wfs:FeatureType, ows:ServiceIdentification)

### UI Components

#### WFSCapabilitiesDisplay (`src/components/WFSCapabilitiesDisplay.tsx`)

Comprehensive display component showing:

1. **Service Information**
   - Title, abstract, keywords
   - Service type and versions
   - Fees and access constraints
   - Provider details and contact info
   - Validation status (EPSG:4326, EPSG:3857 support)

2. **Operations Section**
   - Lists all available operations
   - Shows GET/POST methods with URLs
   - Displays parameters (output formats, SRS names)
   - Highlights GeoJSON formats in green

3. **Compatible Feature Types**
   - Shows only filtered layers (GeoJSON + EPSG:4326)
   - Displays bounding boxes with coordinates
   - Shows metadata URLs
   - Lists all CRS options
   - Highlights compatibility status

4. **Service Endpoints**
   - Base URL
   - GetFeature endpoint
   - DescribeFeatureType endpoint

5. **Error Display**
   - Shows parsing warnings if any

## Integration

The XMLParser component (`src/components/XMLParser.tsx`) has been updated to:

1. Use `parseWFSCapabilities()` for detailed view (default)
2. Maintain legacy parsers for backward compatibility
3. Display comprehensive data using `WFSCapabilitiesDisplay`

## Usage

### Parsing a WFS Capabilities Document

```typescript
import { parseWFSCapabilities } from './utils/wfsParser';

const xmlDoc = parseXMLDocument(xmlText);
const capabilities = parseWFSCapabilities(xmlDoc);

console.log('Service:', capabilities.service);
console.log('Compatible Layers:', capabilities.featureTypes);
console.log('Operations:', capabilities.operations);
```

### Filtering Criteria

The parser automatically filters feature types. A layer is included if:

```typescript
// Must support EPSG:4326
const allCRS = [ft.defaultCRS, ...ft.otherCRS];
const supportsEPSG4326 = allCRS.some(crs => 
  crs.includes('4326') || crs.includes('CRS84')
);

// Must support GeoJSON
const outputFormats = ft.outputFormats || globalOutputFormats;
const supportsGeoJSON = outputFormats.some(format =>
  format.toLowerCase().includes('geojson') ||
  format.toLowerCase().includes('json') ||
  format === 'application/json'
);

return supportsEPSG4326 && supportsGeoJSON;
```

## Example Output

For a WFS service, the parser returns:

```json
{
  "service": {
    "type": "WFS",
    "title": "My WFS Service",
    "versions": ["2.0.0"],
    "abstract": "...",
    "keywords": ["..."]
  },
  "provider": {
    "name": "Organization Name",
    "site": "https://example.com",
    "contact": { ... }
  },
  "operations": [
    {
      "name": "GetFeature",
      "methods": [
        { "type": "GET", "url": "https://..." },
        { "type": "POST", "url": "https://..." }
      ],
      "parameters": {
        "outputFormats": ["application/json", "application/gml+xml"],
        "srsNames": ["EPSG:4326", "EPSG:3857"]
      }
    }
  ],
  "featureTypes": [
    {
      "name": "namespace:LayerName",
      "title": "Layer Title",
      "defaultCRS": "EPSG:4326",
      "wgs84BoundingBox": {
        "lowerCorner": [-180, -90],
        "upperCorner": [180, 90]
      },
      "outputFormats": ["application/json"]
    }
  ],
  "endpoints": {
    "base": "https://example.com/wfs",
    "getFeature": "https://example.com/wfs?",
    "describeFeatureType": "https://example.com/wfs?"
  },
  "validation": {
    "supportsEPSG4326": true,
    "supportsEPSG3857": true
  }
}
```

## Features

✅ Comprehensive parsing matching JSON schema  
✅ Filters for GeoJSON + EPSG:4326 compatibility  
✅ Handles WFS 1.x and 2.x formats  
✅ Normalizes CRS identifiers (URN, HTTP formats)  
✅ Extracts bounding boxes  
✅ Parses operations and parameters  
✅ Builds endpoint URLs  
✅ Rich UI display with all parsed data  
✅ Backward compatible with existing code  

## Files Modified

1. `src/types.ts` - Added comprehensive WFS types
2. `src/utils/wfsParser.ts` - Complete rewrite with schema-compliant parser
3. `src/components/WFSCapabilitiesDisplay.tsx` - New comprehensive display component
4. `src/components/WFSFeatureTypeList.tsx` - Minor enhancements
5. `src/components/XMLParser.tsx` - Integration with new parser

## Testing

Build successful with no TypeScript errors:
```bash
npm run build
✓ 1485 modules transformed.
✓ built in 2.64s
```

## Next Steps

To test with a real WFS service, use a GetCapabilities URL like:
```
https://example.com/wfs?service=WFS&version=2.0.0&request=GetCapabilities
```

The parser will automatically:
1. Extract all service metadata
2. Find all feature types supporting GeoJSON
3. Filter to only those with EPSG:4326 support
4. Display comprehensive information about compatible layers
