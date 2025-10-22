import { WFSCapabilities } from '../types';

/**
 * Export WFS capabilities to JSON matching the schema specification
 */
export function exportWFSCapabilitiesAsJSON(capabilities: WFSCapabilities): string {
  return JSON.stringify(capabilities, null, 2);
}

/**
 * Download WFS capabilities as JSON file
 */
export function downloadWFSCapabilitiesAsJSON(
  capabilities: WFSCapabilities,
  filename: string = 'wfs-capabilities.json'
): void {
  const json = exportWFSCapabilitiesAsJSON(capabilities);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Copy WFS capabilities JSON to clipboard
 */
export async function copyWFSCapabilitiesToClipboard(
  capabilities: WFSCapabilities
): Promise<void> {
  const json = exportWFSCapabilitiesAsJSON(capabilities);
  await navigator.clipboard.writeText(json);
}

/**
 * Validate WFS capabilities against schema requirements
 */
export function validateWFSCapabilities(capabilities: WFSCapabilities): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!capabilities.service) {
    errors.push('Missing required field: service');
  } else {
    if (capabilities.service.type !== 'WFS') {
      errors.push('service.type must be "WFS"');
    }
    if (!capabilities.service.title) {
      errors.push('Missing required field: service.title');
    }
    if (!capabilities.service.versions || capabilities.service.versions.length === 0) {
      errors.push('Missing required field: service.versions');
    }
  }

  if (!capabilities.provider) {
    errors.push('Missing required field: provider');
  } else {
    if (!capabilities.provider.name) {
      errors.push('Missing required field: provider.name');
    }
  }

  if (!capabilities.operations) {
    errors.push('Missing required field: operations');
  } else if (!Array.isArray(capabilities.operations)) {
    errors.push('operations must be an array');
  } else {
    capabilities.operations.forEach((op, index) => {
      if (!op.name) {
        errors.push(`operations[${index}].name is required`);
      }
      if (!op.methods || !Array.isArray(op.methods)) {
        errors.push(`operations[${index}].methods must be an array`);
      } else {
        op.methods.forEach((method, mIndex) => {
          if (!method.type || !['GET', 'POST'].includes(method.type)) {
            errors.push(`operations[${index}].methods[${mIndex}].type must be "GET" or "POST"`);
          }
          if (!method.url) {
            errors.push(`operations[${index}].methods[${mIndex}].url is required`);
          }
        });
      }
    });
  }

  if (!capabilities.featureTypes) {
    errors.push('Missing required field: featureTypes');
  } else if (!Array.isArray(capabilities.featureTypes)) {
    errors.push('featureTypes must be an array');
  } else {
    capabilities.featureTypes.forEach((ft, index) => {
      if (!ft.name) {
        errors.push(`featureTypes[${index}].name is required`);
      }
      if (!ft.title) {
        errors.push(`featureTypes[${index}].title is required`);
      }
      if (!ft.defaultCRS) {
        errors.push(`featureTypes[${index}].defaultCRS is required`);
      }

      // Validate bounding box if present
      if (ft.wgs84BoundingBox) {
        if (!Array.isArray(ft.wgs84BoundingBox.lowerCorner) ||
            ft.wgs84BoundingBox.lowerCorner.length !== 2) {
          errors.push(`featureTypes[${index}].wgs84BoundingBox.lowerCorner must be [number, number]`);
        }
        if (!Array.isArray(ft.wgs84BoundingBox.upperCorner) ||
            ft.wgs84BoundingBox.upperCorner.length !== 2) {
          errors.push(`featureTypes[${index}].wgs84BoundingBox.upperCorner must be [number, number]`);
        }
      }
    });
  }

  // Validate errors array if present
  if (capabilities.errors) {
    if (!Array.isArray(capabilities.errors)) {
      errors.push('errors must be an array');
    } else {
      capabilities.errors.forEach((err, index) => {
        if (!err.code) {
          errors.push(`errors[${index}].code is required`);
        }
        if (!err.message) {
          errors.push(`errors[${index}].message is required`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get summary statistics from WFS capabilities
 */
export function getWFSCapabilitiesSummary(capabilities: WFSCapabilities): {
  serviceName: string;
  totalOperations: number;
  compatibleFeatureTypes: number;
  supportsEPSG4326: boolean;
  supportsEPSG3857: boolean;
  outputFormats: string[];
  versions: string[];
} {
  // Collect all unique output formats
  const outputFormatsSet = new Set<string>();
  capabilities.operations.forEach(op => {
    op.parameters?.outputFormats?.forEach(format => outputFormatsSet.add(format));
  });
  capabilities.featureTypes.forEach(ft => {
    ft.outputFormats?.forEach(format => outputFormatsSet.add(format));
  });

  return {
    serviceName: capabilities.service.title,
    totalOperations: capabilities.operations.length,
    compatibleFeatureTypes: capabilities.featureTypes.length,
    supportsEPSG4326: capabilities.validation?.supportsEPSG4326 || false,
    supportsEPSG3857: capabilities.validation?.supportsEPSG3857 || false,
    outputFormats: Array.from(outputFormatsSet),
    versions: capabilities.service.versions,
  };
}
